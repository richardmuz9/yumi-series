export interface BillingInfo {
  tokens: number;
  dailyTokensRemaining: number;
  blessingActive: boolean;
  freeTokensRemaining?: {
    openai: number;
    claude: number;
    qwen: number;
  };
  stripeCustomerId?: string;
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled';
    plan: 'free' | 'pro';
    nextBillingDate: string;
  };
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  description?: string;
  isPopular?: boolean;
  features?: string[];
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  description?: string;
  isPopular?: boolean;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  sessionId?: string;
} 