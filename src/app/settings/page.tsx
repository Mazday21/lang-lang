"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Sparkles,
  Check,
  RefreshCw,
  Zap,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { UserLimitStatus, DAILY_FREE_LIMIT } from "@/lib/limits";

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, isLoading: isAuthLoading } = useAuth();

  const [limits, setLimits] = useState<UserLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

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

  const fetchLimits = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/user/limits", { headers });
      const data = await res.json();
      if (data.success) {
        setLimits(data);
      }
    } catch (err) {
      console.error("Failed to load user limits:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchLimits();
    }
  }, [isAuthLoading, fetchLimits]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ provider: "stars" }),
      });

      const data = await res.json();
      if (data.success && data.checkout_url) {
        const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
        if (tg?.openLink) {
          tg.openLink(data.checkout_url);
        } else {
          window.open(data.checkout_url, "_blank");
        }
      }
    } catch {
      setMessage("Не удалось инициировать оплату.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSetPlan = async (plan: "free" | "pro") => {
    setIsUpdating(true);
    setMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/user/limits", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "set_plan", plan }),
      });
      const data = await res.json();
      if (data.success) {
        setLimits(data);
        setMessage(plan === "pro" ? "Тариф Pro успешно активирован!" : "Переключено на базовый тариф Free");
      }
    } catch {
      setMessage("Не удалось обновить тариф");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetLimits = async () => {
    setIsUpdating(true);
    setMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/user/limits", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setLimits(data);
        setMessage("Счетчик AI-проверок сброшен на 0");
      }
    } catch {
      setMessage("Не удалось сбросить счетчик");
    } finally {
      setIsUpdating(false);
    }
  };

  const isPro = limits?.plan === "pro";
  const usedCount = limits?.ai_requests_today || 0;
  const totalLimit = isPro ? "Безлимитно" : DAILY_FREE_LIMIT;
  const progressPercent = isPro ? 100 : Math.min(100, Math.round((usedCount / DAILY_FREE_LIMIT) * 100));

  return (
    <main className="min-h-screen bg-[#F4EFFE] text-[#2A2352] px-4 py-6 max-w-lg mx-auto flex flex-col gap-5">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-[#DCD0F5]">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-xs text-[#7B6FA6] hover:text-[#2A2352] transition-colors -ml-1 p-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>В хаб</span>
        </button>
        <h1 className="text-sm font-semibold text-[#2A2352]">Профиль и Тариф</h1>
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
              {user?.first_name || "Пользователь"}
            </h2>
            <p className="text-xs text-[#7B6FA6]">
              {user?.username ? `@${user.username}` : `TG ID: ${user?.telegram_id || "Dev"}`}
            </p>
          </div>
          <Badge variant={isPro ? "secondary" : "outline"} className="text-xs font-medium">
            {isPro ? "Pro" : "Free"}
          </Badge>
        </CardContent>
      </Card>

      {/* AI Limits Card */}
      <Card className="border-[#DCD0F5] bg-white rounded-2xl shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#B7A0F6]" />
              Расход AI-проверок
            </CardTitle>
            <span className="text-xs text-[#7B6FA6] font-medium">
              {usedCount} из {totalLimit}
            </span>
          </div>
          <CardDescription className="text-xs">
            {isPro
              ? "У вас действует безлимитный доступ к нейросети"
              : "Дневной лимит сбрасывается в полночь"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {isLoading ? (
            <Skeleton className="h-3 w-full rounded-full" />
          ) : (
            <div className="space-y-1.5">
              <div className="w-full bg-[#DCD0F5] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    progressPercent >= 100 && !isPro ? "bg-[#F9D7DD]" : "bg-[#B9EBDD]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#7B6FA6]">
                <span>Сегодня использовано: {usedCount}</span>
                <span>{isPro ? "∞" : `Осталось: ${limits?.remaining ?? 20}`}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pro Subscription Offer */}
      <Card className="border-[#DCD0F5] bg-white rounded-2xl shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2A2352]" />
              Тариф Pro
            </CardTitle>
            <span className="text-xs font-semibold text-[#2A2352]">39 000 UZS / ⭐️ 150</span>
          </div>
          <CardDescription className="text-xs">
            Полный фокус на изучении без пауз и ограничений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ul className="text-xs text-[#2A2352] space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Безлимитная проверка ответов ИИ-репетитором</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Динамическая генерация контекста для каждого правила</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Создание персональных колод по любой теме (AI Builder)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Голосовой ввод Whisper без дневных лимитов</span>
            </li>
          </ul>

          {message && (
            <div className="text-xs text-[#1D6B5B] bg-[#B9EBDD]/40 border border-[#B9EBDD] p-2.5 rounded-xl text-center">
              {message}
            </div>
          )}

          {isPro ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleSetPlan("free")}
              className="w-full text-xs text-[#7B6FA6]"
            >
              Отменить Pro (Вернуться на Free)
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              disabled={isCheckingOut || isUpdating}
              onClick={handleCheckout}
              className="w-full text-xs sm:text-sm font-semibold h-13 rounded-2xl flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Подписка Pro — 39 000 UZS / ⭐️ 150 Stars</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dev Testing Controls */}
      <Card className="border-[#DCD0F5] bg-[#F2ECFC] rounded-2xl shadow-none">
        <CardContent className="p-4 space-y-2.5">
          <p className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
            Тестирование для разработки
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={handleResetLimits}
              className="flex-1 text-xs h-9 bg-white"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Сбросить счетчик (0/20)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleSetPlan(isPro ? "free" : "pro")}
              className="flex-1 text-xs h-9 bg-white"
            >
              Переключить на {isPro ? "Free" : "Pro"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
