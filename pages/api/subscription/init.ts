/**
 * API d'abonnement Afrikipresse
 * Gère l'initialisation des paiements pour tous les plans d'abonnement
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getCinetPayClient, CinetPayCustomer } from "../../../lib/cinetpay";

// Types de plans d'abonnement
export type SubscriptionPlan = "monthly" | "semiannual" | "annual";

// Configuration des plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: "monthly",
    name: "Mensuel",
    amount: 2000, // XOF
    duration: 30, // jours
    durationLabel: "1 mois",
  },
  semiannual: {
    id: "semiannual",
    name: "Semestriel",
    amount: 6500, // XOF
    duration: 180, // jours
    durationLabel: "6 mois",
  },
  annual: {
    id: "annual",
    name: "Annuel",
    amount: 13000, // XOF
    duration: 365, // jours
    durationLabel: "12 mois",
  },
} as const;

// Interface de requête
interface SubscriptionRequest {
  plan: SubscriptionPlan;
  userId: string;
  customer: CinetPayCustomer;
  metadata?: {
    userEmail?: string;
    userName?: string;
    [key: string]: any;
  };
}

// Interface de réponse
interface SubscriptionResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
  message?: string;
}

/**
 * Génère l'URL de base du site
 */
function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NODE_ENV === "production"
    ? "https://afrikipresse.fr"
    : "http://localhost:3000";
}

/**
 * Valide les données client
 */
function validateCustomerData(customer: CinetPayCustomer): {
  valid: boolean;
  error?: string;
} {
  const required = [
    "customer_name",
    "customer_surname",
    "customer_email",
    "customer_phone_number",
    "customer_address",
    "customer_city",
    "customer_country",
  ];

  for (const field of required) {
    if (!customer[field as keyof CinetPayCustomer]) {
      return {
        valid: false,
        error: `Champ requis manquant: ${field}`,
      };
    }
  }

  // Valider le format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer.customer_email)) {
    return {
      valid: false,
      error: "Format d'email invalide",
    };
  }

  // Valider le code pays (2 caractères)
  if (customer.customer_country.length !== 2) {
    return {
      valid: false,
      error: "Code pays invalide (doit être ISO 2 lettres, ex: CI)",
    };
  }

  return { valid: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscriptionResponse>
) {
  // Vérifier la méthode HTTP
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Méthode non autorisée",
      message: "Utilisez POST pour cette requête",
    });
  }

  try {
    // Extraire les données de la requête
    const { plan, userId, customer, metadata }: SubscriptionRequest = req.body;

    // Validation des données
    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        error: "Plan d'abonnement invalide",
        message: "Le plan doit être 'monthly', 'semiannual' ou 'annual'",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "ID utilisateur manquant",
        message: "L'ID utilisateur est requis",
      });
    }

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: "Données client manquantes",
        message: "Les informations client sont requises",
      });
    }

    // Valider les données client
    const validation = validateCustomerData(customer);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        message: "Données client invalides",
      });
    }

    // Récupérer le plan sélectionné
    const selectedPlan = SUBSCRIPTION_PLANS[plan];

    // Initialiser le client CinetPay
    const cinetpay = getCinetPayClient();

    // Générer un ID de transaction unique incluant le userId
    const transactionId = `SUB-${plan.toUpperCase()}-${Date.now()}-${userId.slice(0, 8)}`;

    // Préparer les métadonnées
    const transactionMetadata = JSON.stringify({
      userId,
      plan: selectedPlan.id,
      planName: selectedPlan.name,
      duration: selectedPlan.duration,
      ...metadata,
    });

    // URLs de notification et de retour
    const siteUrl = getSiteUrl();
    const notifyUrl = `${siteUrl}/api/subscription/webhook`;
    const returnUrl = `${siteUrl}/paiement/succes?plan=${plan}&transaction_id=${transactionId}`;

    console.log("📦 Abonnement - Initialisation:", {
      plan: selectedPlan.name,
      amount: selectedPlan.amount,
      userId,
      transactionId,
      customer_email: customer.customer_email,
    });

    // Initialiser le paiement avec CinetPay
    const paymentResponse = await cinetpay.initializePayment({
      transaction_id: transactionId,
      amount: selectedPlan.amount,
      currency: "XOF",
      description: `Abonnement ${selectedPlan.name} - Afrikipresse`,
      notify_url: notifyUrl,
      return_url: returnUrl,
      channels: "ALL", // Mobile Money + Cartes bancaires
      lang: "fr",
      metadata: transactionMetadata,
      customer,
      invoice_data: {
        "Type d'abonnement": selectedPlan.name,
        Durée: selectedPlan.durationLabel,
        "Accès premium": "Journal numérique + Articles exclusifs",
      },
    });

    // Vérifier que le paiement a été créé
    if (!paymentResponse.data?.payment_url) {
      console.error("❌ Abonnement - Pas d'URL de paiement:", paymentResponse);
      return res.status(500).json({
        success: false,
        error: "Impossible de générer l'URL de paiement",
        message: paymentResponse.message || "Erreur CinetPay",
      });
    }

    console.log("✅ Abonnement - Paiement initialisé:", {
      transaction_id: transactionId,
      payment_url: paymentResponse.data.payment_url,
    });

    // Retourner l'URL de paiement
    return res.status(200).json({
      success: true,
      payment_url: paymentResponse.data.payment_url,
      transaction_id: transactionId,
      message: "Paiement initialisé avec succès",
    });
  } catch (error: any) {
    console.error("❌ Abonnement - Erreur:", {
      message: error.message,
      stack: error.stack,
    });

    // Gestion des erreurs spécifiques
    if (error.message?.includes("credentials missing")) {
      return res.status(500).json({
        success: false,
        error: "Configuration CinetPay manquante",
        message:
          "Les identifiants CinetPay ne sont pas configurés. Contactez l'administrateur.",
      });
    }

    if (error.message?.includes("multiple de 5")) {
      return res.status(400).json({
        success: false,
        error: "Montant invalide",
        message: error.message,
      });
    }

    // Erreur générique
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'initialisation du paiement",
      message: error.message || "Une erreur inattendue s'est produite",
    });
  }
}
