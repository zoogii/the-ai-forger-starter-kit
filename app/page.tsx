import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to VibeCoding Stack
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            This is the landing page where you can learn about our amazing
            features and premium membership benefits.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free Content</CardTitle>
              <CardDescription>
                Access basic features and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get started with our free tier and explore the basic features
                available to all users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Membership</CardTitle>
              <CardDescription>
                Unlock advanced features and exclusive content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upgrade to premium to access exclusive content, advanced
                features, and priority support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easy Authentication</CardTitle>
              <CardDescription>Sign in with Google</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Quick and secure authentication with Google OAuth for a seamless
                experience.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of users who trust our platform
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signin">Sign In Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
