/**
 * Webhook Stripe - Gestion des abonnements
 * Gère les événements subscription.created, subscription.updated, subscription.deleted
 * Synchronise les abonnements avec Firebase Firestore
 */

import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "../../../utils/stripe";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
} from "firebase/firestore";

// Désactiver le bodyParser pour recevoir le raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

interface WebhookResponse {
  received: boolean;
  error?: string;
  message?: string;
}

/**
 * Lit le raw body d'une requête
 */
async function getRawBody(req: NextApiRequest): Promise<string> {
  const chunks: any[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Trouve l'ID utilisateur à partir du Stripe Customer ID
 */
async function findUserIdByStripeCustomerId(
  customerId: string
): Promise<{ userId: string; userEmail: string } | null> {
  try {
    // Chercher dans la collection users
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("stripeCustomerId", "==", customerId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      return {
        userId: userDoc.id,
        userEmail: userData.email || "unknown@afrikipresse.fr",
      };
    }

    // Si pas trouvé dans le champ stripeCustomerId, chercher dans les métadonnées Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("❌ Customer Stripe supprimé:", customerId);
      return null;
    }

    const metadata = (customer as Stripe.Customer).metadata;
    if (metadata?.userId) {
      const userRef = doc(db, "users", metadata.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          userId: metadata.userId,
          userEmail: userData.email || (customer as Stripe.Customer).email || "unknown@afrikipresse.fr",
        };
      }
    }

    console.error("❌ Utilisateur introuvable pour customer:", customerId);
    return null;
  } catch (error) {
    console.error("❌ Erreur recherche utilisateur:", error);
    return null;
  }
}

/**
 * Trouve un document subscription existant par stripeSubscriptionId
 */
async function findSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<string | null> {
  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(
      subscriptionsRef,
      where("stripeSubscriptionId", "==", stripeSubscriptionId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    return null;
  } catch (error) {
    console.error("❌ Erreur recherche subscription:", error);
    return null;
  }
}

/**
 * Crée ou met à jour un document subscription dans Firestore
 */
async function upsertSubscription(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    const customerId = subscription.customer as string;
    const userInfo = await findUserIdByStripeCustomerId(customerId);

    if (!userInfo) {
      console.error("❌ Impossible de trouver l'utilisateur pour la subscription");
      return false;
    }

    const { userId, userEmail } = userInfo;

    // Extraire les informations de la subscription
    const priceData = subscription.items.data[0]?.price;
    const amount = priceData?.unit_amount ? priceData.unit_amount / 100 : 0;
    const currency = priceData?.currency?.toUpperCase() || "EUR";
    
    // Déterminer l'interval (month, year, semester)
    let interval: "month" | "year" | "semester" = "month";
    if (priceData?.recurring?.interval === "year") {
      interval = "year";
    } else if (priceData?.recurring?.interval === "month") {
      const intervalCount = priceData.recurring.interval_count || 1;
      interval = intervalCount === 6 ? "semester" : "month";
    }

    // Mapper le statut Stripe vers notre système
    const statusMap: Record<string, "active" | "inactive" | "trialing" | "canceled" | "past_due"> = {
      active: "active",
      past_due: "past_due",
      unpaid: "past_due",
      canceled: "canceled",
      incomplete: "inactive",
      incomplete_expired: "inactive",
      trialing: "trialing",
      paused: "inactive",
    };

    const status = statusMap[subscription.status] || "inactive";

    const subscriptionData = {
      userId,
      userEmail,
      status,
      amount,
      interval,
      currency,
      method: "stripe" as const,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: priceData?.id || null,
      stripeProductId: priceData?.product as string || null,
      createdAt: Timestamp.fromDate(new Date(subscription.created * 1000)),
      currentPeriodStart: Timestamp.fromDate(
        new Date(subscription.current_period_start * 1000)
      ),
      currentPeriodEnd: Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? Timestamp.fromDate(new Date(subscription.canceled_at * 1000))
        : null,
    };

    // Chercher si un document existe déjà
    const existingDocId = await findSubscriptionByStripeId(subscription.id);

    if (existingDocId) {
      // Mettre à jour le document existant
      const docRef = doc(db, "subscriptions", existingDocId);
      await updateDoc(docRef, subscriptionData);
      console.log("✅ Subscription mise à jour:", {
        docId: existingDocId,
        userId,
        status,
        amount,
      });
    } else {
      // Créer un nouveau document
      const docRef = await addDoc(
        collection(db, "subscriptions"),
        subscriptionData
      );
      console.log("✅ Nouvelle subscription créée:", {
        docId: docRef.id,
        userId,
        status,
        amount,
      });
    }

    // Mettre à jour le document utilisateur
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      subscriptionStatus: status,
      subscriptionType: interval,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Document user mis à jour:", userId);

    return true;
  } catch (error) {
    console.error("❌ Erreur upsert subscription:", error);
    return false;
  }
}

/**
 * Gère la suppression d'un abonnement
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    const existingDocId = await findSubscriptionByStripeId(subscription.id);

    if (existingDocId) {
      const docRef = doc(db, "subscriptions", existingDocId);
      await updateDoc(docRef, {
        status: "canceled",
        canceledAt: Timestamp.now(),
        cancelAtPeriodEnd: true,
      });

      console.log("✅ Subscription marquée comme annulée:", existingDocId);
    }

    // Mettre à jour le statut utilisateur
    const customerId = subscription.customer as string;
    const userInfo = await findUserIdByStripeCustomerId(customerId);

    if (userInfo) {
      const userRef = doc(db, "users", userInfo.userId);
      await updateDoc(userRef, {
        subscriptionStatus: "canceled",
        updatedAt: Timestamp.now(),
      });

      console.log("✅ Statut utilisateur mis à jour:", userInfo.userId);
    }

    return true;
  } catch (error) {
    console.error("❌ Erreur suppression subscription:", error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      received: false,
      message: "Méthode non autorisée",
    });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ Signature Stripe manquante");
    return res.status(400).json({
      received: false,
      error: "Signature manquante",
    });
  }

  try {
    // Lire le raw body
    const rawBody = await getRawBody(req);

    // Vérifier la signature du webhook
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET non configuré");
      return res.status(500).json({
        received: false,
        error: "Configuration manquante",
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error("❌ Erreur vérification signature:", err.message);
      return res.status(400).json({
        received: false,
        error: `Webhook signature verification failed: ${err.message}`,
      });
    }

    console.log("🔔 Webhook Stripe reçu:", {
      type: event.type,
      id: event.id,
    });

    // Gérer les événements d'abonnement
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📝 Traitement subscription:", {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
        });

        const success = await upsertSubscription(subscription);

        if (success) {
          return res.status(200).json({
            received: true,
            message: "Subscription traitée avec succès",
          });
        } else {
          return res.status(500).json({
            received: false,
            error: "Erreur traitement subscription",
          });
        }
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("🗑️ Suppression subscription:", subscription.id);

        const success = await handleSubscriptionDeleted(subscription);

        if (success) {
          return res.status(200).json({
            received: true,
            message: "Suppression traitée avec succès",
          });
        } else {
          return res.status(500).json({
            received: false,
            error: "Erreur suppression subscription",
          });
        }
      }

      default:
        console.log("ℹ️ Événement non géré:", event.type);
        return res.status(200).json({
          received: true,
          message: "Événement non géré",
        });
    }
  } catch (error: any) {
    console.error("❌ Erreur webhook:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      received: false,
      error: error.message || "Erreur interne",
    });
  }
}
