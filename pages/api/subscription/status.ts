/**
 * API de vérification du statut d'abonnement
 * Permet de vérifier si un utilisateur a un abonnement actif
 */

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

interface StatusResponse {
  success: boolean;
  isActive: boolean;
  subscription?: {
    status: string;
    type: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  error?: string;
  message?: string;
}

/**
 * Calcule le nombre de jours restants
 */
function calculateDaysRemaining(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  // Accepter GET et POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      isActive: false,
      message: "Méthode non autorisée",
    });
  }

  try {
    // Récupérer l'userId depuis query params ou body
    const userId =
      req.method === "GET"
        ? (req.query.userId as string)
        : req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        isActive: false,
        error: "ID utilisateur manquant",
        message: "L'ID utilisateur est requis",
      });
    }

    console.log("🔍 Vérification abonnement:", userId);

    // Récupérer le document utilisateur
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("❌ Utilisateur introuvable:", userId);
      return res.status(404).json({
        success: false,
        isActive: false,
        error: "Utilisateur introuvable",
        message: "Aucun utilisateur trouvé avec cet ID",
      });
    }

    const userData = userDoc.data();

    // Vérifier le statut d'abonnement
    const subscriptionStatus = userData.subscriptionStatus;
    const subscriptionEndDate = userData.subscriptionEndDate;

    // Pas d'abonnement
    if (!subscriptionStatus || subscriptionStatus !== "active") {
      console.log("📝 Pas d'abonnement actif:", userId);
      return res.status(200).json({
        success: true,
        isActive: false,
        message: "Aucun abonnement actif",
      });
    }

    // Vérifier la date d'expiration
    let endDate: Date;
    if (subscriptionEndDate?.toDate) {
      endDate = subscriptionEndDate.toDate();
    } else if (subscriptionEndDate instanceof Date) {
      endDate = subscriptionEndDate;
    } else {
      endDate = new Date(subscriptionEndDate);
    }

    const now = new Date();
    const isExpired = endDate < now;

    if (isExpired) {
      console.log("⏰ Abonnement expiré:", {
        userId,
        endDate: endDate.toISOString(),
      });
      return res.status(200).json({
        success: true,
        isActive: false,
        message: "Abonnement expiré",
      });
    }

    // Abonnement actif
    const daysRemaining = calculateDaysRemaining(endDate);
    const startDate = userData.subscriptionStartDate?.toDate
      ? userData.subscriptionStartDate.toDate()
      : new Date();

    console.log("✅ Abonnement actif:", {
      userId,
      type: userData.subscriptionType,
      daysRemaining,
    });

    return res.status(200).json({
      success: true,
      isActive: true,
      subscription: {
        status: subscriptionStatus,
        type: userData.subscriptionType || "unknown",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysRemaining,
      },
      message: "Abonnement actif",
    });
  } catch (error: any) {
    console.error("❌ Erreur vérification abonnement:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      isActive: false,
      error: "Erreur lors de la vérification",
      message: error.message || "Une erreur inattendue s'est produite",
    });
  }
}
