"use server"; // not needed but for display

import { admin, auth, db } from "./adminConfig";

// Create a document
export async function createDoc(collection, docData, docId = null) {
  try {
    const docRef = docId 
      ? db.collection(collection).doc(docId)
      : db.collection(collection).doc();
    await docRef.set(docData);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

// Update a document
export async function updateDoc(collection, docId, updateData) {
  try {
    const docRef = db.collection(collection).doc(docId);
    await docRef.update(updateData);
    return { id: docId, ...updateData };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

// Get a document
export async function getDoc(collection, docId) {
  try {
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

// Delete a document
export async function deleteDoc(collection, docId) {
  try {
    await db.collection(collection).doc(docId).delete();
    return { id: docId, deleted: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Get user settings
export async function getUserSettings(userId) {
  try {
    const doc = await getDoc('userSettings', userId);
    return doc ? serializeData(doc) : null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
}

// Create/Update user settings
export async function updateUserSettings(userId, settings) {
  try {
    return await updateDoc('userSettings', userId, settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
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

export async function getDashboardData(userId) {
  try {
    // Get user settings and saved articles in parallel
    const [settings, savedArticles] = await Promise.all([
      getUserSettings(userId),
      getSavedArticles(userId)
    ]);

    return {
      settings,
      savedArticles,
    };
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    throw error;
  }
}

// Helper function to serialize Firestore data (next gives error if not serialized and passed to client)
function serializeData(data) {
  if (!data) return null;
  
  const serialized = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Convert Firestore Timestamp to ISO string
    if (value && typeof value === 'object' && value.toDate instanceof Function) {
      serialized[key] = value.toDate().toISOString();
    }
    // All other values pass through unchanged
    else {
      serialized[key] = value;
    }
  });
  
  return serialized;
}

export async function getSavedArticles(userId) {
  try {
    const articlesSnapshot = await db
      .collection('savedArticles')
      .where('userId', '==', userId)
      .orderBy('savedAt', 'desc')
      .get();

    return articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));
  } catch (error) {
    console.error("Error getting saved articles:", error);
    throw error;
  }
}

export async function getUserCollections(userId) {
  try {
    const collectionsSnapshot = await db.collection('articleCollections').where('userId', '==', userId).get();
    return collectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user collections:", error);
    throw error;
  }
}

export async function getSavedArticlesData(userId) {
  try {
    const [savedArticles, collections, settings] = await Promise.all([
      getSavedArticles(userId),
      getUserCollections(userId),
      getUserSettings(userId)
    ]);

    // Add collection names to articles and serialize
    const articlesWithCollections = savedArticles.map(article => ({
      ...article,
      collectionName: collections.find(c => c.id === article.collectionId)?.name
    }));

    return {
      savedArticles: articlesWithCollections.map(article => serializeData(article)),
      collections: collections.map(collection => serializeData(collection)),
      settings: serializeData(settings)
    };
  } catch (error) {
    console.error("Error getting saved articles data:", error);
    throw error;
  }
}