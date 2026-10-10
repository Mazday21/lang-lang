"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowLeft, RefreshCw, Loader2, ExternalLink } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onResetLimit?: () => Promise<void>;
  token?: string | null;
}

export function PaywallModal({ isOpen, onClose, onResetLimit, token }: PaywallModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (provider = "stars") => {
    setIsProcessing(true);
    setCheckoutNotice(null);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      if (data.success && data.checkout_url) {
        setCheckoutNotice("Переход к оплате подписки Pro...");

        // Use Telegram WebApp openLink or window.open
        const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
        if (tg?.openLink) {
          tg.openLink(data.checkout_url);
        } else {
          window.open(data.checkout_url, "_blank");
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutNotice("Не удалось инициировать оплату. Попробуйте позже.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    if (onResetLimit) {
      await onResetLimit();
    } else {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("/api/user/limits", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "reset" }),
      });
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-[#DCD0F5] bg-[#F4EFFE] rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center pt-7 pb-3 px-6 space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-[#B7A0F6]/30 text-[#2A2352] flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-[#2A2352]" />
          </div>
          <Badge variant="secondary" className="mx-auto text-[11px] font-medium">
            Лимит исчерпан
          </Badge>
          <CardTitle className="text-lg font-semibold text-[#2A2352]">
            Бесплатные AI-проверки закончились
          </CardTitle>
          <CardDescription className="text-xs text-[#7B6FA6] leading-relaxed">
            Бесплатные 20 проверок на сегодня подошли к концу. Возвращайтесь завтра или разблокируйте безлимит, чтобы продолжить прямо сейчас.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6 pt-0">
          {/* Plan Perks */}
          <div className="p-4 rounded-2xl bg-white border border-[#DCD0F5] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2A2352]">
              <span className="text-[#B9EBDD] font-bold">●</span>
              <span>Возможности тарифа Pro:</span>
            </div>
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
                <span>Создание персональных колод по любой теме</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
                <span>Умное распознавание речи Whisper без ограничений</span>
              </li>
            </ul>
          </div>

          {checkoutNotice && (
            <div className="text-xs text-[#1D6B5B] bg-[#B9EBDD]/40 border border-[#B9EBDD] p-3 rounded-xl text-center animate-in fade-in">
              {checkoutNotice}
            </div>
          )}

          {/* Action buttons with dual currency & Stars */}
          <div className="space-y-2 pt-1">
            <Button
              variant="secondary"
              size="lg"
              disabled={isProcessing}
              onClick={() => handleCheckout("stars")}
              className="w-full text-xs sm:text-sm font-semibold h-13 rounded-2xl shadow-none flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Подписка Pro — 39 000 UZS / ⭐️ 150 Stars</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="w-full text-xs h-11 rounded-2xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Вернуться в Хаб</span>
            </Button>

            {/* Dev reset shortcut */}
            <button
              onClick={handleReset}
              className="w-full text-[11px] text-[#7B6FA6] hover:text-[#2A2352] flex items-center justify-center gap-1 pt-1 underline transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Сбросить лимит (Тест для разработки)</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
