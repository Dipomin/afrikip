import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CinetPayCheck = () => {
  const [responseData, setResponseData] = useState(null);
  const router = useRouter();




  const handleCheckPayment = async () => {
    console.log("Payment check disabled (Supabase removed)");
  };
};

export default CinetPayCheck;
