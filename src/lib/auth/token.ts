import { SignJWT, jwtVerify } from "jose";

export interface SupabaseJwtPayload {
  sub: string;
  role: string;
  aud: string;
  telegram_id: number;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export async function signSupabaseToken(
  payload: {
    userId: string;
    telegramId: number;
    firstName?: string;
    username?: string;
  },
  jwtSecret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(jwtSecret);

  const token = await new SignJWT({
    sub: payload.userId,
    aud: "authenticated",
    role: "authenticated",
    telegram_id: payload.telegramId,
    email: `tg_${payload.telegramId}@telegram.local`,
    app_metadata: {
      provider: "telegram",
      providers: ["telegram"],
    },
    user_metadata: {
      telegram_id: payload.telegramId,
      first_name: payload.firstName,
      username: payload.username,
    },
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);

  return token;
}

export async function verifySupabaseToken(
  token: string,
  jwtSecret: string
): Promise<SupabaseJwtPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SupabaseJwtPayload;
  } catch {
    return null;
  }
}
