import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TelegramScript } from "@/components/telegram-script";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "AI Language Trainer",
  description: "Personal AI language trainer with SM-2 spaced repetition inside Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FDFBF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <TelegramScript />
      </head>
      <body className="min-h-screen bg-[#FDFBF7] text-[#4A4453] antialiased selection:bg-[#E0BBE4] selection:text-[#482C4E]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
