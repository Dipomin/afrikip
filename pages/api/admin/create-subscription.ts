/**
 * API Route pour créer une subscription de test manuellement
 * Accessible uniquement aux admins
 */

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase";
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore";

interface CreateSubscriptionRequest {
  userId: string;
  method: "stripe" | "cinetpay";
  interval: "month" | "year" | "semester";
  amount?: number;
  status?: "active" | "inactive" | "trialing" | "canceled" | "past_due";
}

interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  message?: string;
  error?: string;
}

/**
 * Calcule la date de fin selon l'interval
 */
function calculateEndDate(interval: "month" | "year" | "semester"): Date {
  const now = new Date();
  const days = {
    month: 30,
    semester: 180,
    year: 365,
  };

  return new Date(now.getTime() + days[interval] * 24 * 60 * 60 * 1000);
}

/**
 * Montants par défaut selon le plan
 */
function getDefaultAmount(
  interval: "month" | "year" | "semester",
  method: "stripe" | "cinetpay"
): number {
  if (method === "cinetpay") {
    return {
      month: 2000,
      semester: 6500,
      year: 13000,
    }[interval];
  } else {
    return {
      month: 9.99,
      semester: 49.99,
      year: 99.99,
    }[interval];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSubscriptionResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée",
    });
  }

  try {
    const {
      userId,
      method,
      interval,
      amount,
      status = "active",
    }: CreateSubscriptionRequest = req.body;

    // Validation
    if (!userId || !method || !interval) {
      return res.status(400).json({
        success: false,
        error: "Paramètres manquants",
        message: "userId, method et interval sont requis",
      });
    }

    if (!["stripe", "cinetpay"].includes(method)) {
      return res.status(400).json({
        success: false,
        error: "Méthode invalide",
        message: "method doit être 'stripe' ou 'cinetpay'",
      });
    }

    if (!["month", "year", "semester"].includes(interval)) {
      return res.status(400).json({
        success: false,
        error: "Interval invalide",
        message: "interval doit être 'month', 'year' ou 'semester'",
      });
    }

    // Vérifier que l'utilisateur existe
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur introuvable",
        message: `Aucun utilisateur avec l'ID ${userId}`,
      });
    }

    const userData = userDoc.data();
    const userEmail = userData.email || "unknown@afrikipresse.fr";

    // Calculer les dates et montants
    const now = new Date();
    const endDate = calculateEndDate(interval);
    const finalAmount = amount || getDefaultAmount(interval, method);
    const currency = method === "cinetpay" ? "XOF" : "EUR";

    // Préparer les données selon la méthode
    const baseData = {
      userId,
      userEmail,
      status,
      amount: finalAmount,
      interval,
      currency,
      method,
      createdAt: Timestamp.now(),
      currentPeriodStart: Timestamp.now(),
      currentPeriodEnd: Timestamp.fromDate(endDate),
      cancelAtPeriodEnd: false,
      canceledAt: null,
    };

    const subscriptionData =
      method === "cinetpay"
        ? {
            ...baseData,
            cinetpayTransactionId: `MANUAL-SUB-${interval.toUpperCase()}-${Date.now()}-${userId}`,
          }
        : {
            ...baseData,
            stripeSubscriptionId: `sub_manual_${Date.now()}`,
            stripeCustomerId: userData.stripeCustomerId || `cus_manual_${Date.now()}`,
            stripePriceId: `price_manual_${interval}`,
            stripeProductId: "prod_manual_test",
          };

    // Créer le document subscription
    const docRef = await addDoc(
      collection(db, "subscriptions"),
      subscriptionData
    );

    console.log("✅ Subscription manuelle créée:", {
      id: docRef.id,
      userId,
      method,
      interval,
      amount: finalAmount,
    });

    return res.status(201).json({
      success: true,
      subscriptionId: docRef.id,
      message: "Subscription créée avec succès",
    });
  } catch (error: any) {
    console.error("❌ Erreur création subscription:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur interne",
      message: error.message || "Une erreur s'est produite",
    });
  }
}
