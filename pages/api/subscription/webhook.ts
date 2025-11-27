/**
 * Webhook CinetPay - Notification de paiement
 * Gère les notifications de paiement envoyées par CinetPay
 */

import { NextApiRequest, NextApiResponse } from "next";
import {
  getCinetPayClient,
  CinetPayNotification,
  TRANSACTION_STATUS,
} from "../../../lib/cinetpay";
import { db } from "../../../firebase";
import { doc, updateDoc, getDoc, serverTimestamp, collection, addDoc, Timestamp } from "firebase/firestore";

interface WebhookResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  error?: string;
}

/**
 * Extrait les informations du transaction_id
 */
function parseTransactionId(transactionId: string): {
  plan: string;
  userId: string;
} | null {
  try {
    // Format: SUB-MONTHLY-timestamp-userId
    const parts = transactionId.split("-");
    if (parts.length >= 4 && parts[0] === "SUB") {
      return {
        plan: parts[1].toLowerCase(),
        userId: parts[3],
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Erreur parsing transaction_id:", error);
    return null;
  }
}

/**
 * Calcule la date de fin d'abonnement
 */
function calculateEndDate(duration: number): Date {
  const now = new Date();
  return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
}

/**
 * Active l'abonnement dans Firestore
 */
async function activateSubscription(
  userId: string,
  plan: string,
  transactionId: string,
  amount: number
): Promise<boolean> {
  try {
    // Durées par plan (en jours)
    const durations: Record<string, number> = {
      monthly: 30,
      semiannual: 180,
      annual: 365,
    };

    const duration = durations[plan] || 30;
    const endDate = calculateEndDate(duration);
    const now = new Date();

    console.log("💾 Firestore - Activation abonnement:", {
      userId,
      plan,
      duration,
      endDate,
    });

    // Mettre à jour le document utilisateur
    const userRef = doc(db, "users", userId);

    // Vérifier que l'utilisateur existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error("❌ Utilisateur introuvable:", userId);
      return false;
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || "unknown@afrikipresse.fr";

    // Mettre à jour avec les informations d'abonnement
    await updateDoc(userRef, {
      subscriptionStatus: "active",
      subscriptionType: plan,
      subscriptionStartDate: serverTimestamp(),
      subscriptionEndDate: endDate,
      lastPaymentAmount: amount,
      lastPaymentDate: serverTimestamp(),
      lastTransactionId: transactionId,
      pendingSubscription: null, // Effacer la transaction en attente
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Firestore - Abonnement activé dans users:", {
      userId,
      plan,
      endDate: endDate.toISOString(),
    });

    // 🆕 CRÉER UN DOCUMENT DANS LA COLLECTION SUBSCRIPTIONS
    // Cela permet au dashboard admin d'afficher les abonnements
    const intervalMap: Record<string, "month" | "year" | "semester"> = {
      monthly: "month",
      semiannual: "semester",
      annual: "year",
    };

    const subscriptionData = {
      userId,
      userEmail,
      status: "active" as const,
      amount,
      interval: intervalMap[plan] || "month",
      currency: "XOF",
      method: "cinetpay" as const,
      cinetpayTransactionId: transactionId,
      createdAt: Timestamp.now(),
      currentPeriodStart: Timestamp.now(),
      currentPeriodEnd: Timestamp.fromDate(endDate),
      cancelAtPeriodEnd: false,
      canceledAt: null,
    };

    await addDoc(collection(db, "subscriptions"), subscriptionData);

    console.log("✅ Firestore - Document subscription créé:", {
      userId,
      userEmail,
      amount,
      interval: intervalMap[plan],
    });

    return true;
  } catch (error) {
    console.error("❌ Erreur activation abonnement:", error);
    return false;
  }
}

/**
 * Enregistre le paiement échoué
 */
async function recordFailedPayment(
  userId: string,
  transactionId: string,
  reason: string
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        lastFailedPayment: {
          transactionId,
          reason,
          date: serverTimestamp(),
        },
        pendingSubscription: null,
        updatedAt: serverTimestamp(),
      });

      console.log("📝 Paiement échoué enregistré:", {
        userId,
        transactionId,
        reason,
      });
    }
  } catch (error) {
    console.error("❌ Erreur enregistrement échec:", error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  // Accepter uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée",
    });
  }

  try {
    console.log("🔔 Webhook CinetPay - Notification reçue:", {
      body: req.body,
      headers: {
        "content-type": req.headers["content-type"],
        "user-agent": req.headers["user-agent"],
      },
    });

    // Extraire la notification
    const notification: CinetPayNotification = req.body;

    // Initialiser le client CinetPay
    const cinetpay = getCinetPayClient();

    // Valider la notification
    if (!cinetpay.validateNotification(notification)) {
      console.error("❌ Notification invalide");
      return res.status(400).json({
        success: false,
        message: "Notification invalide",
      });
    }

    const transactionId = notification.cpm_trans_id;

    // Vérifier la transaction auprès de CinetPay
    console.log("🔍 Vérification transaction:", transactionId);
    const verification = await cinetpay.verifyTransaction(transactionId);

    if (!verification.data) {
      console.error("❌ Impossible de vérifier la transaction");
      return res.status(400).json({
        success: false,
        message: "Transaction non vérifiable",
        transaction_id: transactionId,
      });
    }

    // Traiter la notification
    const { isSuccess, amount, status } =
      cinetpay.processNotification(notification);

    console.log("📊 Statut transaction:", {
      transactionId,
      isSuccess,
      amount,
      status,
      verificationStatus: verification.data.status,
    });

    // Parser le transaction_id pour extraire userId et plan
    const parsedData = parseTransactionId(transactionId);
    if (!parsedData) {
      console.error("❌ Format transaction_id invalide:", transactionId);
      return res.status(400).json({
        success: false,
        message: "Format de transaction invalide",
        transaction_id: transactionId,
      });
    }

    const { userId, plan } = parsedData;

    // Si le paiement est accepté
    if (
      isSuccess &&
      (verification.data.status === "ACCEPTED" ||
        verification.data.status === "00")
    ) {
      console.log("✅ Paiement accepté - Activation abonnement");

      // Activer l'abonnement
      const activated = await activateSubscription(
        userId,
        plan,
        transactionId,
        amount
      );

      if (activated) {
        return res.status(200).json({
          success: true,
          message: "Abonnement activé avec succès",
          transaction_id: transactionId,
        });
      } else {
        console.error("❌ Échec activation abonnement");
        return res.status(500).json({
          success: false,
          message: "Échec de l'activation de l'abonnement",
          transaction_id: transactionId,
        });
      }
    }

    // Si le paiement est refusé
    if (status === TRANSACTION_STATUS.REFUSED) {
      console.log("❌ Paiement refusé");

      await recordFailedPayment(
        userId,
        transactionId,
        notification.cpm_error_message || "Paiement refusé"
      );

      return res.status(200).json({
        success: false,
        message: "Paiement refusé",
        transaction_id: transactionId,
      });
    }

    // Statut inconnu ou en attente
    console.log("⏳ Paiement en attente ou statut inconnu:", status);
    return res.status(200).json({
      success: false,
      message: "Paiement en attente de confirmation",
      transaction_id: transactionId,
    });
  } catch (error: any) {
    console.error("❌ Webhook - Erreur traitement:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement de la notification",
      error: error.message,
    });
  }
}

// Configuration Next.js pour désactiver le bodyParser
// CinetPay envoie du JSON brut
export const config = {
  api: {
    bodyParser: true,
  },
};
