import crypto from "crypto";

export interface ParsedTelegramData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  query_id?: string;
  hash: string;
}

/**
 * Validates Telegram WebApp initData string using Bot Token HMAC-SHA-256.
 * According to official Telegram documentation:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): { isValid: boolean; data?: ParsedTelegramData; error?: string } {
  if (!initData) {
    return { isValid: false, error: "InitData is empty" };
  }

  if (!botToken) {
    return { isValid: false, error: "Telegram bot token is not configured" };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");

    if (!hash) {
      return { isValid: false, error: "Missing hash in initData" };
    }

    urlParams.delete("hash");

    // Sort params alphabetically and format as key=<value> separated by \n
    const sortedKeys = Array.from(urlParams.keys()).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${urlParams.get(key)}`)
      .join("\n");

    // secret_key = HMAC_SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // calculated_hash = HMAC_SHA256(dataCheckString, secretKey)
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return { isValid: false, error: "Invalid hash signature" };
    }

    // Check expiration (24 hours tolerance)
    const authDateStr = urlParams.get("auth_date");
    const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
    const currentTime = Math.floor(Date.now() / 1000);

    if (authDate > 0 && currentTime - authDate > 86400 * 3) {
      return { isValid: false, error: "InitData has expired" };
    }

    const userRaw = urlParams.get("user");
    if (!userRaw) {
      return { isValid: false, error: "User payload not found in initData" };
    }

    const user = JSON.parse(userRaw);

    return {
      isValid: true,
      data: {
        user,
        auth_date: authDate,
        query_id: urlParams.get("query_id") || undefined,
        hash,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { isValid: false, error: `Validation exception: ${message}` };
  }
}
