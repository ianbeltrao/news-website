"use server";

import { auth } from "@/auth";
import AccountComp from "./AccountComp";
import { getDoc } from "@/lib/firebase/server";

export default async function AccountPage() {
  // Fetch authentication data
  const { user } = (await auth()) || {};

  let userDoc = {};

  if (user) {
    userDoc = await getDoc("users", user.id);
  }

  // Render the AccountComp with user data
  return <AccountComp user={user} />;
}
