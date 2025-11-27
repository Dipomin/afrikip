/**
 * Script pour créer des subscriptions de test dans Firebase
 * À utiliser dans la console Firebase ou via un script Node.js
 */

import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Crée une subscription CinetPay de test
 */
export async function createTestCinetPaySubscription(
  userId: string,
  userEmail: string
) {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours

  const subscriptionData = {
    userId,
    userEmail,
    status: "active" as const,
    amount: 2000,
    interval: "month" as const,
    currency: "XOF",
    method: "cinetpay" as const,
    cinetpayTransactionId: `TEST-SUB-MONTHLY-${Date.now()}-${userId}`,
    createdAt: Timestamp.now(),
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(endDate),
    cancelAtPeriodEnd: false,
    canceledAt: null,
  };

  const docRef = await addDoc(collection(db, "subscriptions"), subscriptionData);
  console.log("✅ Subscription CinetPay créée:", docRef.id);
  return docRef.id;
}

/**
 * Crée une subscription Stripe de test
 */
export async function createTestStripeSubscription(
  userId: string,
  userEmail: string
) {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours

  const subscriptionData = {
    userId,
    userEmail,
    status: "active" as const,
    amount: 9.99,
    interval: "month" as const,
    currency: "EUR",
    method: "stripe" as const,
    stripeSubscriptionId: `sub_test_${Date.now()}`,
    stripeCustomerId: `cus_test_${Date.now()}`,
    stripePriceId: "price_test_123",
    stripeProductId: "prod_test_123",
    createdAt: Timestamp.now(),
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(endDate),
    cancelAtPeriodEnd: false,
    canceledAt: null,
  };

  const docRef = await addDoc(collection(db, "subscriptions"), subscriptionData);
  console.log("✅ Subscription Stripe créée:", docRef.id);
  return docRef.id;
}

/**
 * Crée plusieurs subscriptions de test avec différents statuts
 */
export async function createMultipleTestSubscriptions() {
  const testUsers = [
    { userId: "user1", email: "test1@afrikipresse.fr" },
    { userId: "user2", email: "test2@afrikipresse.fr" },
    { userId: "user3", email: "test3@afrikipresse.fr" },
  ];

  const subscriptions: any[] = [];

  // Subscription active CinetPay
  const sub1 = await addDoc(collection(db, "subscriptions"), {
    userId: testUsers[0].userId,
    userEmail: testUsers[0].email,
    status: "active" as const,
    amount: 2000,
    interval: "month" as const,
    currency: "XOF",
    method: "cinetpay" as const,
    cinetpayTransactionId: `SUB-MONTHLY-${Date.now()}-${testUsers[0].userId}`,
    createdAt: Timestamp.now(),
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ),
    cancelAtPeriodEnd: false,
    canceledAt: null,
  });
  subscriptions.push(sub1);

  // Subscription active Stripe
  const sub2 = await addDoc(collection(db, "subscriptions"), {
    userId: testUsers[1].userId,
    userEmail: testUsers[1].email,
    status: "active" as const,
    amount: 9.99,
    interval: "month" as const,
    currency: "EUR",
    method: "stripe" as const,
    stripeSubscriptionId: `sub_test_${Date.now()}`,
    stripeCustomerId: `cus_test_${Date.now()}`,
    stripePriceId: "price_test_123",
    stripeProductId: "prod_test_123",
    createdAt: Timestamp.now(),
    currentPeriodStart: Timestamp.now(),
    currentPeriodEnd: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ),
    cancelAtPeriodEnd: false,
    canceledAt: null,
  });
  subscriptions.push(sub2);

  // Subscription canceled
  const sub3 = await addDoc(collection(db, "subscriptions"), {
    userId: testUsers[2].userId,
    userEmail: testUsers[2].email,
    status: "canceled" as const,
    amount: 13000,
    interval: "year" as const,
    currency: "XOF",
    method: "cinetpay" as const,
    cinetpayTransactionId: `SUB-ANNUAL-${Date.now()}-${testUsers[2].userId}`,
    createdAt: Timestamp.fromDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // -6 mois
    ),
    currentPeriodStart: Timestamp.fromDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    ),
    currentPeriodEnd: Timestamp.fromDate(
      new Date(Date.now() + 185 * 24 * 60 * 60 * 1000) // +6 mois
    ),
    cancelAtPeriodEnd: true,
    canceledAt: Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // -30 jours
    ),
  });
  subscriptions.push(sub3);

  console.log(`✅ ${subscriptions.length} subscriptions créées:`, subscriptions.map(s => s.id));
  return subscriptions;
}

/**
 * Exemple d'utilisation en console
 * 
 * Dans la Firebase Console (Firestore), ou via un script :
 * 
 * 1. Ouvrir la console JavaScript du navigateur
 * 2. Copier-coller ce code
 * 3. Exécuter : createTestCinetPaySubscription("userId123", "test@afrikipresse.fr")
 * 4. Vérifier dans /admin/subscriptions
 */

// Pour Node.js (script autonome)
if (require.main === module) {
  (async () => {
    try {
      console.log("🚀 Création de subscriptions de test...");
      await createMultipleTestSubscriptions();
      console.log("✅ Terminé !");
      process.exit(0);
    } catch (error) {
      console.error("❌ Erreur:", error);
      process.exit(1);
    }
  })();
}
