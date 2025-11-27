// Test Firebase Storage - Vérifier l'accès aux PDFs
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyA4vVaK3r-QiEdcL2a7PaLZIxOub795Ry4",
  authDomain: "lia-pdf.firebaseapp.com",
  projectId: "lia-pdf",
  storageBucket: "lia-pdf.appspot.com",
  messagingSenderId: "235398791352",
  appId: "1:235398791352:web:ba83aeaa6c3cf6267cf44d"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testPdfAccess() {
  try {
    // Test avec le chemin d'un PDF de 2009
    const pdfPath = 'archives/pdf/2009/rvY35t4U37TumeEoQSqG';
    console.log(`\n🔍 Test d'accès au PDF: ${pdfPath}`);
    
    const storageRef = ref(storage, pdfPath);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Succès ! URL générée:');
    console.log(downloadURL);
    console.log('\n📊 Détails:');
    console.log('- Token présent:', downloadURL.includes('token=') ? '✓' : '✗');
    console.log('- URL valide:', downloadURL.startsWith('https://') ? '✓' : '✗');
    
    // Test de téléchargement
    console.log('\n📥 Test de téléchargement...');
    const response = await fetch(downloadURL);
    console.log('- Status:', response.status, response.statusText);
    console.log('- Content-Type:', response.headers.get('content-type'));
    console.log('- Size:', response.headers.get('content-length'), 'bytes');
    
    if (response.ok) {
      console.log('\n✅ Le PDF est accessible et téléchargeable !');
    } else {
      console.log('\n❌ Erreur lors du téléchargement');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\n💡 Solutions possibles:');
    console.error('1. Vérifier les règles Firebase Storage (onglet Storage > Rules)');
    console.error('2. S\'assurer que les règles autorisent la lecture publique:');
    console.error('   rules_version = \'2\';');
    console.error('   service firebase.storage {');
    console.error('     match /b/{bucket}/o {');
    console.error('       match /archives/pdf/{year}/{document} {');
    console.error('         allow read: if true;');
    console.error('       }');
    console.error('     }');
    console.error('   }');
  }
  
  process.exit(0);
}

testPdfAccess();
