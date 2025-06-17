import { Navbar } from "@/components/navbar";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import getSession from "@/lib/auth";
import {
  checkUserAccess,
  getUserTokens,
  isUserAdmin,
} from "@/lib/subscription";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCoding Stack",
  description: "Next.js starter with NextAuth and Stripe",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Get user data for navbar if authenticated
  let navbarData = {};
  if (session?.user) {
    const [{ hasAccess, subscription }, tokenInfo, adminStatus] =
      await Promise.all([
        checkUserAccess(session.user.id),
        getUserTokens(session.user.id),
        isUserAdmin(session.user.id),
      ]);

    navbarData = {
      user: session.user,
      hasAccess,
      tokenInfo,
      isAdmin: adminStatus,
      hasSubscription: !!subscription,
    };
  }

  return (
    <html lang="en">
      <head>
        <script src="https://js.stripe.com/v3/" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <Navbar {...navbarData} />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
