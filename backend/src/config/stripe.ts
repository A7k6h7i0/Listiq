import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const STRIPE_PRICE_ID_FEATURED = process.env.STRIPE_PRICE_ID_FEATURED || '';
export const STRIPE_PRICE_ID_PREMIUM = process.env.STRIPE_PRICE_ID_PREMIUM || '';

export const createCheckoutSession = async ({
  priceId,
  userId,
  listingId,
  customerId,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  listingId?: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      listingId: listingId || '',
    },
    customer: customerId,
  });

  return session;
};

export const createCustomer = async ({
  email,
  name,
  userId,
}: {
  email: string;
  name: string;
  userId: string;
}) => {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer;
};

export const createSubscription = async ({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
};

export const constructWebhookEvent = (payload: string | Buffer, signature: string) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
};
