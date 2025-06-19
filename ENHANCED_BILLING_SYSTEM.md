# 💰 Enhanced Billing System - Yumi-Series

## Overview

The new **Flexible Token System** leverages native free models from providers while maintaining a premium token pool for advanced models. This hybrid approach maximizes value for users by providing unlimited access to capable free models and reserved tokens for premium capabilities.

## 🎯 System Architecture

### Free Tier Structure

| Resource | Allocation | Details |
|----------|------------|---------|
| **Native Free Models** | Unlimited | Within provider limits |
| **Premium Tokens** | 10,000/month | For paid models only |
| **Reset Period** | Monthly | Automatic renewal |

### Provider Categories

#### 🆓 **Native Free Models**
- **Qwen Models**: 1M tokens/month each
  - qwen-turbo, qwen-plus, qwen-max
  - qwen-vl-plus, qwen-vl-max
- **OpenRouter Models**: 50 requests/day each
  - google/gemini-2.5-pro, google/gemini-2.5-pro-vision
  - meta-llama/llama-3-70b-instruct, meta-llama/llama-3-8b-instruct
  - mistralai/mistral-7b-instruct, mistralai/mixtral-8x7b-instruct
  - microsoft/wizardlm-2-8x22b

#### ⚡ **Premium Models** (Require Tokens)
- **OpenAI**: All GPT models (gpt-4, gpt-4-turbo, gpt-4o, etc.)
- **Claude**: All Anthropic models (opus, sonnet, haiku)
- **DeepSeek**: deepseek-chat, deepseek-coder

## 💎 Pricing Structure

### Free Tier
- **Cost**: $0/month
- **Premium Tokens**: 10,000 tokens
- **Free Models**: Unlimited access
- **Best For**: Casual users, testing, everyday tasks

### Token Packages (One-time Purchase)
1. **Starter Pack** - $5
   - 200K tokens
   - Never expires
   - Perfect for trying premium models

2. **Power Pack** - $10
   - 500K tokens
   - Great value for regular users

3. **Pro Pack** - $15
   - 1M tokens
   - Best value per token

4. **Ultra Pack** - $20
   - 2M tokens
   - For power users & teams

### Premium Monthly Subscription
- **Cost**: $10/month
- **Daily Allowance**: 30K tokens
- **Monthly Total**: 900K tokens
- **Benefits**: Priority processing, premium support
- **Best For**: Daily heavy users, professionals

## 🏗️ Technical Implementation

### Frontend Components

#### BillingStatus.tsx
- Displays current token balance
- Shows free model availability
- Usage statistics
- Reset countdown

#### Enhanced Billing API
- Model availability checking
- Usage tracking
- Token cost calculation
- Native limit enforcement

### Backend Architecture

#### Model Cost Configuration
```typescript
const modelCosts = {
  openai: {
    'gpt-4': { cost: 8, isFree: false },
    'gpt-4o': { cost: 5, isFree: false }
  },
  qwen: {
    'qwen-turbo': { cost: 0, isFree: true, nativeLimit: '1M tokens/month' }
  }
  // ...
}
```

#### Billing Logic
- **Free Models**: Track against native limits only
- **Premium Models**: Deduct from user token balance
- **Usage Logging**: Separate tracking for different model types

### Database Schema Updates
```sql
ALTER TABLE user_billing ADD COLUMN premium_tokens INTEGER DEFAULT 10000;
ALTER TABLE user_billing ADD COLUMN qwen_tokens_used INTEGER DEFAULT 0;
ALTER TABLE user_billing ADD COLUMN openrouter_requests_used INTEGER DEFAULT 0;
ALTER TABLE user_billing ADD COLUMN next_reset TIMESTAMP;
```

## 🚀 User Benefits

### Storage Efficiency
- **Core App**: ~15MB (essential features only)
- **With All Modes**: ~50MB
- **Selective Installation**: Up to 70% storage savings

### Cost Optimization
- **Free Models**: Zero cost for most use cases
- **Premium Tokens**: Reserved for advanced needs only
- **No Waste**: Tokens never expire (packages)

### User Experience
- **Transparent Billing**: Clear free vs premium distinction
- **Easy Upgrades**: Seamless token purchase flow
- **Usage Insights**: Detailed consumption tracking

## 📊 Model Recommendations

### For Beginners
1. **Qwen Turbo** - Fast, reliable, free
2. **Gemini 2.5 Pro** - Advanced reasoning, free
3. **Llama 3 70B** - Open source excellence, free

### For Power Users
1. **GPT-4o** - Best balance of cost/performance
2. **Claude Sonnet** - Superior reasoning
3. **GPT-4 Turbo** - Complex tasks

### For Developers
1. **DeepSeek Coder** - Code-specific training
2. **Claude Opus** - Complex problem solving
3. **GPT-4** - Comprehensive capabilities

## 🔄 Migration Strategy

### From Old System
1. **Token Balance**: Migrate existing tokens to premium pool
2. **Usage History**: Preserve for analytics
3. **Subscription Status**: Maintain current plans

### Rollout Plan
1. **Phase 1**: Backend API updates
2. **Phase 2**: Frontend billing UI
3. **Phase 3**: Usage tracking integration
4. **Phase 4**: User migration & communication

## 📈 Success Metrics

### User Adoption
- Free model usage rates
- Premium token consumption patterns
- Subscription conversion rates

### Technical Performance
- API response times
- Billing calculation accuracy
- Database query optimization

### Business Impact
- Revenue per user improvement
- Support ticket reduction
- User retention rates

## 🔮 Future Enhancements

### Planned Features
- **Token Sharing**: Team/family plans
- **Usage Analytics**: Detailed consumption insights
- **Smart Recommendations**: AI-driven model suggestions
- **Bulk Discounts**: Enterprise pricing tiers

### Integration Opportunities
- **Third-party APIs**: Additional free model providers
- **Partner Programs**: Discounted premium access
- **Educational Tiers**: Student/researcher pricing

---

This enhanced billing system positions Yumi-Series as a **freemium platform** that provides exceptional value through native free models while monetizing advanced capabilities fairly and transparently. 