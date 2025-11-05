export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/create/:path*",   // protect create page
    "/dashboard/:path*", // protect dashboard 
  ],
};
