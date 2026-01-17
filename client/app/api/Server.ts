// import axios from "axios";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"; // your backend URL

// export const API = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Optional: attach interceptors (for auth tokens later)
// API.interceptors.request.use(
//   (config) => {
//     // If you want to include tokens in the future:
//     // const token = localStorage.getItem("token");
//     // if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// api/Server.ts
import axios from "axios";
import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add JWT token from NextAuth session to every request
API.interceptors.request.use(
  async (config) => {
    // Get session from NextAuth
    const session = await getSession();

    // If session has backend JWT token, add it to Authorization header
    if (session?.user?.backendToken) {
      config.headers.Authorization = `Bearer ${session.user.backendToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
