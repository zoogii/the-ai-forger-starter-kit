# VibeCoding Stack - Next.js + Stripe + NextAuth

A complete full-stack starter kit that integrates Next.js with Stripe payments, NextAuth authentication, and ShadcnUI components. This project provides a solid foundation for building SaaS applications with subscription-based business models.

## 🚀 Features

### Authentication & Authorization

- **NextAuth.js** integration with Prisma adapter
- **Google OAuth** authentication
- **Role-based access control** (USER, PREMIUM, ADMIN)
- Session management and middleware protection
- User profile management

### Database & ORM

- **Prisma** ORM for type-safe database operations
- **PostgreSQL** database with enum support
- Automated schema migrations
- Database seeding support
- **Simplified schema** - Stripe products as single source of truth

### Payments & Subscriptions

- **Stripe** integration for payment processing
- Subscription management with webhooks
- Dynamic pricing from Stripe products
- Customer portal integration
- Automatic subscription status updates
- **Payment history tracking**

### Token System

- **Token-based usage tracking** from Stripe product metadata
- Automatic token allocation on subscription
- **30-day token expiration** with auto-renewal for active subscriptions
- Token consumption tracking
- Admin token management

### Admin Panel

- **Comprehensive admin dashboard** at `/admin`
- User management and role assignment
- Subscription and payment overview
- Product and token management
- System statistics and analytics

### UI & Components

- **ShadcnUI** component library
- **Tailwind CSS** for styling
- Responsive design
- Dark mode support (Tailwind-based)
- Toast notifications with Sonner

### Content Access Control

- Free tier content (authenticated users)
- Premium content (subscription required)
- **Token-based feature access**
- Role-based access control
- Subscription status validation

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth API routes
│   │   └── stripe/
│   │       ├── checkout/           # Stripe checkout session
│   │       └── webhooks/           # Stripe webhooks
│   ├── admin/                      # Admin panel (ADMIN role only)
│   ├── auth/
│   │   └── signin/                 # Sign-in page
│   ├── dashboard/                  # User dashboard with tokens
│   ├── free-content/               # Free tier content
│   ├── premium-content/            # Premium subscriber content
│   ├── pricing/                    # Pricing and plans page
│   └── error/                      # Error handling page
├── components/
│   ├── admin/                      # Admin dashboard components
│   ├── auth/                       # Authentication components
│   ├── dashboard/                  # Dashboard components
│   ├── pricing/                    # Pricing components
│   ├── providers/                  # Context providers
│   └── ui/                         # ShadcnUI components
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── stripe.ts                   # Stripe configuration
│   ├── stripe-admin.ts             # Stripe admin functions
│   └── subscription.ts             # Subscription & token utilities
├── prisma/
│   ├── schema.prisma               # Database schema with enums
│   ├── seed.ts                     # Stripe product sync
│   └── seed-admin.ts               # Admin user setup
└── types/
    └── next-auth.d.ts              # NextAuth type extensions
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vibecoding"

# NextAuth (Generate a random secret with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-32-characters-minimum"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Admin Setup
ADMIN_EMAIL="your-admin-email@example.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup

#### PostgreSQL Setup

1. Install PostgreSQL locally or use a cloud provider
2. Create a new database for the project
3. Update the `DATABASE_URL` in your environment variables

#### Database Schema

```bash
# Generate Prisma client
yarn prisma generate

# Push schema to database
yarn prisma db push

# Sync products from Stripe to database
yarn db:sync-stripe

# Set up admin user (requires ADMIN_EMAIL env var)
yarn db:setup-admin
```

### 3. Authentication Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### 4. Stripe Setup

#### Stripe Dashboard

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Developers > API keys
3. Create products and prices in the dashboard
4. Set up webhooks pointing to `/api/stripe/webhooks`

#### Product Configuration for Tokens

To enable token allocation, add metadata to your Stripe products:

```json
{
  "tokens": "100"
}
```

This will allocate 100 tokens to users when they subscribe to this product.

#### Webhook Events

Configure these webhook events in Stripe:

- `product.created`
- `product.updated`
- `product.deleted`
- `price.created`
- `price.updated`
- `price.deleted`
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`

### 5. Admin Setup

After setting up the database and environment variables:

1. **First, the user must sign in** to create their database record
2. **Then run the admin setup command**:

```bash
# Set up admin user (user must exist in database first)
yarn db:setup-admin
```

This will update an existing user with the email specified in `ADMIN_EMAIL` and assign them the ADMIN role. The user must have signed in at least once for their record to exist in the database.

### 6. Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:3000
```

## 🎯 Key Features Explained

### Token System

- **Automatic Allocation**: Tokens are automatically allocated based on Stripe product metadata
- **Expiration**: Tokens expire every 30 days
- **Auto-Renewal**: Active subscribers get their tokens renewed automatically
- **Usage Tracking**: Track token consumption across your application

### Admin Panel

Access the admin panel at `/admin` (requires ADMIN role):

- **User Management**: View all users, their roles, and token balances
- **Subscription Overview**: Monitor active subscriptions and revenue
- **Payment History**: Track all payments and their status
- **Product Management**: View Stripe products and their token allocations

### Role-Based Access

- **USER**: Basic authenticated users
- **PREMIUM**: Users with active subscriptions
- **ADMIN**: Full system access including admin panel

### Simplified Architecture

The system now uses Stripe products as the single source of truth:

- No redundant membership tier tables
- Direct integration with Stripe data
- Simplified database schema
- Better performance with fewer joins

## 🚦 Usage

### User Flow

1. **Landing Page**: Introduction and feature overview
2. **Authentication**: Sign in with Google
3. **Dashboard**: Overview of available content
4. **Free Content**: Accessible to all authenticated users
5. **Premium Content**: Requires active subscription
6. **Pricing**: Subscribe to premium plans
7. **Subscription Management**: View and manage subscriptions

### Access Control

- **Public**: Landing page, pricing, authentication
- **Authenticated**: Dashboard, free content
- **Subscribed**: Premium content, advanced features

## 🔒 Security Features

- Server-side session validation
- Protected API routes
- Stripe webhook signature verification
- Environment variable validation
- SQL injection prevention (Prisma)

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds

### Other Platforms

- **Netlify**: Configure build settings
- **Railway**: Direct deployment from GitHub
- **DigitalOcean**: App Platform deployment

## 🧪 Testing

```bash
# Run type checking
yarn type-check

# Run linting
yarn lint

# Build for production
yarn build
```

## 📚 Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [ShadcnUI Documentation](https://ui.shadcn.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation links above
- Review the environment variable requirements

---

**Note**: This is a starter template designed for developers. All credentials and API keys need to be configured before the application will work properly.

## 🐛 Troubleshooting

### JWT Session Error (Invalid Compact JWE)

If you encounter a JWT session error, it's usually due to:

1. **Missing or invalid NEXTAUTH_SECRET**: Generate a proper secret:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```
2. **Cached sessions**: Clear Next.js cache and browser cookies:

   ```bash
   rm -rf .next
   # or on Windows
   Remove-Item -Recurse -Force .next
   ```

3. **Environment variables**: Ensure all required env vars are set correctly.

### Running Stripe CLI for Webhooks

To test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```
