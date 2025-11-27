import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  metadata?: Record<string, any>;
  prices?: {
    id: string;
    product_id?: string;
    active?: boolean;
    description?: string;
    unit_amount?: number;
    currency?: string;
    type?: string;
    interval?: string;
    interval_count?: number;
    trial_period_days?: number;
    metadata?: Record<string, any>;
    products?: {
      id: string;
      active?: boolean;
      name?: string;
      description?: string;
      image?: string;
      metadata?: Record<string, any>;
    };
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Stocker le token dans les cookies pour SSR
      if (user) {
        user.getIdToken().then((token) => {
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax`;
        });
      } else {
        document.cookie = 'firebaseToken=; path=/; max-age=0';
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(
          subscriptionsRef,
          where('user_id', '==', user.uid),
          where('status', 'in', ['trialing', 'active']),
          firestoreLimit(1)
        );

        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setSubscription(null);
          setLoading(false);
          return;
        }

        const subscriptionDoc = snapshot.docs[0];
        const subscriptionData = subscriptionDoc.data() as Subscription;
        subscriptionData.id = subscriptionDoc.id;

        // Charger les données du prix et du produit
        if (subscriptionData.price_id) {
          const pricesRef = collection(db, 'prices');
          const priceQuery = query(
            pricesRef,
            where('id', '==', subscriptionData.price_id),
            firestoreLimit(1)
          );
          
          const priceSnapshot = await getDocs(priceQuery);
          
          if (!priceSnapshot.empty) {
            const priceData = priceSnapshot.docs[0].data();
            subscriptionData.prices = priceData as any;

            if (priceData.product_id && subscriptionData.prices) {
              const productsRef = collection(db, 'products');
              const productQuery = query(
                productsRef,
                where('id', '==', priceData.product_id),
                firestoreLimit(1)
              );
              
              const productSnapshot = await getDocs(productQuery);
              
              if (!productSnapshot.empty) {
                subscriptionData.prices.products = productSnapshot.docs[0].data() as any;
              }
            }
          }
        }

        setSubscription(subscriptionData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur récupération abonnement:', error);
        setSubscription(null);
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, authLoading]);

  return { subscription, loading: loading || authLoading };
}

// Hook pour vérifier l'accès à un PDF
export function usePDFAccess(pdfId: string) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [accessReason, setAccessReason] = useState<'subscription' | 'purchase' | 'none'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setAccessReason('none');
        setLoading(false);
        return;
      }

      // 1. Vérifier abonnement actif
      if (subscription && ['trialing', 'active'].includes(subscription.status)) {
        setHasAccess(true);
        setAccessReason('subscription');
        setLoading(false);
        return;
      }

      // 2. Vérifier achat individuel dans Firestore
      try {
        const response = await fetch(`/api/check-pdf-access?pdfId=${pdfId}&userEmail=${user.email}`);
        const data = await response.json();

        if (data.hasAccess) {
          setHasAccess(true);
          setAccessReason('purchase');
        } else {
          setHasAccess(false);
          setAccessReason('none');
        }
      } catch (error) {
        console.error('Erreur vérification accès PDF:', error);
        setHasAccess(false);
        setAccessReason('none');
      }

      setLoading(false);
    };

    checkAccess();
  }, [user, subscription, pdfId]);

  return { hasAccess, accessReason, loading };
}
