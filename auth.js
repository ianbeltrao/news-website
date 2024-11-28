import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { getDoc } from "@/lib/firebase/server";

export const { auth, handlers, signIn, signOut, reset } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        //console.log("user", user);
        token.id = user.id;
        token.proMember = user.proMember || false;
        token.isAdmin = user.isAdmin || false;
      }

      // Update user data on each JWT refresh
      //console.log("token", token);
      const userData = await getDoc("users", token.id);

      //console.log("userData", userData);

      if (userData) {
        token.proMember = userData.proMember || false;
        token.isAdmin = userData.isAdmin || false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.proMember = token.proMember;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  session: { strategy: "jwt", updateAge: 60 * 60 * 24 },
  ...authConfig,
});
