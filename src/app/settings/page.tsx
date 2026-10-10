"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  UserLimitStatus,
  FREE_TRIAL_LIMIT,
  FREE_DAILY_VOICE_LIMIT,
  PRO_DAILY_VOICE_LIMIT,
  PRO_DAILY_GENERATION_LIMIT,
} from "@/lib/limits";

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, isLoading: isAuthLoading } = useAuth();

  const [limits, setLimits] = useState<UserLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Dev / tester testing panel
  const [devInfo, setDevInfo] = useState<{
    isDev: boolean;
    isTester: boolean;
    testers: Array<{ id: string; username: string | null; first_name: string | null }>;
  } | null>(null);
  const [testerInput, setTesterInput] = useState("");
  const [isSavingTester, setIsSavingTester] = useState(false);
  const [devMessage, setDevMessage] = useState<string | null>(null);

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

  const fetchDevInfo = useCallback(async () => {
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/dev/testers", { headers });
      const data = await res.json();
      if (data.success) {
        setDevInfo({
          isDev: Boolean(data.is_dev),
          isTester: Boolean(data.is_tester),
          testers: data.testers || [],
        });
      }
    } catch {
      // The testing panel is optional — ignore errors
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchDevInfo();
    }
  }, [isAuthLoading, fetchDevInfo]);

  const handleAddTester = async () => {
    const id = testerInput.trim();
    if (!id || isSavingTester) return;
    setIsSavingTester(true);
    setDevMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/dev/testers", {
        method: "POST",
        headers,
        body: JSON.stringify({ telegram_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setDevInfo((prev) => (prev ? { ...prev, testers: data.testers || [] } : prev));
        setTesterInput("");
        const added = (data.testers || []).find(
          (t: { id: string; username: string | null }) => t.id === id
        );
        setDevMessage(
          `✅ Тестировщик добавлен: ${added?.username ? `@${added.username}` : id}`
        );
      } else {
        setDevMessage(`❌ ${data.error || "Не удалось добавить тестировщика"}`);
      }
    } catch {
      setDevMessage("❌ Не удалось добавить тестировщика");
    } finally {
      setIsSavingTester(false);
    }
  };

  const handleRemoveTester = async (id: string) => {
    if (isSavingTester) return;
    setIsSavingTester(true);
    setDevMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/dev/testers", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ telegram_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setDevInfo((prev) => (prev ? { ...prev, testers: data.testers || [] } : prev));
        setDevMessage(`✅ Тестировщик ${id} удалён`);
      } else {
        setDevMessage(`❌ ${data.error || "Не удалось удалить тестировщика"}`);
      }
    } catch {
      setDevMessage("❌ Не удалось удалить тестировщика");
    } finally {
      setIsSavingTester(false);
    }
  };

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
  const voiceUsed = limits?.voice.used ?? 0;
  const voiceLimit = limits?.voice.limit ?? (isPro ? PRO_DAILY_VOICE_LIMIT : FREE_DAILY_VOICE_LIMIT);
  const voicePercent = voiceLimit > 0 ? Math.min(100, Math.round((voiceUsed / voiceLimit) * 100)) : 0;
  const genUsed = limits?.generation.used ?? 0;
  const genPercent = Math.min(100, Math.round((genUsed / PRO_DAILY_GENERATION_LIMIT) * 100));

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
              Лимиты ИИ
            </CardTitle>
            <Badge variant={isPro ? "secondary" : "outline"} className="text-[10px]">
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {isPro
              ? "Ежедневные лимиты: 60 голосовых проверок и 5 генераций колод"
              : "Пробный лимит: 5 AI-проверок на аккаунт • генерация колод в Pro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ) : (
            <>
              {/* Voice checks quota */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#2A2352]">AI-проверки голоса</span>
                  <span className="text-[#7B6FA6]">
                    {voiceUsed} из {voiceLimit} /день
                  </span>
                </div>
                <div className="w-full bg-[#DCD0F5] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      voicePercent >= 100 ? "bg-[#F9D7DD]" : "bg-[#B9EBDD]"
                    }`}
                    style={{ width: `${voicePercent}%` }}
                  />
                </div>
                {!isPro && (
                  <p className="text-[11px] text-[#7B6FA6]">
                    Пробных проверок на аккаунт осталось: {limits?.remaining ?? FREE_TRIAL_LIMIT}
                  </p>
                )}
              </div>

              {/* Generation quota */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#2A2352]">Генерация колод с помощью ИИ</span>
                  <span className="text-[#7B6FA6]">
                    {isPro ? `${genUsed} из ${PRO_DAILY_GENERATION_LIMIT} /день` : "Доступно в Pro"}
                  </span>
                </div>
                <div className="w-full bg-[#DCD0F5] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      genPercent >= 100 ? "bg-[#F9D7DD]" : "bg-[#B7A0F6]"
                    }`}
                    style={{ width: `${isPro ? genPercent : 0}%` }}
                  />
                </div>
              </div>
            </>
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
              <span>Создание персональных колод по любой теме с помощью ИИ</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>60 голосовых проверок в день с умным распознаванием речи</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Умные закрепляющие колоды под ваши слабые места</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
              <span>Новые функции и обновления — первыми</span>
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

      {/* Dev Testing Controls — visible to the developer and testers only */}
      {(devInfo?.isDev || devInfo?.isTester) && (
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
                Сбросить счетчик ({voiceUsed}/{voiceLimit})
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

            {/* Tester management — developer only */}
            {devInfo?.isDev && (
              <div className="space-y-2 pt-2.5 border-t border-[#DCD0F5]">
                <p className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
                  Тестировщики ({devInfo.testers.length})
                </p>
                <div className="flex gap-2">
                  <Input
                    value={testerInput}
                    onChange={(e) => setTesterInput(e.target.value)}
                    placeholder="Telegram ID"
                    inputMode="numeric"
                    className="h-9 text-xs bg-white"
                  />
                  <Button
                    size="sm"
                    disabled={isSavingTester || !testerInput.trim()}
                    onClick={handleAddTester}
                    className="h-9 text-xs px-4 bg-[#B7A0F6] text-[#2A2352] hover:bg-[#9C82F0]"
                  >
                    Добавить
                  </Button>
                </div>

                {devMessage && (
                  <div className="text-[11px] text-[#2A2352] bg-white border border-[#DCD0F5] p-2 rounded-xl">
                    {devMessage}
                  </div>
                )}

                {devInfo.testers.length > 0 && (
                  <div className="space-y-1.5">
                    {devInfo.testers.map((tester) => (
                      <div
                        key={tester.id}
                        className="flex items-center justify-between gap-2 bg-white border border-[#DCD0F5] rounded-xl px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-[#2A2352] font-medium">{tester.id}</span>
                          <span className="text-[11px] text-[#7B6FA6] truncate">
                            {tester.username
                              ? `@${tester.username}`
                              : tester.first_name || "профиль не найден"}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isSavingTester}
                          onClick={() => handleRemoveTester(tester.id)}
                          className="text-[11px] text-[#A63A4B] underline hover:no-underline transition-all shrink-0"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-[#7B6FA6] leading-relaxed">
                  Тестировщики получают эти же кнопки в своём аккаунте, но не могут
                  добавлять других. Ваш ID: {user?.telegram_id || "—"} (разработчик)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
