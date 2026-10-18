"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, User, Check, Globe } from "lucide-react";
import { useI18n } from "@/context/i18n-context";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();

  // Native Telegram Back Button integration
  useEffect(() => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    if (tg?.BackButton) {
      const handleBack = () => router.push("/");
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);

      return () => {
        tg.BackButton.offClick(handleBack);
        tg.BackButton.hide();
      };
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F4EFFE] text-[#2A2352] px-4 py-6 max-w-lg mx-auto flex flex-col gap-5">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-[#DCD0F5]">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-xs text-[#7B6FA6] hover:text-[#2A2352] transition-colors -ml-1 p-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("В хаб")}</span>
        </button>
        <h1 className="text-sm font-semibold text-[#2A2352]">{t("Профиль")}</h1>
        <div className="w-8" />
      </header>

      {/* User Information Card */}
      <Card className="border-[#DCD0F5] bg-white rounded-2xl shadow-none">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#B7A0F6]/30 flex items-center justify-center text-[#2A2352] shrink-0">
            <User className="h-6 w-6 text-[#2A2352]" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[#2A2352] truncate">
              {user?.first_name || t("Пользователь")}
            </h2>
            <p className="text-xs text-[#7B6FA6]">
              {user?.username ? `@${user.username}` : `TG ID: ${user?.telegram_id || "Dev"}`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interface Language */}
      <Card className="border-[#DCD0F5] bg-white rounded-2xl shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#B7A0F6]" />
            {t("Язык интерфейса")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("Выберите язык интерфейса приложения")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {(["ru", "uz"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  lang === code
                    ? "border-[#B7A0F6] bg-[#F0EAFB] font-medium"
                    : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                }`}
              >
                <span className="text-xs text-[#2A2352] flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5]">
                    {code.toUpperCase()}
                  </span>
                  <span>{code === "ru" ? t("Русский") : "O'zbekcha"}</span>
                </span>
                {lang === code && <Check className="h-3.5 w-3.5 text-[#1D6B5B]" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
