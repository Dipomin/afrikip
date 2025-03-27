import { User, createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Database } from "../../../../types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CinetPayCheck = () => {
  const [responseData, setResponseData] = useState(null);
  const router = useRouter();
  const session = useSession();
  const user: User | undefined = session?.user;

  console.log("Session:", session);

  const handleCheckPayment = async () => {
    try {
      const userId = user?.id;
      if (userId) {
        const getTransactionID = await supabase
          .from("mobilepayment")
          .select("transaction_id")
          .eq("user_foreign_key", userId);

        const transactionID: number | null | undefined =
          getTransactionID?.data?.[0]?.transaction_id;
        console.log("ID de la transaction:", transactionID);

        let apiUrl, requestBody;

        if (transactionID !== undefined) {
          apiUrl = "https://api-checkout.cinetpay.com/v2/payment/check";

          requestBody = {
            transaction_id: transactionID,
            site_id: "125424",
            apikey: "187292382652e86174561d8.49574826",
          };
        } else {
          console.error("Transaction ID is undefined.");
          return;
        }

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          if (data.data.status === "ACCEPTED") {
            const userEmail = user?.email;
            const paymentDate = new Date(data.data.payment_date);
            const expire_date = new Date(paymentDate);
            expire_date.setDate(paymentDate.getDate() + 180);

            const statusAbonnement = "active";

            const paymentData = {
              user_foreign_key: userId,
              amount: data.data.amount,
              currency: data.data.currency,
              status: data.data.status,
              payment_method: data.data.payment_method,
              description: data.data.description,
              operator_id: data.data.operator_id,
              statut_abonnement: statusAbonnement,
              payment_date: data.data.payment_date,
              expire_date: data.expire_date,
              fund_availability_date: data.data.fund_availability_date,
              message: data.message,
              api_response_id: data.api_response_id,
            };

            const { data: insertedPayment, error: insertError } = await supabase
              .from("mobilepayment")
              .update(paymentData)
              .eq("user_foreign_key", userId);

            if (insertError) {
              console.error(
                "Error inserting payment data:",
                insertError.message
              );
              return;
            }

            console.log("Payment data inserted:", insertedPayment);
            router.push("https://www.afrikipresse.fr/account");
          } else {
            alert("Votre paiement a échoué. Veuillez réessayer svp.");
          }

          setResponseData(data);
        } catch (error) {
          console.error("Error:", error.message);
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
};

export default CinetPayCheck;
