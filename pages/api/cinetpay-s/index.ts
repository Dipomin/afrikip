import axios from "axios";

import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/supabase-server";
import { SITE_URL } from "../../../lib/constants";

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {

  if(req.method === "POST" ) {
    try {
      const session = getSession();
      
      if (!session) {
        res.status(401).json({ error: 'Non authorisé' });
        return;
      }

      const formData = req.body;
      const {
        customer_name,
        customer_surname,
        customer_email,
        customer_phone_number,
        customer_address,
        customer_city,
        customer_country,
        customer_state,
        customer_zip_code,
      } = formData;
  
      const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
        apikey: process.env.CINETPAY_KEY!,
        site_id: process.env.CINETPAY_SITE_ID!,
        notify_url: `${SITE_URL}/mobile-payment/checkpayment-s/notify`,
        transaction_id:  Math.floor(Math.random() * 100000000).toString(),
        "amount": 6500,
        "currency": "XOF",
        "alternative_currency": "",
        "description": " Abonnement semestriel à Afrikipresse ",
        customer_id: Math.floor(Math.random() * 100000000).toString(),
        customer_name,
        customer_surname,
        customer_email,
        customer_phone_number,
        customer_address,
        customer_city,
        customer_country,
        customer_state,
        customer_zip_code,
        "return_url": `${SITE_URL}`,
        "channels": "MOBILE_MONEY",
      }
      );
      const payment_url = response.data.data.payment_url
      
      res.status(200).json({ payment_url });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  } else {
    res.status(405).end("Méthode non autorisée")
  }
}

