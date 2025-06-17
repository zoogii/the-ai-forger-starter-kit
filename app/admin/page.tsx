import AdminDashboard from "@/components/admin/admin-dashboard";
import { authOptions } from "@/lib/auth";
import { isUserAdmin } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const isAdmin = await isUserAdmin(session.user.id);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const [users, products, subscriptions, payments] = await Promise.all([
    prisma.user.findMany({
      include: {
        subscriptions: {
          where: { status: { in: ["active", "trialing"] } },
          include: { stripeProduct: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            subscriptions: true,
            paymentHistory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stripeProduct.findMany({
      include: {
        prices: { where: { active: true } },
        _count: {
          select: {
            users: true,
            subscriptions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.userSubscription.findMany({
      where: { status: { in: ["active", "trialing"] } },
      include: {
        user: { select: { name: true, email: true } },
        stripeProduct: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.paymentHistory.findMany({
      include: {
        user: { select: { name: true, email: true } },
        stripeProduct: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = {
    totalUsers: users.length,
    activeSubscriptions: subscriptions.length,
    totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
    totalProducts: products.length,
  };

  return (
    <AdminDashboard
      users={users}
      products={products}
      subscriptions={subscriptions}
      payments={payments}
      stats={stats}
    />
  );
}
