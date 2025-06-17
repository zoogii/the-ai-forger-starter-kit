import { PricingCard } from "@/components/pricing/pricing-card";
import { Button } from "@/components/ui/button";
import { getMembershipTiers } from "@/lib/subscription";
import Link from "next/link";

export default async function PricingPage() {
  const membershipTiers = await getMembershipTiers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {membershipTiers.map((tier: any) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              stripeProducts={tier.stripeProducts}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact us for enterprise pricing and custom features tailored to
              your organization.
            </p>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="ghost">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
