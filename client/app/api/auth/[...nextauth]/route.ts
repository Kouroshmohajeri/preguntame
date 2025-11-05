import NextAuth from "next-auth";
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
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      try {
        if (user?.email) {
          // Call your backend to create or get the user
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/google`, {
            name: user.name?.split(" ")[0] || "",
            lastname: user.name?.split(" ")[1] || "",
            email: user.email,
            
          });
        }
      } catch (err) {
        console.error("User creation failed:", err);
      }

      // Always allow login
      return true;
    },
  },
});

export { handler as GET, handler as POST };
