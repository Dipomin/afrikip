import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { db } from "../../firebase";
import { doc, updateDoc, getDoc, serverTimestamp, collection, query, where, limit, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { cpm_trans_id, cpm_trans_status } = req.body;

    console.log("🔔 Notification CinetPay reçue:", {
      transaction_id: cpm_trans_id,
      status: cpm_trans_status,
    });

    if (!cpm_trans_id) {
      return res.status(400).json({ error: "Transaction ID manquant" });
    }

    // Vérifier le statut du paiement auprès de CinetPay
    const verificationData = {
      apikey: process.env.CINETPAY_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: cpm_trans_id,
    };

    const verificationResponse = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      verificationData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔍 Vérification CinetPay:", verificationResponse.data);

    if (verificationResponse.data.code !== "00") {
      throw new Error("Échec de la vérification du paiement");
    }

    const paymentData = verificationResponse.data.data;
    const paymentStatus = paymentData.payment_status;

    // Trouver la commande dans Firestore
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("transactionId", "==", cpm_trans_id),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("❌ Commande introuvable:", cpm_trans_id);
      return res.status(404).json({ error: "Commande introuvable" });
    }

    const orderDoc = querySnapshot.docs[0];
    const orderId = orderDoc.id;

    // Mettre à jour le statut de la commande
    const orderRef = doc(db, "orders", orderId);

    if (paymentStatus === "ACCEPTED" || paymentStatus === "00") {
      // Paiement réussi
      await updateDoc(orderRef, {
        status: "paid",
        paymentStatus: "completed",
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cinetpayData: {
          payment_method: paymentData.payment_method,
          operator_id: paymentData.operator_id,
          payment_date: paymentData.payment_date,
        },
      });

      console.log("✅ Commande marquée comme payée:", orderId);

      // TODO: Envoyer email avec liens de téléchargement
      // TODO: Créer des tokens d'accès pour les PDFs

      return res.status(200).json({
        success: true,
        message: "Paiement confirmé",
        orderId,
      });
    } else if (paymentStatus === "REFUSED") {
      // Paiement refusé
      await updateDoc(orderRef, {
        status: "failed",
        paymentStatus: "failed",
        updatedAt: serverTimestamp(),
      });

      console.log("❌ Paiement refusé:", orderId);

      return res.status(200).json({
        success: false,
        message: "Paiement refusé",
        orderId,
      });
    } else {
      // Statut en attente
      await updateDoc(orderRef, {
        status: "pending",
        paymentStatus: paymentStatus,
        updatedAt: serverTimestamp(),
      });

      console.log("⏳ Paiement en attente:", orderId);

      return res.status(200).json({
        success: false,
        message: "Paiement en attente",
        orderId,
      });
    }
  } catch (error: any) {
    console.error("❌ Erreur webhook CinetPay:", error);

    return res.status(500).json({
      error: error.message || "Erreur lors du traitement de la notification",
      details: error.response?.data || null,
    });
  }
}
