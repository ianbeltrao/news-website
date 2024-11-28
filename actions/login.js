"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { getDoc } from "@/lib/firebase/server";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function login(userId) {
  const userDoc = await getDoc("users", userId);

  if (!userDoc) {
    return null;
  }

  const cred = JSON.stringify(userDoc);

  try {
    await signIn("credentials", {
      cred,
      redirect: false,
    });

    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    } else {
      console.error("Login error:", error);
    }
  }
}