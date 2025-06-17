"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, CreditCard, Headphones, Settings, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ManageSubscriptionProps {
  activeSubscription: {
    status: string;
    stripeProduct?: {
      name?: string | null;
      description?: string | null;
    };
    stripePrice?: {
      unitAmount?: number | null;
      interval?: string | null;
    };
  };
}

export default function ManageSubscription({
  activeSubscription,
}: ManageSubscriptionProps) {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      toast.error("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
            <CreditCard className="h-10 w-10 text-green-500" />
            Manage Your Subscription
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You're currently subscribed to our premium service. Manage your
            subscription, update billing details, or explore additional
            features.
          </p>
        </div>

        {/* Current Subscription Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Active Subscription
                </span>
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {activeSubscription.stripeProduct?.name || "Premium Plan"}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {activeSubscription.stripeProduct?.description ||
                  "You're enjoying premium features"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="capitalize">{activeSubscription.status}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Price</p>
                  <p>
                    ${(activeSubscription.stripePrice?.unitAmount || 0) / 100}
                    {activeSubscription.stripePrice?.interval &&
                      `/${activeSubscription.stripePrice.interval}`}
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
              >
                <Settings className="mr-2 h-5 w-5" />
                {isPortalLoading ? "Loading..." : "Manage Subscription"}
              </Button>

              <p className="text-sm text-gray-500">
                Access your billing portal to update payment methods, view
                invoices, change plans, or cancel your subscription.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features you're enjoying */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Features You're Enjoying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <Check className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Premium Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Advanced tutorials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Premium templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Exclusive tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Early access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Live chat access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Video consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="text-center">
                <Headphones className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Full Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>All premium content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Community access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Mobile app access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick links */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Link href="/premium-content">
              <Button variant="outline">Access Premium Content</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
