import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TelegramScript } from "@/components/telegram-script";
import { AuthProvider } from "@/context/auth-context";
import { I18nProvider } from "@/context/i18n-context";

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
  themeColor: "#F4EFFE",
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
      <body className="min-h-screen bg-[#F4EFFE] text-[#2A2352] antialiased selection:bg-[#B7A0F6] selection:text-[#2A2352]">
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
