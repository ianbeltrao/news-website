// auth.config.js
import { isRedirectError } from "next/dist/client/components/redirect";
import CredentialsProvider from "next-auth/providers/credentials";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials, req) {
        const user = JSON.parse(credentials.cred);

        if (user) {
          return user;
        }
        return null;
      },
    }),
  ],
};

export default authConfig;
