import { SignInForm } from "@/components/auth/signin-form";
import getSession from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your dashboard and premium content
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
