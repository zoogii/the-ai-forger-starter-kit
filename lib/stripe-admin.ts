import Stripe from "stripe";
import {
  MembershipStatus,
  PrismaClient,
  UserRole,
} from "../app/generated/prisma";
import { stripe } from "./stripe";
import { updateUserTokens } from "./subscription";

const prisma = new PrismaClient();

const TRIAL_PERIOD_DAYS = 0;

export const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description || null,
    metadata: product.metadata || {},
  };

  try {
    await prisma.stripeProduct.upsert({
      where: { id: product.id },
      update: productData,
      create: productData,
    });
    console.log(`Product inserted/updated: ${product.id}`);
  } catch (error) {
    console.error("Product insert/update failed:", error);
    throw error;
  }
};

export const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData = {
    id: price.id,
    productId: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    type: price.type,
    unitAmount: price.unit_amount || null,
    interval: price.recurring?.interval || null,
    intervalCount: price.recurring?.interval_count || null,
    trialPeriodDays: price.recurring?.trial_period_days || TRIAL_PERIOD_DAYS,
    metadata: price.metadata || {},
  };

  try {
    await prisma.stripePrice.upsert({
      where: { id: price.id },
      update: priceData,
      create: priceData,
    });
    console.log(`Price inserted/updated: ${price.id}`);
  } catch (error: any) {
    if (error.code === "P2003" && retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      console.error("Price insert/update failed:", error);
      throw error;
    }
  }
};

export const deleteProductRecord = async (product: Stripe.Product) => {
  try {
    await prisma.stripeProduct.delete({
      where: { id: product.id },
    });
    console.log(`Product deleted: ${product.id}`);
  } catch (error) {
    console.error("Product deletion failed:", error);
    throw error;
  }
};

export const deletePriceRecord = async (price: Stripe.Price) => {
  try {
    await prisma.stripePrice.delete({
      where: { id: price.id },
    });
    console.log(`Price deleted: ${price.id}`);
  } catch (error) {
    console.error("Price deletion failed:", error);
    throw error;
  }
};

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  try {
    const existingCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: uuid },
    });

    let stripeCustomerId: string | undefined;

    if (existingCustomer?.stripeCustomerId) {
      try {
        const existingStripeCustomer = await stripe.customers.retrieve(
          existingCustomer.stripeCustomerId
        );
        stripeCustomerId = existingStripeCustomer.id;
      } catch (error) {
        console.warn("Stripe customer not found, will create new one");
        stripeCustomerId = undefined;
      }
    }

    if (!stripeCustomerId) {
      const stripeCustomers = await stripe.customers.list({ email });
      stripeCustomerId =
        stripeCustomers.data.length > 0
          ? stripeCustomers.data[0].id
          : undefined;
    }

    if (!stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: { userUUID: uuid },
      });
      stripeCustomerId = newCustomer.id;
    }

    await prisma.stripeCustomer.upsert({
      where: { userId: uuid },
      update: { stripeCustomerId },
      create: { userId: uuid, stripeCustomerId },
    });

    return stripeCustomerId;
  } catch (error) {
    console.error("Customer creation/retrieval failed:", error);
    throw error;
  }
};

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  try {
    const customerData = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!customerData) {
      throw new Error(`Customer lookup failed for Stripe ID: ${customerId}`);
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"],
    });

    // Get the price to determine product
    const priceId = subscription.items.data[0].price.id;
    const priceData = await prisma.stripePrice.findUnique({
      where: { id: priceId },
      include: {
        product: true,
      },
    });

    if (!priceData) {
      throw new Error(`Price lookup failed for ID: ${priceId}`);
    }

    // Helper function to safely convert timestamps
    const toDate = (timestamp: number | null | undefined): Date | null => {
      return timestamp ? new Date(timestamp * 1000) : null;
    };

    // Cast subscription to access all properties
    const sub = subscription as any;

    const subscriptionData = {
      id: subscription.id,
      userId: customerData.userId,
      stripeCustomerId: customerData.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeProductId: priceData.productId,
      status: subscription.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      canceledAt: toDate(sub.canceled_at),
      currentPeriodStart: toDate(sub.current_period_start) || new Date(),
      currentPeriodEnd: toDate(sub.current_period_end) || new Date(),
      trialStart: toDate(sub.trial_start),
      trialEnd: toDate(sub.trial_end),
      metadata: subscription.metadata || {},
    };

    await prisma.userSubscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: subscriptionData,
      create: subscriptionData,
    });

    // Update user subscription status
    if (
      subscription.status === "active" ||
      subscription.status === "trialing"
    ) {
      await prisma.user.update({
        where: { id: customerData.userId },
        data: {
          stripeProductId: priceData.productId,
          membershipStatus: MembershipStatus.ACTIVE,
          role: UserRole.PREMIUM,
        },
      });

      await updateUserTokens(customerData.userId, priceData.productId);
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired"
    ) {
      await prisma.user.update({
        where: { id: customerData.userId },
        data: {
          stripeProductId: null,
          membershipStatus: MembershipStatus.INACTIVE,
          role: UserRole.USER,
        },
      });
    }

    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error("Subscription status change failed:", error);
    throw error;
  }
};

export const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  try {
    const customerId = paymentIntent.customer as string;
    if (!customerId) return;

    const customerData = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!customerData) return;

    let stripeProductId: string | null = null;
    let description = "Payment";

    if (paymentIntent.metadata?.subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(
        paymentIntent.metadata.subscription_id
      );
      const priceId = subscription.items.data[0]?.price.id;
      if (priceId) {
        const priceData = await prisma.stripePrice.findUnique({
          where: { id: priceId },
          include: { product: true },
        });
        stripeProductId = priceData?.productId || null;
        description = `Subscription: ${priceData?.product.name || "Unknown"}`;
      }
    }

    await prisma.paymentHistory.create({
      data: {
        userId: customerData.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        stripeProductId,
        description,
        metadata: paymentIntent.metadata || {},
      },
    });

    console.log(`Payment history recorded: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Payment history recording failed:", error);
  }
};
