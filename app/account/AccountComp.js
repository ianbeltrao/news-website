"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signOutFirebase } from "@/lib/firebase/client";

export default function AccountComp({ user }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const router = useRouter();

  // Handle user logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutFirebase(); // Sign out from Firebase
      await signOut({ redirect: false }); // Sign out from NextAuth
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Format signup date to DD/MM/YYYY
  const formatSignupDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format price to display in dollars
  const formatPrice = (amount) =>
    amount ? `$${(amount / 100).toFixed(2)}` : "";

  // Handle opening Stripe Customer Portal
  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const portalUrl = await generateCustomerPortalSession({
        customerId: user.stripe_customer,
        returnUrl: window.location.href,
      });
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        console.error("Failed to generate Customer Portal URL");
      }
    } catch (error) {
      console.error("Error opening Customer Portal:", error);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="flex flex-col max-w-full">
      <header className="flex items-center justify-between p-4 md:p-6">
        <h1 className="text-lg font-semibold">Account Settings</h1>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-x-hidden max-w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Manage your account information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 max-w-2xl">
            {/* User Information */}
            <div className="grid grid-cols-3 gap-6">
              <InfoItem label="Name" value={user?.stripe_customer_name} />
              <InfoItem label="Email" value={user?.email} />
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-3 gap-4">
              <InfoItem
                label="Signed up"
                value={formatSignupDate(user?.signUpDate)}
              />
              <InfoItem label="Plan" value={user?.plan} />
              <InfoItem
                label="Price"
                value={formatPrice(user?.stripe_amount_paid)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
            <Button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="flex-1"
              >
                {isLoadingPortal ? "Loading..." : "Manage Subscription"}
              </Button>
              <ActionButton href="mailto:mail@saaspronto.com" variant="outline">
                Contact Support
              </ActionButton>
              <ActionButton href="/forgot-password" variant="outline">
                Reset Password
              </ActionButton>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1"
              >
                {isLoggingOut ? "Logging out..." : "Logout Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Reusable component for displaying info items
const InfoItem = ({ label, value }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="text-sm text-gray-600">{value || "Not provided"}</div>
  </div>
);

// Reusable component for action buttons
const ActionButton = ({ href, variant, external, children }) => (
  <Link
    href={href}
    target={external ? "_blank" : "_self"}
    rel={external ? "noopener noreferrer" : ""}
    className="flex-1"
  >
    <Button variant={variant} className="w-full">
      {children}
    </Button>
  </Link>
);
