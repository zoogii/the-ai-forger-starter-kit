import {
  MembershipStatus,
  PrismaClient,
  UserRole,
} from "../app/generated/prisma";
import { stripe } from "./stripe";
import { manageSubscriptionStatusChange } from "./stripe-admin";

const prisma = new PrismaClient();

export const syncUserStripeData = async (userId: string) => {
  try {
    const customer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!customer) return;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripeCustomerId,
      limit: 10,
    });

    for (const subscription of subscriptions.data) {
      await manageSubscriptionStatusChange(
        subscription.id,
        subscription.customer as string,
        false
      );
    }

    console.log(`Synced data for user ${userId}`);
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

export const getUserSubscription = async (userId: string, autoSync = true) => {
  if (autoSync) {
    await syncUserStripeData(userId);
  }
  
  return await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
    },
    include: {
      stripeProduct: true,
      stripePrice: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUserActiveSubscriptions = async (userId: string) => {
  return await prisma.userSubscription.findMany({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
    },
    include: {
      stripeProduct: true,
      stripePrice: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const hasActiveSubscription = async (
  userId: string
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return !!subscription;
};

export const getSubscriptionTier = async (userId: string) => {
  const subscription = await getUserSubscription(userId);
  return subscription?.stripeProduct || null;
};

export const updateUserTokens = async (userId: string, productId: string) => {
  const product = await prisma.stripeProduct.findUnique({
    where: { id: productId },
  });

  if (!product?.metadata) return;

  const metadata = product.metadata as any;
  const tokens = parseInt(metadata.tokens || "0");

  if (tokens > 0) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.user.update({
      where: { id: userId },
      data: {
        tokens,
        tokensExpiresAt: expiresAt,
      },
    });
  }
};

export const getUserTokens = async (
  userId: string
): Promise<{
  tokens: number;
  expired: boolean;
  expiresAt?: Date | null;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokens: true,
      tokensExpiresAt: true,
      stripeProductId: true,
      membershipStatus: true,
    },
  });

  if (!user) return { tokens: 0, expired: true };

  const now = new Date();
  const expired = user.tokensExpiresAt ? user.tokensExpiresAt < now : true;

  if (
    expired &&
    user.membershipStatus === MembershipStatus.ACTIVE &&
    user.stripeProductId
  ) {
    await updateUserTokens(userId, user.stripeProductId);
    return getUserTokens(userId);
  }

  return {
    tokens: expired ? 0 : user.tokens,
    expired,
    expiresAt: user.tokensExpiresAt,
  };
};

export const consumeTokens = async (userId: string, amount: number = 1) => {
  const tokenInfo = await getUserTokens(userId);

  if (tokenInfo.expired || tokenInfo.tokens < amount) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: {
        decrement: amount,
      },
    },
  });

  return true;
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
};

export async function checkUserAccess(userId: string, autoSync = true) {
  // Auto-sync user data if enabled
  if (autoSync) {
    await syncUserStripeData(userId);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: {
          status: { in: ["active", "trialing"] },
        },
        include: {
          stripeProduct: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      hasAccess: false,
      subscription: null,
      user: null,
    };
  }

  const activeSubscription = user.subscriptions[0] || null;
  const hasAccess = user.role === UserRole.ADMIN || !!activeSubscription;

  return {
    hasAccess,
    subscription: activeSubscription,
    user,
  };
}

export async function updateUserMembership(
  userId: string,
  stripeProductId: string | null,
  membershipStatus: MembershipStatus = MembershipStatus.ACTIVE
) {
  // Get current user to check if they're an admin
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Preserve admin role, otherwise set based on subscription
  const role = currentUser?.role === UserRole.ADMIN 
    ? UserRole.ADMIN 
    : stripeProductId ? UserRole.PREMIUM : UserRole.USER;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeProductId,
      membershipStatus,
      role,
    },
  });
}

export async function getStripeProducts() {
  try {
    return await prisma.stripeProduct.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        prices: {
          where: { active: true },
          orderBy: { unitAmount: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    // Return empty array as fallback
    return [];
  }
}

// Helper function to check if user has access to specific content
export function hasProductAccess(
  userProductId: string | null,
  requiredProductId: string | null
): boolean {
  if (!requiredProductId) return true;
  if (!userProductId) return false;
  return userProductId === requiredProductId;
}

// Helper function to check if user has any premium access
export function hasPremiumAccess(userProductId: string | null): boolean {
  return !!userProductId;
}

// Get product features from metadata
export function getProductFeatures(product: any): string[] {
  if (!product?.metadata?.features) return [];
  try {
    return JSON.parse(product.metadata.features);
  } catch {
    return [];
  }
}

// Get product display name from metadata or use product name
export function getProductDisplayName(product: any): string {
  return product?.metadata?.displayName || product?.name || "Unknown";
}

// Legacy function for backward compatibility - maps to new system
export async function getMembershipTiers() {
  try {
    const products = await getStripeProducts();

    // Transform Stripe products to look like old membership tiers for compatibility
    return products.map((product, index) => ({
      id: product.id,
      name: product.name.toLowerCase().replace(/\s+/g, "_"),
      displayName: getProductDisplayName(product),
      description: product.description || "",
      price: product.prices[0]?.unitAmount || 0,
      currency: product.prices[0]?.currency || "usd",
      interval: product.prices[0]?.interval || null,
      features: getProductFeatures(product),
      isActive: product.active,
      sortOrder: index,
      stripeProducts: [product], // Wrap in array for compatibility
    }));
  } catch (error) {
    console.error("Error fetching membership tiers:", error);
    return [];
  }
}
