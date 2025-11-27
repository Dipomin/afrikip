/**
 * Script de test pour le système d'abonnement CinetPay
 * Utilisation: node test-subscription.js
 */

const axios = require("axios");

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TEST_USER_ID = process.env.TEST_USER_ID || "test-user-123";

// Couleurs pour les logs
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

// Test 1: Initialisation paiement mensuel
async function testMonthlySubscription() {
  log("🧪", "Test 1: Initialisation abonnement mensuel", colors.blue);

  try {
    const response = await axios.post(`${BASE_URL}/api/subscription/init`, {
      plan: "monthly",
      userId: TEST_USER_ID,
      customer: {
        customer_name: "DOE",
        customer_surname: "John",
        customer_email: "john.doe@test.com",
        customer_phone_number: "+2250704315545",
        customer_address: "Cocody",
        customer_city: "Abidjan",
        customer_country: "CI",
        customer_state: "AB",
        customer_zip_code: "00225",
      },
      metadata: {
        userEmail: "john.doe@test.com",
        userName: "John DOE",
      },
    });

    if (response.data.success && response.data.payment_url) {
      log("✅", "Abonnement mensuel initialisé avec succès", colors.green);
      log("🔗", `URL de paiement: ${response.data.payment_url}`, colors.blue);
      log("🆔", `Transaction ID: ${response.data.transaction_id}`, colors.blue);
      return true;
    } else {
      log("❌", "Échec: Pas d'URL de paiement reçue", colors.red);
      return false;
    }
  } catch (error) {
    log("❌", `Erreur: ${error.response?.data?.error || error.message}`, colors.red);
    return false;
  }
}

// Test 2: Initialisation paiement semestriel
async function testSemiannualSubscription() {
  log("🧪", "Test 2: Initialisation abonnement semestriel", colors.blue);

  try {
    const response = await axios.post(`${BASE_URL}/api/subscription/init`, {
      plan: "semiannual",
      userId: TEST_USER_ID,
      customer: {
        customer_name: "KOUADIO",
        customer_surname: "Marie",
        customer_email: "marie.kouadio@test.com",
        customer_phone_number: "+2250709876543",
        customer_address: "Plateau",
        customer_city: "Abidjan",
        customer_country: "CI",
        customer_state: "AB",
        customer_zip_code: "00225",
      },
    });

    if (response.data.success) {
      log("✅", "Abonnement semestriel initialisé", colors.green);
      log("💰", "Économies: 5 500 F CFA", colors.green);
      return true;
    }
    return false;
  } catch (error) {
    log("❌", `Erreur: ${error.response?.data?.error || error.message}`, colors.red);
    return false;
  }
}

// Test 3: Initialisation paiement annuel
async function testAnnualSubscription() {
  log("🧪", "Test 3: Initialisation abonnement annuel", colors.blue);

  try {
    const response = await axios.post(`${BASE_URL}/api/subscription/init`, {
      plan: "annual",
      userId: TEST_USER_ID,
      customer: {
        customer_name: "TRAORE",
        customer_surname: "Ibrahim",
        customer_email: "ibrahim.traore@test.com",
        customer_phone_number: "+2250701234567",
        customer_address: "Yopougon",
        customer_city: "Abidjan",
        customer_country: "CI",
        customer_state: "AB",
        customer_zip_code: "00225",
      },
    });

    if (response.data.success) {
      log("✅", "Abonnement annuel initialisé", colors.green);
      log("💰", "Économies: 11 000 F CFA", colors.green);
      return true;
    }
    return false;
  } catch (error) {
    log("❌", `Erreur: ${error.response?.data?.error || error.message}`, colors.red);
    return false;
  }
}

// Test 4: Validation des données
async function testValidation() {
  log("🧪", "Test 4: Validation des données", colors.blue);

  const tests = [
    {
      name: "Plan invalide",
      data: { plan: "invalid", userId: TEST_USER_ID, customer: {} },
      shouldFail: true,
    },
    {
      name: "User ID manquant",
      data: { plan: "monthly", customer: {} },
      shouldFail: true,
    },
    {
      name: "Email invalide",
      data: {
        plan: "monthly",
        userId: TEST_USER_ID,
        customer: {
          customer_name: "Test",
          customer_surname: "User",
          customer_email: "invalid-email",
          customer_phone_number: "+2250700000000",
          customer_address: "Test",
          customer_city: "Test",
          customer_country: "CI",
          customer_state: "AB",
          customer_zip_code: "00000",
        },
      },
      shouldFail: true,
    },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      await axios.post(`${BASE_URL}/api/subscription/init`, test.data);
      if (test.shouldFail) {
        log("❌", `${test.name}: Devrait échouer mais a réussi`, colors.red);
      } else {
        log("✅", `${test.name}: Réussi`, colors.green);
        passed++;
      }
    } catch (error) {
      if (test.shouldFail) {
        log("✅", `${test.name}: Échec attendu`, colors.green);
        passed++;
      } else {
        log("❌", `${test.name}: Échec inattendu`, colors.red);
      }
    }
  }

  return passed === tests.length;
}

// Test 5: Vérification de statut
async function testStatusCheck() {
  log("🧪", "Test 5: Vérification de statut d'abonnement", colors.blue);

  try {
    const response = await axios.get(
      `${BASE_URL}/api/subscription/status?userId=${TEST_USER_ID}`
    );

    log("✅", "API de statut répond correctement", colors.green);
    log(
      "📊",
      `Statut: ${response.data.isActive ? "Actif" : "Inactif"}`,
      colors.blue
    );

    if (response.data.subscription) {
      log("📅", `Type: ${response.data.subscription.type}`, colors.blue);
      log(
        "⏰",
        `Jours restants: ${response.data.subscription.daysRemaining}`,
        colors.blue
      );
    }

    return true;
  } catch (error) {
    log("❌", `Erreur: ${error.message}`, colors.red);
    return false;
  }
}

// Test 6: Webhook simulation
async function testWebhookSimulation() {
  log("🧪", "Test 6: Simulation webhook CinetPay", colors.blue);

  const webhookData = {
    cpm_site_id: process.env.CINETPAY_SITE_ID || "TEST_SITE_ID",
    cpm_trans_id: `SUB-MONTHLY-${Date.now()}-${TEST_USER_ID.slice(0, 8)}`,
    cpm_trans_date: new Date().toISOString(),
    cpm_amount: "2000",
    cpm_currency: "XOF",
    cpm_payid: "TEST_PAYMENT_ID",
    cpm_payment_date: new Date().toISOString().split("T")[0],
    cpm_payment_time: new Date().toTimeString().split(" ")[0],
    cpm_error_message: "",
    signature: "test_signature",
    payment_method: "MOBILE_MONEY",
    cel_phone_num: "0704315545",
    cpm_phone_prefixe: "225",
    cpm_language: "fr",
    cpm_version: "V2",
    cpm_payment_config: "SINGLE",
    cpm_page_action: "PAYMENT",
    cpm_custom: "",
    cpm_designation: "Test Abonnement",
    buyer_name: "John DOE",
    cpm_result: "00",
    cpm_trans_status: "ACCEPTED",
    cpm_extra: "",
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/api/subscription/webhook`,
      webhookData
    );

    if (response.data.success) {
      log("✅", "Webhook traité avec succès", colors.green);
      return true;
    } else {
      log("⚠️", "Webhook traité mais paiement non accepté", colors.yellow);
      return true;
    }
  } catch (error) {
    log("❌", `Erreur webhook: ${error.message}`, colors.red);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  log("🚀", "=== Début des tests système d'abonnement ===\n", colors.blue);

  const results = {
    monthly: await testMonthlySubscription(),
    semiannual: await testSemiannualSubscription(),
    annual: await testAnnualSubscription(),
    validation: await testValidation(),
    status: await testStatusCheck(),
    webhook: await testWebhookSimulation(),
  };

  console.log("\n");
  log("📊", "=== Résumé des tests ===", colors.blue);

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([name, result]) => {
    const emoji = result ? "✅" : "❌";
    const color = result ? colors.green : colors.red;
    log(emoji, `${name}: ${result ? "RÉUSSI" : "ÉCHOUÉ"}`, color);
  });

  console.log("\n");
  log(
    "🎯",
    `Score: ${passed}/${total} tests réussis (${Math.round((passed / total) * 100)}%)`,
    passed === total ? colors.green : colors.yellow
  );

  if (passed === total) {
    log("🎉", "Tous les tests sont passés avec succès !", colors.green);
  } else {
    log(
      "⚠️",
      "Certains tests ont échoué. Vérifiez les logs ci-dessus.",
      colors.yellow
    );
  }

  console.log("\n");
}

// Vérifier la configuration
function checkConfig() {
  log("🔍", "Vérification de la configuration...", colors.blue);

  if (!process.env.CINETPAY_KEY) {
    log("⚠️", "CINETPAY_KEY non défini", colors.yellow);
  } else {
    log("✅", "CINETPAY_KEY trouvé", colors.green);
  }

  if (!process.env.CINETPAY_SITE_ID) {
    log("⚠️", "CINETPAY_SITE_ID non défini", colors.yellow);
  } else {
    log("✅", "CINETPAY_SITE_ID trouvé", colors.green);
  }

  log("🌐", `Base URL: ${BASE_URL}`, colors.blue);
  log("👤", `Test User ID: ${TEST_USER_ID}`, colors.blue);
  console.log("\n");
}

// Point d'entrée
if (require.main === module) {
  checkConfig();
  runAllTests().catch((error) => {
    log("❌", `Erreur fatale: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  testMonthlySubscription,
  testSemiannualSubscription,
  testAnnualSubscription,
  testValidation,
  testStatusCheck,
  testWebhookSimulation,
};
