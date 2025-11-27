import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4vVaK3r-QiEdcL2a7PaLZIxOub795Ry4",
  authDomain: "lia-pdf.firebaseapp.com",
  projectId: "lia-pdf",
  storageBucket: "lia-pdf.appspot.com",
  messagingSenderId: "235398791352",
  appId: "1:235398791352:web:ba83aeaa6c3cf6267cf44d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseAccess() {
  try {
    console.log('🔍 Test connexion Firestore...\n');
    
    const years = ['2025', '2024', '2023'];
    let totalJournals = 0;
    let testPdfUrl = null;
    
    for (const year of years) {
      try {
        const ref = collection(db, 'archives', 'pdf', year);
        const q = query(ref, limit(5));
        const snapshot = await getDocs(q);
        
        console.log(`📅 Année ${year}: ${snapshot.docs.length} journaux`);
        
        if (!snapshot.empty && !testPdfUrl) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          console.log(`   ├─ ID: ${doc.id}`);
          console.log(`   ├─ Titre: ${data.title || 'N/A'}`);
          console.log(`   ├─ Cover: ${data.coverImageURL ? '✅' : '❌'}`);
          console.log(`   └─ PDF: ${data.downloadURL ? '✅' : '❌'}`);
          
          if (data.downloadURL) {
            testPdfUrl = data.downloadURL;
          }
        }
        
        totalJournals += snapshot.docs.length;
      } catch (err) {
        console.log(`❌ Année ${year}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Total: ${totalJournals} journaux trouvés\n`);
    
    // Test Storage
    if (testPdfUrl) {
      console.log('🔍 Test accès Storage...');
      console.log(`📁 URL: ${testPdfUrl.substring(0, 80)}...`);
      
      try {
        const response = await fetch(testPdfUrl, { method: 'HEAD' });
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 403) {
          console.log('\n❌ PROBLÈME IDENTIFIÉ: Storage Rules pas déployées !');
          console.log('\n💡 SOLUTION:');
          console.log('1. Ouvrir: https://console.firebase.google.com/project/lia-pdf/storage/rules');
          console.log('2. Copier storage.rules');
          console.log('3. Publier les règles');
          console.log('\nOu exécuter: ./deploy-storage-console.sh');
        } else if (response.status === 200) {
          console.log('\n✅ Storage accessible - Les PDFs devraient fonctionner !');
        } else {
          console.log(`\n⚠️  Status inattendu: ${response.status}`);
        }
      } catch (fetchErr) {
        console.log(`\n❌ Erreur fetch: ${fetchErr.message}`);
      }
    } else {
      console.log('\n⚠️  Aucun PDF trouvé pour tester Storage');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur globale:', error);
  }
}

testFirebaseAccess().then(() => process.exit(0));
