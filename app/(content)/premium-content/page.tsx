import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getSession from "@/lib/auth";
import { checkUserAccess } from "@/lib/subscription";
import { Crown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PremiumContentPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { hasAccess, subscription } = await checkUserAccess(session.user.id);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center border-yellow-200">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Premium Access Required</CardTitle>
              <CardDescription>
                You need an active subscription to access this content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                This content is exclusively available to premium members.
                Upgrade your account to unlock advanced features and exclusive
                content.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/pricing">Upgrade to Premium</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Premium Content
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              This page can only be seen by paid users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
