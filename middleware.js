import authConfig from "@/auth.config";

import {
  protectedRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from "@/routes";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute =
    nextUrl.pathname && nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPrivateRoute = protectedRoutes.some(
    (route) => nextUrl.pathname && nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(
    (route) => nextUrl.pathname && nextUrl.pathname.startsWith(route)
  );

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Preserve query parameters when redirecting
      const redirectUrl = new URL(DEFAULT_LOGIN_REDIRECT, nextUrl);
      redirectUrl.search = nextUrl.search;
      return Response.redirect(redirectUrl);
    }
    return null;
  }

  if (isPrivateRoute) {
    if (!isLoggedIn) {
      // Preserve query parameters when redirecting
      const redirectUrl = new URL("/login", nextUrl);
      redirectUrl.search = nextUrl.search;
      return Response.redirect(redirectUrl);
    }
    return null;
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
