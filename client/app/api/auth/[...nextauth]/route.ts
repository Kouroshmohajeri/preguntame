import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, user }) {
      // This runs on EVERY jwt creation/refresh, not just first sign-in
      if (account && user?.email) {
        // User just signed in with Google
        try {
          console.log("🔐 User signing in:", user.email);

          // Create or get user from backend
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/google`, {
            name: user.name?.split(" ")[0] || "",
            lastname: user.name?.split(" ")[1] || "",
            email: user.email,
          });

          console.log("✅ User synced to DB:", res.data.user._id);

          // Store the database ID in the token
          token.id = res.data.user._id;
          token.email = user.email;
        } catch (err) {
          console.error("❌ Failed to sync user to database:", err);
        }
      } else if (token.email && !token.id) {
        // Token exists but no ID - fetch from database
        try {
          console.log("🔍 Fetching user ID for:", token.email);

          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${token.email}`);

          token.id = res.data._id;
          console.log("✅ User ID retrieved:", token.id);
        } catch (err) {
          console.error("❌ Failed to fetch user ID:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Pass the ID from token to session
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
