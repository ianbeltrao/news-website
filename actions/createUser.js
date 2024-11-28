"use server";

import { db } from "@/lib/firebase/adminConfig";
import { getDoc } from "@/lib/firebase/server";

export async function createUser(uid, email) {
  try {

    const userDoc = await getDoc("users", uid);

    if (userDoc) {
      return userDoc;
    }

    const userData = {
      email: email,
      role: "user",
      id: uid,
      signUpDate: new Date().toISOString(),
    };

    await db.collection("users").doc(uid).set(userData);
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
