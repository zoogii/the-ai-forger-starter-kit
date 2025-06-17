import { UserProfile } from "@/components/dashboard/user-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getSession from "@/lib/auth";
import {
  checkUserAccess,
  getUserTokens,
  isUserAdmin,
} from "@/lib/subscription";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [{ hasAccess, subscription }, tokenInfo, isAdmin] = await Promise.all([
    checkUserAccess(session.user.id),
    getUserTokens(session.user.id),
    isUserAdmin(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user.name || session.user.email}!
              </h1>
              <p className="text-gray-600">
                Here is your personalized dashboard
              </p>
            </div>
            {isAdmin && (
              <Button asChild variant="outline">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Tokens
                  <Badge
                    variant={tokenInfo.expired ? "destructive" : "default"}
                  >
                    {tokenInfo.tokens}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {tokenInfo.expired
                    ? "Your tokens have expired"
                    : `Expires ${
                        tokenInfo.expiresAt
                          ? new Date(tokenInfo.expiresAt).toLocaleDateString()
                          : "Never"
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {tokenInfo.expired
                    ? "Renew your subscription to get more tokens"
                    : "Use tokens to access premium features"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Free Content</CardTitle>
                <CardDescription>
                  Available to all authenticated users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This is free content that all authenticated users can access.
                  No subscription required!
                </p>
                <Button asChild>
                  <Link href="/free-content">Access Free Content</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Content</CardTitle>
                <CardDescription>
                  {hasAccess
                    ? "You have access to premium content"
                    : "Requires premium membership"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasAccess ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      You have premium access! Enjoy exclusive content and
                      features.
                    </p>
                    <Button asChild>
                      <Link href="/premium-content">
                        Access Premium Content
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Upgrade to premium to access exclusive content and
                      advanced features.
                    </p>
                    <Button asChild>
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {subscription && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>Current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Status:</strong> {subscription.status}
                  </p>
                  <p>
                    <strong>Plan:</strong>{" "}
                    {subscription.stripeProduct?.name || "Premium Plan"}
                  </p>
                  <p>
                    <strong>Current Period:</strong>{" "}
                    {new Date(
                      subscription.currentPeriodStart
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-amber-600">
                      <strong>Note:</strong> Your subscription will end on{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <UserProfile user={session.user} />
        </div>
      </div>
    </div>
  );
}
