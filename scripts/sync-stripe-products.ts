// Load environment variables first
require("dotenv").config();

import Stripe from "stripe";
import { PrismaClient } from "../app/generated/prisma";

// Initialize Stripe with the loaded environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  appInfo: {
    name: "VibeCoding Stack",
    version: "0.1.0",
  },
});

const prisma = new PrismaClient();

// Inline the upsert functions to avoid import issues
const upsertProductRecord = async (product: Stripe.Product) => {
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

const upsertPriceRecord = async (
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
    trialPeriodDays: price.recurring?.trial_period_days || 0,
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

async function syncStripeProducts() {
  console.log("🔄 Starting Stripe products sync...");

  try {
    // Fetch all products from Stripe
    console.log("📦 Fetching products from Stripe...");
    const products = await stripe.products.list({
      limit: 100,
      active: true, // Only sync active products
    });

    console.log(`Found ${products.data.length} active products in Stripe`);

    // Sync each product
    for (const product of products.data) {
      console.log(`Syncing product: ${product.name} (${product.id})`);
      await upsertProductRecord(product);
    }

    // Fetch all prices from Stripe
    console.log("💰 Fetching prices from Stripe...");
    const prices = await stripe.prices.list({
      limit: 100,
      active: true, // Only sync active prices
    });

    console.log(`Found ${prices.data.length} active prices in Stripe`);

    // Sync each price
    for (const price of prices.data) {
      const productId =
        typeof price.product === "string" ? price.product : price.product.id;
      console.log(`Syncing price: ${price.id} for product ${productId}`);
      await upsertPriceRecord(price);
    }

    console.log("✅ Stripe products sync completed successfully!");

    // Display summary
    console.log("\n📊 Sync Summary:");
    console.log(`- Products synced: ${products.data.length}`);
    console.log(`- Prices synced: ${prices.data.length}`);
  } catch (error) {
    console.error("❌ Error syncing Stripe products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync if this file is executed directly
if (require.main === module) {
  syncStripeProducts()
    .then(() => {
      console.log("🎉 Sync completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Sync failed:", error);
      process.exit(1);
    });
}

export { syncStripeProducts };
