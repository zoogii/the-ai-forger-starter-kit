import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getSession from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FreeContentPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
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
              Free Content
            </h1>
            <p className="text-gray-600">
              Content available to all authenticated users
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Free Content!</CardTitle>
                <CardDescription>
                  This section is available to all authenticated users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Here you can access our basic features and content. This
                  demonstrates that you are successfully authenticated and can
                  access user-only content.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    What you can do here:
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Access basic tutorials and guides</li>
                    <li>• View community content</li>
                    <li>• Use basic tools and features</li>
                    <li>• Participate in discussions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ready for More?</CardTitle>
                <CardDescription>
                  Upgrade to premium for exclusive content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Want access to advanced features, exclusive content, and
                  priority support? Consider upgrading to our premium
                  membership.
                </p>
                <Button asChild>
                  <Link href="/pricing">View Premium Plans</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Content</CardTitle>
                <CardDescription>
                  Example of free content structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Getting Started Guide</h3>
                  <p>
                    This is an example of the type of content available in the
                    free tier. You have full access to this information as an
                    authenticated user.
                  </p>
                  <h4>Step 1: Set up your profile</h4>
                  <p>
                    Complete your profile information to get the most out of the
                    platform.
                  </p>
                  <h4>Step 2: Explore available features</h4>
                  <p>
                    Browse through the free features and familiarize yourself
                    with the interface.
                  </p>
                  <h4>Step 3: Consider upgrading</h4>
                  <p>
                    When you're ready for more advanced features, check out our
                    premium plans.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
