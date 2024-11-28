"use server";

import { getUserSettings } from "@/lib/firebase/server";

export async function searchNews(userId, query) {
  try {
    // Get the API key from user settings
    const settings = await getUserSettings(userId);
    
    if (!settings?.newsApiKey) {
      throw new Error("News API key not found");
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${settings.newsApiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    const data = await response.json();
    
    if (data.status === "ok") {
      return { success: true, articles: data.articles };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return { success: false, error: error.message };
  }
}