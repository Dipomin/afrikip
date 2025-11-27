/**
 * CinetPay API Client
 * Documentation: https://docs.cinetpay.com/api/1.0-fr/checkout/initialisation
 */

import axios, { AxiosError } from "axios";

// Configuration CinetPay
const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_VERIFY_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

// Types
export interface CinetPayCustomer {
  customer_id?: string;
  customer_name: string;
  customer_surname: string;
  customer_email: string;
  customer_phone_number: string;
  customer_address: string;
  customer_city: string;
  customer_country: string; // Code ISO à 2 chiffres (ex: CI, TG, SN)
  customer_state: string;
  customer_zip_code: string;
}

export interface CinetPayPaymentRequest {
  apikey: string;
  site_id: string;
  transaction_id: string;
  amount: number;
  currency: "XOF" | "XAF" | "CDF" | "GNF" | "USD";
  description: string;
  notify_url: string;
  return_url: string;
  channels: "ALL" | "MOBILE_MONEY" | "CREDIT_CARD" | "WALLET";
  metadata?: string;
  lang?: "fr" | "en";
  invoice_data?: Record<string, string>;
  lock_phone_number?: boolean;
  customer: CinetPayCustomer;
}

export interface CinetPayPaymentResponse {
  code: string;
  message: string;
  description: string;
  data?: {
    payment_token: string;
    payment_url: string;
  };
  api_response_id: string;
}

export interface CinetPayVerificationRequest {
  apikey: string;
  site_id: string;
  transaction_id: string;
}

export interface CinetPayVerificationResponse {
  code: string;
  message: string;
  data?: {
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    payment_date: string;
    operator_id: string;
    metadata: string;
  };
  api_response_id: string;
}

export interface CinetPayNotification {
  cpm_site_id: string;
  cpm_trans_id: string;
  cpm_trans_date: string;
  cpm_amount: string;
  cpm_currency: string;
  cpm_payid: string;
  cpm_payment_date: string;
  cpm_payment_time: string;
  cpm_error_message: string;
  signature: string;
  payment_method: string;
  cel_phone_num: string;
  cpm_phone_prefixe: string;
  cpm_language: string;
  cpm_version: string;
  cpm_payment_config: string;
  cpm_page_action: string;
  cpm_custom: string;
  cpm_designation: string;
  buyer_name: string;
  cpm_result: string;
  cpm_trans_status: string; // "ACCEPTED" ou "REFUSED"
  cpm_extra: string;
}

// Codes d'erreur CinetPay
export const CINETPAY_ERROR_CODES = {
  CREATED: "201",
  INVALID_PARAMS: "608",
  AUTH_NOT_FOUND: "609",
  INVALID_SITE_ID: "613",
  PROCESSING_ERROR: "624",
  FORBIDDEN: "403",
  TOO_MANY_REQUESTS: "429",
} as const;

// Statuts de transaction
export const TRANSACTION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REFUSED: "REFUSED",
  PENDING: "PENDING",
} as const;

/**
 * Client CinetPay pour gérer les paiements
 */
export class CinetPayClient {
  private apikey: string;
  private site_id: string;

  constructor(apikey?: string, site_id?: string) {
    this.apikey = apikey || process.env.CINETPAY_KEY || "";
    this.site_id = site_id || process.env.CINETPAY_SITE_ID || "";

    if (!this.apikey || !this.site_id) {
      throw new Error(
        "CinetPay credentials missing. Set CINETPAY_KEY and CINETPAY_SITE_ID environment variables."
      );
    }
  }

  /**
   * Génère un ID de transaction unique
   */
  generateTransactionId(prefix: string = "TXN"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Valide que le montant est un multiple de 5 (requis par CinetPay)
   */
  private validateAmount(amount: number): boolean {
    return amount > 0 && amount % 5 === 0;
  }

  /**
   * Nettoie la description pour éviter les caractères spéciaux
   */
  private sanitizeDescription(description: string): string {
    return description.replace(/[#/$_&]/g, " ");
  }

  /**
   * Initialise un paiement et retourne l'URL de paiement
   */
  async initializePayment(
    request: Omit<CinetPayPaymentRequest, "apikey" | "site_id">
  ): Promise<CinetPayPaymentResponse> {
    try {
      // Validation du montant
      if (!this.validateAmount(request.amount)) {
        throw new Error(
          "Le montant doit être un multiple de 5 et supérieur à 0"
        );
      }

      // Nettoyage de la description
      const cleanedDescription = this.sanitizeDescription(request.description);

      // Préparer les données
      const paymentData: CinetPayPaymentRequest = {
        apikey: this.apikey,
        site_id: this.site_id,
        ...request,
        description: cleanedDescription,
      };

      console.log("🚀 CinetPay - Initialisation paiement:", {
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount,
        customer_email: paymentData.customer.customer_email,
      });

      // Appel API
      const response = await axios.post<CinetPayPaymentResponse>(
        CINETPAY_API_URL,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AfrikipresseApp/1.0",
          },
          timeout: 30000, // 30 secondes
        }
      );

      // Vérifier la réponse
      if (response.data.code === CINETPAY_ERROR_CODES.CREATED) {
        console.log("✅ CinetPay - Paiement créé:", {
          payment_url: response.data.data?.payment_url,
          api_response_id: response.data.api_response_id,
        });
        return response.data;
      } else {
        console.error("❌ CinetPay - Erreur:", response.data);
        throw new Error(
          `CinetPay Error: ${response.data.message} - ${response.data.description}`
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CinetPayPaymentResponse>;
        console.error("❌ CinetPay - Erreur API:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });

        if (axiosError.response?.data) {
          throw new Error(
            `CinetPay API Error (${axiosError.response.data.code}): ${axiosError.response.data.message}`
          );
        }
      }

      console.error("❌ CinetPay - Erreur inattendue:", error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'une transaction
   */
  async verifyTransaction(
    transaction_id: string
  ): Promise<CinetPayVerificationResponse> {
    try {
      const verificationData: CinetPayVerificationRequest = {
        apikey: this.apikey,
        site_id: this.site_id,
        transaction_id,
      };

      console.log("🔍 CinetPay - Vérification transaction:", transaction_id);

      const response = await axios.post<CinetPayVerificationResponse>(
        CINETPAY_VERIFY_URL,
        verificationData,
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AfrikipresseApp/1.0",
          },
          timeout: 30000,
        }
      );

      console.log("✅ CinetPay - Transaction vérifiée:", {
        status: response.data.data?.status,
        amount: response.data.data?.amount,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CinetPayVerificationResponse>;
        console.error("❌ CinetPay - Erreur vérification:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }

      throw error;
    }
  }

  /**
   * Valide une notification webhook de CinetPay
   */
  validateNotification(notification: CinetPayNotification): boolean {
    // Vérifier que les champs essentiels sont présents
    if (!notification.cpm_site_id || !notification.cpm_trans_id) {
      console.error("❌ Notification invalide - Champs manquants");
      return false;
    }

    // Vérifier que le site_id correspond
    if (notification.cpm_site_id !== this.site_id) {
      console.error("❌ Notification invalide - Site ID incorrect");
      return false;
    }

    return true;
  }

  /**
   * Traite une notification webhook
   */
  processNotification(notification: CinetPayNotification): {
    isSuccess: boolean;
    transactionId: string;
    amount: number;
    status: string;
  } {
    const isSuccess =
      notification.cpm_trans_status === TRANSACTION_STATUS.ACCEPTED ||
      notification.cpm_result === "00";

    return {
      isSuccess,
      transactionId: notification.cpm_trans_id,
      amount: parseFloat(notification.cpm_amount),
      status: notification.cpm_trans_status,
    };
  }
}

// Instance singleton
let cinetpayClient: CinetPayClient | null = null;

/**
 * Retourne une instance du client CinetPay
 */
export function getCinetPayClient(): CinetPayClient {
  if (!cinetpayClient) {
    cinetpayClient = new CinetPayClient();
  }
  return cinetpayClient;
}
