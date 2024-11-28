import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const serviceAccount = {
  "type": "service_account",
  "project_id": "news-project-487ca",
  "private_key_id": "a03a80eaa9153b16d9e5f2848d47327afc6e099e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyN9ydYTI917GG\nxNYwFVRrvFCnguBccutF8MVbqMsxHGZHaTYWxr8XcxSDY0oMlqCIzbFEY5yQs/PN\nxHWO6sUofw37vSA217qxVmnzMuv88ZZIVdfS4B7kswMHV9/M1xN7KM21rsVYt/zF\nh2l4LKQHl+btB9wwsUrNwgKWFpM0jsCSDjgu0Xnw1z/vbAWc5AsVLwbSWzItHJIt\ndfGboOCIVulKronQl/JEU2OVOHqJmDP7BHj2XopTdVdjpnMk6pzkbdauyB8VhWUU\n6i5OEgUyhdloxFx97uJKBv+qKcT0Y16oFfUFEEsWV2SR8OK6hv6slE+G19E7Wcdy\nl1Zl5tcJAgMBAAECggEALF/YYJ9Y4SkZnNLZ+fL1qDWlZ3Ag6SP8DNgca+wlW78U\ngGdj/lvSLMaMrwJD58qBgk6k+sBKtYT5CZ0HIGS4XpL0KmA26zDf3VQE4XcmZz7I\nCo7FRE5lotAnyuZIZTqQMTRBtCEmJib5mz1SN4f196YM66vvWXhrhbvu5OwODyGo\n7yijYwp2xZmTE0yXLxfhBbMX7hB9XEihT7T93GfKy5oRu/+DhRLoZmAv3oO0ri3I\n68y5uxuQbKMmNT0D0j2joJEJSUwk214BTHwVLI9d7m6rPzANYaqQCfcWreHUsF//\nUxFY373YDWciUN00evb1elAHWJ9aZ0wKh7jaN1hKYQKBgQDzVtwCJaCnmaxXPJ3q\nzAII/RrFdG/UMaK72Ec5FW5paCwEj64q281thIzS7twEI7VEpYbR/CThgz1hechl\nCgrCQ5/0CnFjCK4DtFaoeBAx/DKJPwIkGTsMrMKmDtoK2rOvHVBXfWRwjj500eDA\nK94GplFc/JsWrAcdnRMdeNHLhQKBgQC7faBtg6+9+elaZI6/jAa/hRw7Esw4KWE2\njxEzz7+z+VdlR0wO7+vJKTDtWyicJUZxjXDDkF9RhWSAdzLpX/lFXg5lwjfTjwoz\nHupIrFy2+gK2U7BDmWJizMDPYOFuEnV8uhu+lWckf2M1d/ez+/PrjE8of0agqgRp\n1HWaGH/KtQKBgQDvpghwuNv6k5auJ42isp4CejqGYgDMasHI29xw9JFTj/th1psB\nrI0pIZSLHCBkl0IrRBV98iPkUJr/x687CuPDpFQARNScYuz1ywJZUj0o7SZcEkiq\ngoqsFexxHElSzUaO3IDGWUC0tPH/nL8Ko2k7BUs2F7UpY+xyFsK/kMCU/QKBgQCu\nthwesQ29C/qFfxr+J2/KXDG4YoXm97hc7OhszXSoMvtbpxqa+LtREo9DPyUSjDGe\nctzXf9syzgifJXRNwF86YrEr5dW70JkClhZfbi5fW43XdRjVhUMHKiGpnW+z8IOG\nnK5p5DLe8c3y7z3lfC0KHA9Pf3rDEGtYauDDnXzH2QKBgHOGGEeTgkqn1O3isvPq\ndhYGMXkDLIWv/eFD63cc6aqIfL/CywkXJPOKncY+2xAZ/UEbaCd7FAoCXtseKliA\ngYCUhcjfBclodaHlUh0LD05eCuZR14ECR4TyXNODd92RKgB/ChoWqgugMkMTyMUL\nZ6kJ/APBXoIqjo52cpqUnxtF\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-o7u5q@news-project-487ca.iam.gserviceaccount.com",
  "client_id": "105287409132614764203",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-o7u5q%40news-project-487ca.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { auth, db, admin };