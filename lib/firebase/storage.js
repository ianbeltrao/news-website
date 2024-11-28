"use server";

import { admin } from "./adminConfig";
import { getStorage } from "firebase-admin/storage";

const bucket = getStorage().bucket(/* IF USING STORAGE SET BUCKET NAME HERE */);

export async function uploadFile(fileOrPath, destination) {
  try {
    let file;
    if (typeof fileOrPath === 'string') {
      if (fileOrPath.startsWith('data:')) {
        // It's a Base64 string
        const base64Data = fileOrPath.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        file = bucket.file(destination);
        await file.save(buffer, { contentType: 'image/png' });
      } else if (fileOrPath.startsWith('http://') || fileOrPath.startsWith('https://')) {
        // It's a URL, fetch the file
        const response = await fetch(fileOrPath);
        if (!response.ok) {
          throw new Error('Failed to fetch the file from the URL');
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        file = bucket.file(destination);
        await file.save(buffer);
      } else {
        // It's a file path
        [file] = await bucket.upload(fileOrPath, {
          destination: destination,
        });
      }
    } else {
      // It's a Blob
      file = bucket.file(destination);
      await file.save(fileOrPath);
    }

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: '3000-12-31', // URL expires on December 31, 3000 (effectively never expires)
    });

    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}