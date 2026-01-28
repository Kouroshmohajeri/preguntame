import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========== WIZARD BASE ROUTE (PUBLIC) ==========
  // Allow access to /create/wizard (without any suffix)
  if (pathname === "/create/wizard") {
    console.log("✅ Middleware: Allowing access to /create/wizard (public page)");
    return NextResponse.next();
  }

  // ========== WIZARD LICENSE VALIDATION ==========
  // Block access to /create/wizard/* (any path with suffix)
  if (pathname.startsWith("/create/wizard/")) {
    const licenseKey = pathname.split("/create/wizard/")[1];

    console.log("🔒 Middleware: Validating license:", licenseKey);

    // 1. Check if user is logged in
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.email) {
      console.log("❌ Middleware: No token or email");
      return NextResponse.redirect(new URL("/auth?error=unauthorized", request.url));
    }

    console.log("✅ Middleware: User authenticated:", token.email);

    // 2. Validate license against backend
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const validationUrl = `${apiBaseUrl}/beta-access/validate-license/${licenseKey}`;

      console.log("📡 Middleware: Calling validation API:", validationUrl);

      const response = await fetch(validationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: token.email,
        }),
      });

      const data = await response.json();

      console.log("📥 Middleware: API response:", {
        ok: response.ok,
        status: response.status,
        data: data,
      });

      if (!response.ok || !data.success) {
        console.log("❌ Middleware: Validation failed, redirecting to dashboard");
        const errorUrl = new URL("/dashboard", request.url);
        errorUrl.searchParams.set("error", data.error || "invalid_license");
        errorUrl.hash = "ai-access";
        return NextResponse.redirect(errorUrl);
      }

      console.log("✅ Middleware: License valid, allowing access");
      return NextResponse.next();
    } catch (error) {
      console.error("❌ Middleware: License validation error:", error);
      const errorUrl = new URL("/dashboard", request.url);
      errorUrl.searchParams.set("error", "validation_failed");
      errorUrl.hash = "ai-access";
      return NextResponse.redirect(errorUrl);
    }
  }

  // ========== REGULAR ROUTE PROTECTION ==========
  // Protect /create routes (but not /create/wizard or /create/wizard/*)
  if (pathname.startsWith("/create") && !pathname.startsWith("/create/wizard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create/:path*", "/dashboard/:path*"],
};
