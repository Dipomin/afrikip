function Mobile() {
  const content = ` <!DOCTYPE html>
  <html>
  <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.cinetpay.com/seamless/main.js"></script>
      <style>
          .sdk {
              display: block;
              position: absolute;
              background-position: center;
              text-align: center;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
          }
      </style>
      <script>
          function checkout() {
              CinetPay.setConfig({
                  apikey: '187292382652e86174561d8.49574826',//   YOUR APIKEY
                  site_id: '125424',//YOUR_SITE_ID
                  notify_url: 'http://mondomaine.com/notify/',
                  mode: 'PRODUCTION'
              });
              CinetPay.getCheckout({
                  transaction_id: Math.floor(Math.random() * 100000000).toString(),
                  amount: 100,
                  currency: 'XOF',
                  channels: 'ALL',
                  description: 'Test de paiement',   
                   //Fournir ces variables pour le paiements par carte bancaire
                  customer_name:"Joe",//Le nom du client
                  customer_surname:"Down",//Le prenom du client
                  customer_email: "down@test.com",//l'email du client
                  customer_phone_number: "088767611",//l'email du client
                  customer_address : "BP 0024",//addresse du client
                  customer_city: "Antananarivo",// La ville du client
                  customer_country : "CM",// le code ISO du pays
                  customer_state : "CM",// le code ISO l'état
                  customer_zip_code : "06510", // code postal
  
              });
              CinetPay.waitResponse(function(data) {
                  if (data.status == "REFUSED") {
                      if (alert("Votre paiement a échoué")) {
                          window.location.reload();
                      }
                  } else if (data.status == "ACCEPTED") {
                      if (alert("Votre paiement a été effectué avec succès")) {
                          window.location.reload();
                      }
                  }
              });
              CinetPay.onError(function(data) {
                  console.log(data);
              });
          }
      </script>
  </head>
  <body>
      </head>
      <body>
          <div class="sdk">
              <h1>SDK SEAMLESS</h1>
              <button onclick="checkout()">Checkout</button>
          </div>
      </body>
  </html>   `;

  return (
    <div>
      <p dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
}

export default Mobile;

/** 
"use client";

import { useEffect } from "react";

let responseData;
let checkout;

// Définissez des types factices pour les arguments
type SetConfigArguments = {
  apikey: string | undefined;
  site_id: string | undefined;
  notify_url: string;
  mode: string;
};

type GetCheckoutArguments = {
  transaction_id: string;
  amount: number;
  currency: string;
  channels: string;
  description: string;
  customer_name: string;
  customer_surname: string;
  customer_email: string;
  customer_phone_number: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  customer_state: string;
  customer_zip_code: string;
};

// Simulez une définition de CinetPay pour éviter l'erreur
const CinetPay = {
  setConfig: (args: SetConfigArguments) => {},
  getCheckout: (args: GetCheckoutArguments) => {},
  waitResponse: (callback: (data: any) => void) => {}, // Mettez à jour la définition de waitResponse
  onError: (callback: (errorData: any) => void) => {}, // Mettez à jour la définition de onError
};

const CinetPayCheckout = () => {
  useEffect(() => {
    checkout = () => {
      let script = document.createElement("script");
      script.src = "https://cdn.cinetpay.com/seamless/main.js";
      script.async = true;

      script.onload = () => {
        CinetPay.setConfig({
          apikey: process.env.CINETPAY_KEY,
          site_id: process.env.CINETPAY_SITE_ID,
          notify_url: "http://localhost:3000/notify/",
          mode: "PRODUCTION",
        });

        CinetPay.getCheckout({
          transaction_id: Math.floor(Math.random() * 100000000).toString(),
          amount: 100,
          currency: "XOF",
          channels: "ALL",
          description: "Test paiement",
          customer_name: "Joe",
          customer_surname: "Down",
          customer_email: "down@test.com",
          customer_phone_number: "088767611",
          customer_address: "BP 0024",
          customer_city: "Antananarivo",
          customer_country: "CM",
          customer_state: "CM",
          customer_zip_code: "06510",
        });

        CinetPay.waitResponse(function (data) {
          responseData = data;
          if (responseData.status === "REFUSED") {
            if (
              window.confirm(
                "Votre paiement a échoué. Souhaitez-vous recharger la page ?"
              )
            ) {
              window.location.reload();
            }
          } else if (data.status === "ACCEPTED") {
            if (
              window.confirm(
                "Votre paiement a été effectué avec succès. Souhaitez-vous recharger la page ?"
              )
            ) {
              window.location.reload();
            }
          }
        });

        CinetPay.onError(function (errorData) {
          console.log(errorData);
        });
      };

      document.head.appendChild(script);
    };
  }, []);

  return (
    <div className="sdk">
      <h1>SDK SEAMLESS</h1>
      <button onClick={checkout}>Checkout</button>
    </div>
  );
};

export default CinetPayCheckout;

*/
