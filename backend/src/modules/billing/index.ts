import express, { Router, Request, Response } from 'express';
import { BillingService } from './services/core';
import { authenticateUser, AuthRequest } from '../../auth';
import { 
  TOKEN_PACKAGES, 
  PREMIUM_PLANS, 
  calculateAlipayPrice, 
  getTokenPackageById, 
  getPremiumPlanById, 
  isSubscriptionPlan,
  TokenPackage,
  PremiumPlan,
  UserBillingInfo,
  PaymentSession,
  TokenUsage
} from './types';
import Stripe from 'stripe';
import debug from 'debug';
import { PrismaClient } from '@prisma/client';
import { wrapHandler, wrapAuthHandler } from '../shared/types';

const router = Router();
const billingService = new BillingService();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});
const prisma = new PrismaClient();

const log = debug('app:billing:router');

interface AlipayWebhookBody {
  out_trade_no: string;
  trade_status: string;
  total_amount: string;
  [key: string]: any;
}

// Get user's billing info
router.get('/info', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  
  log('Getting billing info for user:', req.user.id);
  const info = await billingService.getUserBillingInfo(String(req.user.id));
  log('Billing info retrieved:', info);
  
  return {
    tokens: info.dailyTokensRemaining,
    dailyTokensRemaining: info.dailyTokensRemaining,
    blessingActive: info.hasAccessToImageGen,
    freeTokensRemaining: info.freeTokensRemaining
  };
}));

// Get available packages and plans
router.get('/packages', authenticateUser, wrapAuthHandler(async (_req: AuthRequest, _res: Response) => {
  return {
    packages: TOKEN_PACKAGES,
    plans: PREMIUM_PLANS
  };
}));

// Create payment session
router.post('/payment', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { packageId, provider = 'stripe' } = req.body;
  
  if (!packageId) {
    res.status(400).json({ error: 'Package ID is required' });
    return;
  }

  try {
    const url = await billingService.createCheckoutSession(
      String(req.user.id),
      packageId,
      undefined,
      provider
    );
    
    return { url };
  } catch (error) {
    log('Payment session creation error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
    return;
  }
}));

// Stripe webhook
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), wrapHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  log('Received Stripe webhook:', { signature: sig });
  
  if (!sig) {
    log('Missing Stripe signature');
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    log('Missing Stripe webhook secret');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }
  
  const event = stripe.webhooks.constructEvent(
    req.body as Buffer,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  log('Stripe webhook event:', { type: event.type });
  
  await billingService.handleStripeWebhook(event);
  return { received: true };
}));

// Alipay webhook
router.post('/webhook/alipay', express.urlencoded({ extended: true }), wrapHandler(async (req: Request, res: Response) => {
  const webhookBody = req.body as AlipayWebhookBody;
  log('Received Alipay webhook:', webhookBody);
  
  if (!webhookBody.out_trade_no || !webhookBody.trade_status) {
    log('Invalid Alipay webhook payload');
    res.status(400).json({ error: 'Invalid webhook payload' });
    return;
  }
  
  await billingService.handleAlipayWebhook(webhookBody);
  return { success: true };
}));

// Get token usage
router.get('/token-usage', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  log('Getting token usage for user:', req.user.id);
  const info = await billingService.getUserBillingInfo(String(req.user.id));
  return {
    totalTokensUsed: info.totalTokensUsed,
    freeTokensRemaining: info.freeTokensRemaining
  };
}));

// Get image generation access status
router.get('/image-gen-status', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  log('Getting image generation status for user:', req.user.id);
  
  const user = await prisma.user.findUnique({
    where: { id: String(req.user.id) },
    include: {
      billing: true,
      imageGenUsage: {
        where: {
          type: 'free_trial'
        }
      }
    }
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const hasActiveSubscription = user.billing?.subscriptionStatus === 'active';
  const hasTrialUsage = user.imageGenUsage.length > 0;
  const canAccessImageGen = hasActiveSubscription || !hasTrialUsage;

  return {
    canAccess: canAccessImageGen,
    hasActiveSubscription,
    hasTrialUsage
  };
}));

export default router;

export interface BillingResult {
  success: boolean;
  error?: string;
  remainingCredits?: number;
}

export async function chargeUserCredits(userId: string, amount: number): Promise<BillingResult> {
  try {
    log('Charging user credits:', { userId, amount });
    // For now, just return success since we're not implementing real billing yet
    return {
      success: true,
      remainingCredits: 100
    };
  } catch (error) {
    log('Error charging user credits:', error);
    return {
      success: false,
      error: 'Failed to charge credits'
    };
  }
}

export { BillingService };
export { 
  TOKEN_PACKAGES, 
  PREMIUM_PLANS, 
  calculateAlipayPrice,
  getTokenPackageById,
  getPremiumPlanById,
  isSubscriptionPlan
};
// @ts-ignore: Type exports
export type { 
  TokenPackage, 
  PremiumPlan, 
  UserBillingInfo, 
  PaymentSession,
  TokenUsage 
}; 