"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage(app);

export async function createDocument(collectionName, documentData) {
  const docRef = documentData.id
    ? doc(db, collectionName, documentData.id)
    : doc(collection(db, collectionName));
  await setDoc(docRef, documentData);
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
}

export async function getDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function updateDocument(collectionName, documentId, documentData) {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, documentData);
    return true; // Indicate success
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    return false; // Indicate failure
  }
}

export async function deleteDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

export async function signOutFirebase() {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
    return false;
  }
}

// User Settings
export async function getUserSettings(userId) {
  const docRef = doc(db, "userSettings", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}

export async function updateUserSettings(userId, settings) {
  const docRef = doc(db, "userSettings", userId);
  await setDoc(docRef, settings);
}

// Onboarding
export async function saveOnboardingData(userId, data) {
  try {
    await updateUserSettings(userId, {
      newsApiKey: data.apiKey,
      favoriteTopics: data.topics,
      onboardingCompleted: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return { success: false, error: error.message };
  }
}

export async function checkOnboardingStatus(userId) {
  try {
    const settings = await getUserSettings(userId);
    return {
      completed: settings?.onboardingCompleted || false,
      settings,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return { completed: false, error: error.message };
  }
}

// Collections
export const COLLECTIONS = {
  USER_SETTINGS: 'userSettings',
  ARTICLE_COLLECTIONS: 'articleCollections',
  SAVED_ARTICLES: 'savedArticles',
};

// Collection functions
export async function getUserCollections(userId) {
  if (!userId) {
    console.error('getUserCollections called without userId');
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.ARTICLE_COLLECTIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting collections:", error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function createCollection(userId, name) {
  try {
    const collectionData = {
      userId,
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const doc = await createDocument(COLLECTIONS.ARTICLE_COLLECTIONS, collectionData);
    return doc;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

export async function saveArticleToCollection(userId, collectionId, article) {
  try {
    const articleData = {
      userId,
      collectionId,
      title: article.title || "",
      description: article.description || "",
      url: article.url || "",
      urlToImage: article.urlToImage || "",
      source: article.source || { name: "Unknown" },
      publishedAt: article.publishedAt || "",
      topics: article.topics || [],
      savedAt: serverTimestamp(),
    };

    const doc = await createDocument(COLLECTIONS.SAVED_ARTICLES, articleData);
    
    if (collectionId) {
      await updateDocument(COLLECTIONS.ARTICLE_COLLECTIONS, collectionId, {
        updatedAt: serverTimestamp()
      });
    }

    return { success: true, articleId: doc.id };
  } catch (error) {
    console.error("Error saving article:", error);
    return { success: false, error: error.message };
  }
}

export async function getSavedArticles(userId, collectionId = null) {
  try {
    let q;
    if (collectionId) {
      q = query(
        collection(db, COLLECTIONS.SAVED_ARTICLES),
        where("userId", "==", userId),
        where("collectionId", "==", collectionId),
        orderBy("savedAt", "desc")
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.SAVED_ARTICLES),
        where("userId", "==", userId),
        orderBy("savedAt", "desc")
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting saved articles:", error);
    throw error;
  }
}

export async function removeArticle(articleId) {
  try {
    await deleteDocument(COLLECTIONS.SAVED_ARTICLES, articleId);
    return { success: true };
  } catch (error) {
    console.error("Error removing article:", error);
    throw error;
  }
}

export async function updateArticleCollection(articleId, collectionId = null) {
  try {
    // Update the article document in Firestore
    const docRef = doc(db, COLLECTIONS.SAVED_ARTICLES, articleId);
    await updateDoc(docRef, {
      collectionId, // This can be null to remove from collection
      updatedAt: serverTimestamp()
    });

    // If we're detaching from a collection, we don't need to update collection timestamp
    if (collectionId) {
      await updateDocument(COLLECTIONS.ARTICLE_COLLECTIONS, collectionId, {
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating article collection:", error);
    return { success: false, error: error.message };
  }
}

