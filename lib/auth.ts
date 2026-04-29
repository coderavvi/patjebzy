import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated. Contact admin.");
        }

        const isValid = await user.comparePassword(credentials.password as string);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
});
