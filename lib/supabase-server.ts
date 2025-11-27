import { GetServerSidePropsContext } from 'next';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../firebase';
import * as admin from 'firebase-admin';

// Initialiser Firebase Admin SDK (côté serveur uniquement)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const getSession = async (ctx: GetServerSidePropsContext) => {
  try {
    const token = ctx.req.cookies.firebaseToken;
    if (!token) return null;

    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email || '',
      },
    };
  } catch (error) {
    return null;
  }
};

export const getUser = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession(ctx);
  return session?.user || null;
};

export const getSubscription = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession(ctx);

  if (!session?.user) {
    return null;
  }

  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('user_id', '==', session.user.id),
      where('status', 'in', ['trialing', 'active']),
      firestoreLimit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const subscriptionDoc = snapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // Charger les données du prix et du produit
    if (subscriptionData.price_id) {
      const priceDoc = await getDocs(
        query(collection(db, 'prices'), where('id', '==', subscriptionData.price_id), firestoreLimit(1))
      );
      
      if (!priceDoc.empty) {
        const priceData = priceDoc.docs[0].data();
        subscriptionData.prices = priceData;

        if (priceData.product_id) {
          const productDoc = await getDocs(
            query(collection(db, 'products'), where('id', '==', priceData.product_id), firestoreLimit(1))
          );
          
          if (!productDoc.empty) {
            subscriptionData.prices.products = productDoc.docs[0].data();
          }
        }
      }
    }

    return { id: subscriptionDoc.id, ...subscriptionData };
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return null;
  }
};

// Vérifie si l'utilisateur a accès à un PDF spécifique
export const checkPDFAccess = async (
  ctx: GetServerSidePropsContext,
  pdfId: string
): Promise<{ hasAccess: boolean; reason: 'subscription' | 'purchase' | 'none' }> => {
  const session = await getSession(ctx);
  
  if (!session?.user) {
    return { hasAccess: false, reason: 'none' };
  }

  // 1. Vérifier l'abonnement actif
  const subscription = await getSubscription(ctx);
  if (subscription && ['trialing', 'active'].includes(subscription.status)) {
    return { hasAccess: true, reason: 'subscription' };
  }

  // 2. Vérifier l'achat individuel (Firestore orders collection)
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customer.email', '==', session.user.email),
      where('status', '==', 'paid')
    );

    const snapshot = await getDocs(q);
    
    for (const orderDoc of snapshot.docs) {
      const orderData = orderDoc.data();
      const items = orderData.items || [];
      
      if (items.some((item: any) => item.id === pdfId)) {
        return { hasAccess: true, reason: 'purchase' };
      }
    }
  } catch (error) {
    console.error('Erreur vérification achat:', error);
  }
  
  return { hasAccess: false, reason: 'none' };
};
