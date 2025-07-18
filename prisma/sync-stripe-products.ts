import Stripe from "stripe";
import { PrismaClient } from "../app/generated/prisma";

/**
 * Stripe Products Sync Script
 *
 * This script syncs products and prices from your Stripe account to the local database.
 *
 * Usage:
 * - Set STRIPE_SECRET_KEY in your environment variables
 * - Run: npm run db:sync-stripe
 *
 * Behavior:
 * - Fetches all active products and prices from Stripe
 * - Stores them in the database, marking old ones as inactive
 * - Uses Stripe product metadata to store additional information like features
 */

const prisma = new PrismaClient();

async function syncStripeProducts() {
  console.log("🔄 Syncing products from Stripe...");

  // Initialize Stripe client
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
    appInfo: {
      name: "Forger Starter Kit",
      version: "0.1.0",
    },
  });

  try {
    // Fetch all products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    console.log(`📦 Found ${products.data.length} active products in Stripe`);

    // Fetch all prices for the products
    const prices = await stripe.prices.list({
      active: true,
    });

    console.log(`💰 Found ${prices.data.length} active prices in Stripe`);

    // Group prices by product
    const pricesByProduct = prices.data.reduce(
      (acc: Record<string, Stripe.Price[]>, price: Stripe.Price) => {
        const productId =
          typeof price.product === "string" ? price.product : price.product.id;
        if (!acc[productId]) {
          acc[productId] = [];
        }
        acc[productId].push(price);
        return acc;
      },
      {} as Record<string, Stripe.Price[]>
    );

    // Mark all existing products as inactive
    await prisma.stripeProduct.updateMany({
      data: { active: false },
    });

    await prisma.stripePrice.updateMany({
      data: { active: false },
    });

    console.log("🔄 Marked existing products/prices as inactive");

    // Process each Stripe product
    for (const product of products.data) {
      // Upsert the product
      const productData = {
        id: product.id,
        name: product.name,
        description: product.description || null,
        active: product.active,
        metadata: product.metadata || {},
      };

      await prisma.stripeProduct.upsert({
        where: { id: product.id },
        update: productData,
        create: productData,
      });

      console.log(`📦 Synced product: ${product.name}`);

      // Process prices for this product
      const productPrices = pricesByProduct[product.id] || [];
      for (const price of productPrices) {
        const priceData = {
          id: price.id,
          productId: product.id,
          active: price.active,
          currency: price.currency,
          type: price.type,
          unitAmount: price.unit_amount || null,
          interval: price.recurring?.interval || null,
          intervalCount: price.recurring?.interval_count || null,
          trialPeriodDays: price.recurring?.trial_period_days || null,
          metadata: price.metadata || {},
        };

        await prisma.stripePrice.upsert({
          where: { id: price.id },
          update: priceData,
          create: priceData,
        });

        console.log(
          `💰 Synced price: ${price.id} (${
            price.unit_amount ? price.unit_amount / 100 : 0
          } ${price.currency.toUpperCase()})`
        );
      }
    }

    console.log("🎉 Stripe product sync completed successfully!");
  } catch (error) {
    console.error("❌ Failed to sync Stripe products:", error);
    throw error;
  }
}

async function main() {
  console.log("🌱 Starting Stripe products sync...");

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY environment variable is not set");
    console.log("Please set up your Stripe secret key and try again.");
    return;
  }

  await syncStripeProducts();
}

main()
  .catch((e) => {
    console.error("❌ Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
