import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

async function fixMissingURLs() {
  try {
    console.log('🔧 Correction des URLs manquantes...\n');
    
    const years = ['2025', '2024', '2023'];
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const year of years) {
      console.log(`\n📅 Année ${year}:`);
      const collectionRef = collection(db, 'archives', 'pdf', year);
      const snapshot = await getDocs(collectionRef);
      
      console.log(`   Trouvé: ${snapshot.docs.length} documents`);
      
      for (const document of snapshot.docs) {
        const data = document.data();
        const docId = document.id;
        
        // Vérifier si les URLs manquent
        if (data.coverImageURL && data.downloadURL) {
          skipped++;
          continue;
        }
        
        console.log(`\n   🔨 Correction: ${docId}`);
        console.log(`      Titre: ${data.title || 'N/A'}`);
        
        try {
          const updates = {};
          
          // Générer l'URL de la couverture
          if (!data.coverImageURL) {
            const coverRef = ref(storage, `archives/covers/${year}/${docId}_cover`);
            try {
              const coverURL = await getDownloadURL(coverRef);
              updates.coverImageURL = coverURL;
              console.log(`      ✅ Cover URL générée`);
            } catch (coverError) {
              console.log(`      ⚠️  Cover introuvable dans Storage`);
            }
          }
          
          // Générer l'URL du PDF
          if (!data.downloadURL) {
            const pdfRef = ref(storage, `archives/pdf/${year}/${docId}`);
            try {
              const pdfURL = await getDownloadURL(pdfRef);
              updates.downloadURL = pdfURL;
              console.log(`      ✅ PDF URL générée`);
            } catch (pdfError) {
              console.log(`      ⚠️  PDF introuvable dans Storage`);
            }
          }
          
          // Mettre à jour le document
          if (Object.keys(updates).length > 0) {
            const docRef = doc(db, 'archives', 'pdf', year, docId);
            await updateDoc(docRef, updates);
            fixed++;
            console.log(`      ✅ Document mis à jour`);
          } else {
            console.log(`      ❌ Aucun fichier trouvé dans Storage`);
            errors++;
          }
          
        } catch (updateError) {
          console.log(`      ❌ Erreur: ${updateError.message}`);
          errors++;
        }
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RÉSUMÉ:');
    console.log(`   ✅ Corrigés: ${fixed}`);
    console.log(`   ⏭️  Ignorés (déjà OK): ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log('═'.repeat(60));
    
    if (fixed > 0) {
      console.log('\n🎉 Migration terminée ! Rechargez /lintelligentpdf/aujourdhui');
    } else if (errors > 0) {
      console.log('\n⚠️  Certains fichiers sont manquants dans Storage.');
      console.log('💡 Ré-uploadez ces journaux via /lintelligentpdf/upload');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur globale:', error);
  }
}

fixMissingURLs().then(() => process.exit(0));
