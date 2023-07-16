import Stripe from 'stripe';

export const stripe = new Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  apiVersion: '2022-11-15',
});
