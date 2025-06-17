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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Premium Access Required</CardTitle>
                <CardDescription>
                  You need an active subscription to access this content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This content is exclusively available to premium members.
                  Upgrade your account to unlock advanced features and exclusive
                  content.
                </p>
                <div className="space-x-4">
                  <Button asChild>
                    <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="outline" className="mb-4">
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Premium Content
            </h1>
            <p className="text-gray-600">
              Exclusive content for premium subscribers
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="border-gold">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Welcome to Premium Content!
                </CardTitle>
                <CardDescription>
                  Exclusive content for premium subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Congratulations! You have premium access and can enjoy all our
                  advanced features and exclusive content.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Premium Benefits:
                  </h3>
                  <ul className="text-purple-800 space-y-1">
                    <li>• Access to advanced tutorials and masterclasses</li>
                    <li>• Priority customer support</li>
                    <li>• Exclusive tools and features</li>
                    <li>• Early access to new content</li>
                    <li>• Premium community access</li>
                    <li>• Download resources and templates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Tutorial Series</CardTitle>
                <CardDescription>
                  In-depth guides available only to premium members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Mastering Advanced Techniques</h3>
                  <p>
                    This comprehensive tutorial covers advanced topics that are
                    only available to our premium subscribers. You'll learn
                    cutting-edge techniques and best practices.
                  </p>
                  <h4>Module 1: Advanced Concepts</h4>
                  <p>
                    Deep dive into complex scenarios and learn how to handle
                    them effectively.
                  </p>
                  <h4>Module 2: Performance Optimization</h4>
                  <p>
                    Learn advanced optimization techniques to maximize
                    performance.
                  </p>
                  <h4>Module 3: Expert Strategies</h4>
                  <p>
                    Discover strategies used by industry experts and apply them
                    to your work.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exclusive Resources</CardTitle>
                <CardDescription>
                  Premium-only downloads and tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Premium Templates</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Professional templates and starter kits
                    </p>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Advanced Tools</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Exclusive tools for premium subscribers
                    </p>
                    <Button size="sm" variant="outline">
                      Access Tools
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Premium Status</CardTitle>
                  <CardDescription>Subscription information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800">
                      <strong>Status:</strong> {subscription.status} <br />
                      <strong>Plan:</strong> {subscription.stripeProduct.name}{" "}
                      <br />
                      <strong>Next billing:</strong>{" "}
                      {new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
