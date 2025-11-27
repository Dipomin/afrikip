import { toDateTime } from './helpers';
import { stripe } from './stripe';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import Stripe from 'stripe';

type Status = "active" | "trialing" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid" | null | undefined;

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  try {
    await setDoc(doc(db, 'products', product.id), productData, { merge: true });
    console.log(`Product inserted/updated: ${product.id}`);
  } catch (error) {
    console.error('Error upserting product:', error);
    throw error;
  }
};

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata
  };

  try {
    await setDoc(doc(db, 'prices', price.id), priceData, { merge: true });
    console.log(`Price inserted/updated: ${price.id}`);
  } catch (error) {
    console.error('Error upserting price:', error);
    throw error;
  }
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  try {
    const customerDocRef = doc(db, 'customers', uuid);
    const customerDoc = await getDoc(customerDocRef);
    
    if (!customerDoc.exists() || !customerDoc.data()?.stripe_customer_id) {
      // No customer record found, let's create one.
      const customerData: { metadata: { firebaseUID: string }; email?: string } = {
        metadata: {
          firebaseUID: uuid
        }
      };
      if (email) customerData.email = email;
      
      const customer = await stripe.customers.create(customerData);
      
      // Now insert the customer ID into our Firestore mapping collection.
      await setDoc(customerDocRef, { 
        id: uuid, 
        stripe_customer_id: customer.id 
      });
      
      console.log(`New customer created and inserted for ${uuid}.`);
      return customer.id;
    }
    
    return customerDoc.data().stripe_customer_id;
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  
  try {
    await stripe.customers.update(customer, { name, phone, address });
    
    const userDocRef = doc(db, 'users', uuid);
    await setDoc(userDocRef, {
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    }, { merge: true });
  } catch (error) {
    console.error('Error copying billing details:', error);
    throw error;
  }
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  try {
    // Get customer's UUID from mapping collection.
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('stripe_customer_id', '==', customerId),
      firestoreLimit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error(`Customer not found for stripe_customer_id: ${customerId}`);
    }
    
    const customerData = snapshot.docs[0].data();
    const uuid = customerData.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method']
    });
    
    // Upsert the latest status of the subscription object.
    const subscriptionData = {
      id: subscription.id,
      user_id: uuid,
      metadata: subscription.metadata,
      status: subscription.status as Status,
      price_id: subscription.items.data[0].price.id,
      quantity: (subscription as any).quantity || 1,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      current_period_start: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      current_period_end: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      created: toDateTime(subscription.created).toISOString(),
      ended_at: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null
    };

    await setDoc(doc(db, 'subscriptions', subscription.id), subscriptionData, { merge: true });
    
    console.log(
      `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
    );

    // For a new subscription copy the billing details to the customer object.
    // NOTE: This is a costly operation and should happen at the very end.
    if (createAction && subscription.default_payment_method && uuid) {
      await copyBillingDetailsToCustomer(
        uuid,
        subscription.default_payment_method as Stripe.PaymentMethod
      );
    }
  } catch (error) {
    console.error('Error managing subscription status change:', error);
    throw error;
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange
};
