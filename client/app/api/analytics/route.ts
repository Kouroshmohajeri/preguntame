import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";

// Admin 2FA secret
const ADMIN_2FA_SECRET = process.env.ADMIN_2FA_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: ADMIN_2FA_SECRET,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps before/after
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get MongoDB stats
    const mongoStats = await getMongoDBStats();

    return NextResponse.json(mongoStats);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

// Function to fetch MongoDB stats from your server
async function getMongoDBStats() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  try {
    const response = await fetch(`${serverUrl}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    return await response.json();
  } catch (error) {
    console.error("MongoDB stats error:", error);
    throw error;
  }
}
