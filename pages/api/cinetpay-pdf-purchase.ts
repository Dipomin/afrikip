import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { customer, items, total } = req.body;

    // Validation
    if (!customer || !items || !total || items.length === 0) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    if (!customer.email || !customer.firstName || !customer.lastName) {
      return res.status(400).json({ error: "Informations client incomplètes" });
    }

    // Générer un ID de transaction unique
    const transactionId = `PDF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Créer la commande dans Firestore
    const orderRef = await addDoc(collection(db, "orders"), {
      transactionId,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        country: customer.country,
      },
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        issueNumber: item.issueNumber,
        coverImageURL: item.coverImageURL,
        pdfURL: item.pdfURL,
        price: item.price,
        year: item.year,
      })),
      total,
      status: "pending",
      paymentMethod: "cinetpay",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Commande créée:", orderRef.id);

    // Préparer la requête CinetPay
    const cinetpayData = {
      apikey: process.env.CINETPAY_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: total,
      currency: "XOF",
      description: `Achat de ${items.length} journal${items.length > 1 ? "x" : ""} PDF - L'Intelligent d'Abidjan`,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      customer_surname: customer.lastName,
      customer_email: customer.email,
      customer_phone_number: customer.phone,
      customer_address: customer.city || "Abidjan",
      customer_city: customer.city || "Abidjan",
      customer_country: "CI", // Code pays Côte d'Ivoire
      customer_state: "CI",
      customer_zip_code: "00225",
      notify_url: `${SITE_URL}/api/cinetpay-pdf-notify`,
      return_url: `${SITE_URL}/order-success?orderId=${orderRef.id}&transactionId=${transactionId}`,
      channels: "MOBILE_MONEY",
      metadata: JSON.stringify({
        orderId: orderRef.id,
        itemCount: items.length,
      }),
    };

    console.log("📤 Envoi requête CinetPay:", {
      transaction_id: transactionId,
      amount: total,
      customer: customer.email,
    });

    // Appeler l'API CinetPay
    const cinetpayResponse = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      cinetpayData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 Réponse CinetPay:", cinetpayResponse.data);

    if (cinetpayResponse.data.code !== "201") {
      throw new Error(
        cinetpayResponse.data.message || "Erreur CinetPay"
      );
    }

    // Retourner l'URL de paiement
    return res.status(200).json({
      success: true,
      orderId: orderRef.id,
      transactionId,
      payment_url: cinetpayResponse.data.data.payment_url,
      payment_token: cinetpayResponse.data.data.payment_token,
    });
  } catch (error: any) {
    console.error("❌ Erreur création paiement:", error);

    return res.status(500).json({
      error: error.message || "Erreur lors de la création du paiement",
      details: error.response?.data || null,
    });
  }
}
