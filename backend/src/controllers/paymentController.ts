import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types/express';
import { createCheckoutSession, createCustomer, STRIPE_PRICE_ID_FEATURED, STRIPE_PRICE_ID_PREMIUM } from '../config/stripe';

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { listingId, paymentType } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let stripeCustomerId = undefined;
    let subscription = await prisma.sellerSubscription.findUnique({ where: { userId } });
    
    if (!subscription) {
      const customer = await createCustomer({
        email: user.email,
        name: user.name,
        userId: user.id,
      });
      stripeCustomerId = customer.id;
      
      subscription = await prisma.sellerSubscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
          plan: 'free',
        },
      });
    } else {
      stripeCustomerId = subscription.stripeCustomerId || undefined;
    }

    const priceId = paymentType === 'featured' ? STRIPE_PRICE_ID_FEATURED : STRIPE_PRICE_ID_PREMIUM;
    const successUrl = `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel`;

    const session = await createCheckoutSession({
      priceId,
      userId: user.id,
      listingId,
      customerId: stripeCustomerId,
      successUrl,
      cancelUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const event = require('../config/stripe').constructWebhookEvent(req.body, sig);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, listingId } = session.metadata;

        await prisma.payment.create({
          data: {
            userId,
            listingId,
            amount: session.amount_total / 100,
            currency: session.currency,
            stripePaymentId: session.payment_intent as string,
            stripeCustomerId: session.customer as string,
            paymentType: 'featured',
            paymentStatus: 'COMPLETED',
          },
        });

        if (listingId) {
          const boostDays = session.metadata.paymentType === 'featured' ? 7 : 30;
          await prisma.listing.update({
            where: { id: listingId },
            data: {
              isBoosted: true,
              boostExpiry: new Date(Date.now() + boostDays * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await prisma.sellerSubscription.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripeSubId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await prisma.sellerSubscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: { status: 'canceled' },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const subscription = await prisma.sellerSubscription.findUnique({
      where: { userId },
    });

    res.json(subscription || null);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
