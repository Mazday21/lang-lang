/**
 * Telegram Stars price of the Pro subscription (whole Stars).
 *
 * Override with the NEXT_PUBLIC_STARS_PRICE env var — e.g. set it to 1 in
 * Vercel for a cheap end-to-end payment test, then back to 150 for production.
 * Used by both the checkout API (invoice amount) and the UI labels.
 */
export const STARS_PRICE = Number(process.env.NEXT_PUBLIC_STARS_PRICE) || 150;
