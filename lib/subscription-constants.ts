/**
 * Configuration des constantes pour le système d'abonnement
 */

// Plans d'abonnement
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: "monthly",
    name: "Mensuel",
    amount: 2000,
    duration: 30,
    durationLabel: "1 mois",
    savings: 0,
  },
  SEMIANNUAL: {
    id: "semiannual",
    name: "Semestriel",
    amount: 6500,
    duration: 180,
    durationLabel: "6 mois",
    savings: 5500,
    savingsLabel: "Économisez 5 500 F CFA",
  },
  ANNUAL: {
    id: "annual",
    name: "Annuel",
    amount: 13000,
    duration: 365,
    durationLabel: "12 mois",
    savings: 11000,
    savingsLabel: "Économisez 11 000 F CFA",
  },
} as const;

// Moyens de paiement CinetPay
export const PAYMENT_METHODS = {
  ALL: "ALL", // Tous les moyens
  MOBILE_MONEY: "MOBILE_MONEY", // Uniquement Mobile Money
  CREDIT_CARD: "CREDIT_CARD", // Uniquement cartes bancaires
  WALLET: "WALLET", // Portefeuille électronique
} as const;

// Devises supportées
export const CURRENCIES = {
  XOF: "XOF", // Franc CFA (Afrique de l'Ouest)
  XAF: "XAF", // Franc CFA (Afrique Centrale)
  CDF: "CDF", // Franc Congolais
  GNF: "GNF", // Franc Guinéen
  USD: "USD", // Dollar US
} as const;

// Langues
export const LANGUAGES = {
  FR: "fr",
  EN: "en",
} as const;

// Statuts de transaction
export const TRANSACTION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REFUSED: "REFUSED",
  PENDING: "PENDING",
} as const;

// Statuts d'abonnement
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

// Codes pays ISO (Afrique francophone)
export const COUNTRY_CODES = {
  CI: { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
  SN: { code: "SN", name: "Sénégal", currency: "XOF" },
  TG: { code: "TG", name: "Togo", currency: "XOF" },
  BJ: { code: "BJ", name: "Bénin", currency: "XOF" },
  ML: { code: "ML", name: "Mali", currency: "XOF" },
  BF: { code: "BF", name: "Burkina Faso", currency: "XOF" },
  NE: { code: "NE", name: "Niger", currency: "XOF" },
  GW: { code: "GW", name: "Guinée-Bissau", currency: "XOF" },
  CM: { code: "CM", name: "Cameroun", currency: "XAF" },
  GA: { code: "GA", name: "Gabon", currency: "XAF" },
  CG: { code: "CG", name: "Congo", currency: "XAF" },
  TD: { code: "TD", name: "Tchad", currency: "XAF" },
  CF: { code: "CF", name: "Centrafrique", currency: "XAF" },
  GQ: { code: "GQ", name: "Guinée Équatoriale", currency: "XAF" },
  GN: { code: "GN", name: "Guinée", currency: "GNF" },
  CD: { code: "CD", name: "RD Congo", currency: "CDF" },
} as const;

// Valeurs par défaut
export const DEFAULTS = {
  COUNTRY: "CI",
  CURRENCY: "XOF",
  LANGUAGE: "fr",
  PAYMENT_METHOD: "ALL",
  ZIP_CODE: "00225",
  TIMEOUT: 30000, // 30 secondes
} as const;

// URLs CinetPay
export const CINETPAY_URLS = {
  PAYMENT_API: "https://api-checkout.cinetpay.com/v2/payment",
  VERIFY_API: "https://api-checkout.cinetpay.com/v2/payment/check",
  CHECKOUT_BASE: "https://checkout.cinetpay.com/payment/",
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: "Configuration CinetPay manquante. Vérifiez CINETPAY_KEY et CINETPAY_SITE_ID.",
  INVALID_AMOUNT: "Le montant doit être un multiple de 5 et supérieur à 0.",
  INVALID_PLAN: "Plan d'abonnement invalide.",
  INVALID_USER_ID: "ID utilisateur manquant ou invalide.",
  INVALID_CUSTOMER_DATA: "Données client invalides.",
  INVALID_EMAIL: "Format d'email invalide.",
  INVALID_COUNTRY_CODE: "Code pays invalide (doit être ISO 2 lettres).",
  PAYMENT_FAILED: "Le paiement a échoué.",
  NOTIFICATION_INVALID: "Notification webhook invalide.",
  TRANSACTION_NOT_FOUND: "Transaction introuvable.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  ACTIVATION_FAILED: "Échec de l'activation de l'abonnement.",
  NO_ACTIVE_SUBSCRIPTION: "Aucun abonnement actif.",
  SUBSCRIPTION_EXPIRED: "Abonnement expiré.",
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  PAYMENT_INITIALIZED: "Paiement initialisé avec succès",
  SUBSCRIPTION_ACTIVATED: "Abonnement activé avec succès",
  SUBSCRIPTION_ACTIVE: "Abonnement actif",
} as const;

// Regex
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  TRANSACTION_ID: /^SUB-(MONTHLY|SEMIANNUAL|ANNUAL)-\d+-[a-zA-Z0-9]+$/,
} as const;

// Configuration des logs
export const LOG_EMOJIS = {
  INIT: "🚀",
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚠️",
  INFO: "ℹ️",
  DEBUG: "🔍",
  SAVE: "💾",
  STATUS: "📊",
  WEBHOOK: "🔔",
  EXPIRED: "⏰",
  PAYMENT: "💳",
  USER: "👤",
} as const;
