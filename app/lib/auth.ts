import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "./mongodb";
import { User, Tenant } from "./types";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const db = await getDb();
      const existingUser = await db
        .collection("users")
        .findOne({ email: user.email });

      if (!existingUser) {
        // We will handle profile completion in a separate onboarding page
        // For now, just allow sign in
        return true;
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const db = await getDb();
        const user = await db
          .collection("users")
          .findOne({ email: token.email });

        if (user) {
          (session.user as any).role = user.role;
          (session.user as any).orgName = user.orgName;
          (session.user as any).tenantId = user.tenantId;
          (session.user as any).onboarded = !!user.tenantId;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};
