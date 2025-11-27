import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4vVaK3r-QiEdcL2a7PaLZIxOub795Ry4",
  projectId: "lia-pdf",
  storageBucket: "lia-pdf.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectDocuments() {
  try {
    console.log('🔍 Inspection détaillée des documents...\n');
    
    const ref = collection(db, 'archives', 'pdf', '2025');
    const q = query(ref, limit(2));
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1}: ${doc.id}`);
      console.log('─'.repeat(60));
      const data = doc.data();
      
      // Afficher tous les champs
      Object.keys(data).forEach(key => {
        let value = data[key];
        
        // Formatter les Timestamps
        if (value && typeof value === 'object' && value.toDate) {
          value = value.toDate().toISOString();
        }
        
        // Tronquer les URLs longues
        if (typeof value === 'string' && value.length > 80) {
          value = value.substring(0, 77) + '...';
        }
        
        console.log(`${key}: ${JSON.stringify(value)}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

inspectDocuments().then(() => process.exit(0));
