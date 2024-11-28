"use server";

import { auth } from "@/auth";
import AccountComp from "./AccountComp";
import { getUserSettings } from "@/lib/firebase/server";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settings = await getUserSettings(session.user.id);

  const userData = {
    ...session.user,
    settings
  };

  return <AccountComp user={userData} />;
}
