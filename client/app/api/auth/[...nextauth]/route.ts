// import NextAuth from "next-auth/next";
// import GoogleProvider from "next-auth/providers/google";
// import axios from "axios";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],

//   pages: {
//     signIn: "/login",
//   },

//   secret: process.env.NEXTAUTH_SECRET,

//   callbacks: {
//     async signIn({ user }: { user: any }) {
//       try {
//         if (user?.email) {
//           await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/google`, {
//             name: user.name?.split(" ")[0] || "",
//             lastname: user.name?.split(" ")[1] || "",
//             email: user.email,
//           });
//         }
//       } catch (err) {
//         console.error("User creation failed:", err);
//       }

//       return true;
//     },

//     async jwt({ token, user }: { token: any; user?: any }) {
//       if (user?.email) {
//         try {
//           const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.email}`);

//           const dbUser = res.data;
//           token.id = dbUser._id;
//         } catch (err) {
//           console.error("Failed to fetch user ID:", err);
//         }
//       }

//       return token;
//     },

//     async session({ session, token }: { session: any; token: any }) {
//       if (token?.id) {
//         session.user.id = token.id;
//       }

//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };
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
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, user }) {
      // Runs ONLY when user signs in the first time
      if (account && user) {
        try {
          // Create user (or update) in your backend
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/google`, {
            name: user.name?.split(" ")[0] || "",
            lastname: user.name?.split(" ")[1] || "",
            email: user.email,
          });

          // Save ID in token
          token.id = res.data._id;
        } catch (err) {
          console.error("Failed to sync user:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
