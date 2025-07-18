# Payment System & Stripe Integration

## Stripe Configuration

### Setup Files
- `lib/stripe.ts` - Basic Stripe client configuration
- `lib/stripe-admin.ts` - Admin functions for subscription management
- `app/api/stripe/` - API routes for Stripe integration

### Environment Variables
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_/sk_live_)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret

## Payment Flow

### 1. Checkout Process
1. User selects pricing plan
2. Frontend calls `/api/stripe/checkout`
3. Stripe checkout session created
4. User redirected to Stripe checkout
5. Payment processed by Stripe
6. Webhook updates database
7. User redirected back to app

### 2. Subscription Management
- Customer portal access via `/api/stripe/customer-portal`
- Subscription updates handled via webhooks
- Automatic role and token updates

## Database Integration

### Stripe Data Models
- `StripeProduct` - Products from Stripe (single source of truth)
- `StripePrice` - Pricing information
- `StripeCustomer` - Customer records
- `UserSubscription` - Active subscriptions
- `PaymentHistory` - Payment tracking

### Data Synchronization
- Automatic sync via webhooks
- Manual sync via `npm run db:sync-stripe`
- Cached sync (5-minute intervals) for performance

## Token System

### Token Allocation
- Configured via Stripe product metadata
- Example: `{"tokens": "100"}` allocates 100 tokens
- Automatic allocation on subscription activation

### Token Management
- 30-day expiration period
- Auto-renewal for active subscribers
- Consumption tracking via `consumeTokens()`

### Token Functions
```typescript
// lib/subscription.ts
export const updateUserTokens = async (userId: string, productId: string)
export const getUserTokens = async (userId: string)
export const consumeTokens = async (userId: string, amount: number)
```

## Webhook Architecture

### Supported Events
- `product.created/updated/deleted`
- `price.created/updated/deleted`
- `customer.subscription.created/updated/deleted`
- `checkout.session.completed`
- `payment_intent.succeeded`

### Webhook Security
- Signature verification using `STRIPE_WEBHOOK_SECRET`
- Idempotent event processing
- Error handling and logging

### Event Processing
```typescript
// app/api/stripe/webhooks/route.ts
const relevantEvents = new Set([
  'product.created',
  'product.updated',
  // ... other events
]);
```

## Subscription Management

### Subscription States
- `active` - Currently subscribed
- `trialing` - In trial period
- `canceled` - Subscription ended
- `past_due` - Payment failed
- `incomplete` - Payment pending

### User Role Updates
- Automatic role assignment based on subscription status
- `PREMIUM` role for active subscriptions
- `USER` role when subscription ends
- Admin role preserved during subscription changes

## Product Configuration

### Stripe Product Setup
1. Create products in Stripe dashboard
2. Add pricing (monthly/yearly)
3. Configure metadata for token allocation
4. Set webhook endpoints

### Metadata Format
```json
{
  "tokens": "100",
  "displayName": "Pro Plan",
  "features": "[\"Feature 1\", \"Feature 2\"]",
  "sortOrder": "1"
}
```

## Customer Portal

### Features
- View subscription details
- Update payment methods
- Download invoices
- Cancel subscriptions
- View payment history

### Implementation
```typescript
// Redirect to customer portal
const response = await fetch('/api/stripe/customer-portal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: user.stripeCustomerId })
});
```

## Testing Setup

### Stripe CLI
- Install Stripe CLI for local webhook testing
- Forward webhooks to local development server
- Test webhook events locally

### Test Data
- Use Stripe test cards for payment testing
- Test subscription lifecycle events
- Verify webhook event handling

## Error Handling

### Common Issues
- Webhook signature verification failures
- Missing customer records
- Subscription sync delays
- Payment method failures

### Debugging
- Check Stripe dashboard for webhook logs
- Review Next.js function logs
- Verify environment variables
- Test webhook endpoints manually