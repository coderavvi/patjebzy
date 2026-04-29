import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isOnLogin = pathname === "/login";
      const isOnAdmin = pathname.startsWith("/admin");
      const isOnDashboard = pathname.startsWith("/dashboard");

      if (isOnLogin) {
        if (isLoggedIn) {
          const url = auth.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
          return Response.redirect(new URL(url, request.nextUrl));
        }
        return true;
      }

      if (isOnAdmin || isOnDashboard) {
        if (!isLoggedIn) return false; // redirect to login
        if (isOnAdmin && auth.user.role !== "admin") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (pathname === "/") {
        if (isLoggedIn) {
          const url = auth.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
          return Response.redirect(new URL(url, request.nextUrl));
        }
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "sales_rep";
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
};
