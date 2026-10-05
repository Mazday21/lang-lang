import { NextRequest } from "next/server";
import { verifySupabaseToken } from "@/lib/auth/token";

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    // In dev mode, if no auth header, allow default mock user
    if (process.env.NODE_ENV === "development") {
      return "00000000-0000-0000-0000-000000000001";
    }
    return null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  // Mock dev token
  if (token === "mock-dev-token" || token === "unconfigured-supabase-token") {
    return "00000000-0000-0000-0000-000000000001";
  }

  // Verify JWT if SUPABASE_JWT_SECRET is set
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (jwtSecret) {
    const payload = await verifySupabaseToken(token, jwtSecret);
    return payload?.sub || null;
  }

  // Fallback in dev
  if (process.env.NODE_ENV === "development") {
    return "00000000-0000-0000-0000-000000000001";
  }

  return null;
}
