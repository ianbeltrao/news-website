"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSavedArticlesData } from "@/lib/firebase/server";
import SavedArticlesContent from "@/components/SavedArticlesContent";

export default async function SavedArticles() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch initial data (saved articles, collections, settings)
  const data = await getSavedArticlesData(session.user.id);

  return (
    <main className="container mx-auto p-4">
      <SavedArticlesContent 
        userId={session.user.id}
        initialData={data}
      />
    </main>
  );
} 