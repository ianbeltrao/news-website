"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { checkOnboardingStatus, getDashboardData } from "@/lib/firebase/server";
import OnboardingForm from "@/components/onboardingForm";
import DashboardContent from "@/components/DashboardContent";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { completed, settings } = await checkOnboardingStatus(session.user.id);

  if (!completed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-2xl font-bold text-center">
            Welcome! Lets get you set up
          </h1>
          <OnboardingForm userId={session.user.id} />
        </div>
      </main>
    );
  }

  // Fetch initial dashboard data
  const dashboardData = await getDashboardData(session.user.id);

  console.log(dashboardData);

  return (
    <main className="container mx-auto p-4">
      <DashboardContent 
        userId={session.user.id}
        initialSettings={dashboardData.settings}
        initialSavedArticles={dashboardData.savedArticles}
      />
    </main>
  );
}
