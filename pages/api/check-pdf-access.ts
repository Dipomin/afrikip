import { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfId, userEmail } = req.query;

  if (!pdfId || !userEmail) {
    return res.status(400).json({ error: 'Missing pdfId or userEmail' });
  }

  try {
    // Rechercher les commandes payées contenant ce PDF pour cet utilisateur
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customer.email', '==', userEmail),
      where('status', '==', 'paid')
    );

    const snapshot = await getDocs(q);
    
    // Vérifier si une des commandes contient ce PDF
    let hasAccess = false;

    snapshot.forEach((doc) => {
      const orderData = doc.data();
      const items = orderData.items || [];
      
      // Vérifier si le PDF est dans les items de cette commande
      const hasPDF = items.some((item: any) => item.id === pdfId);
      
      if (hasPDF) {
        hasAccess = true;
      }
    });

    return res.status(200).json({ hasAccess });
  } catch (error) {
    console.error('❌ Erreur vérification accès PDF:', error);
    return res.status(500).json({ error: 'Internal server error', hasAccess: false });
  }
}
