import Stripe from "stripe";
import { stripe } from "../../../utils/stripe";
export default async function handler(req, res) {
if (req.method === "POST") {
   const { token } = JSON.parse(req.body);
if (!token) {
    return res.status(403).json({ msg: "Forbidden" });
 }
 
try {
 const customers = await stripe.customers.list(); // returns all customers sorted by createdDate
  res.status(200).json(customers);
} catch (err) {
  console.log(err);
  res.status(500).json({ error: true });
}
 }
}