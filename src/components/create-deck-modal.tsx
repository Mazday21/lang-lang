"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/i18n-context";
import { Sparkles, X, Loader2, ArrowRight } from "lucide-react";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
  onLimitExceeded?: (reason?: string) => void;
  nativeLang?: string;
  targetLang?: string;
}

export function CreateDeckModal({
  isOpen,
  onClose,
  token,
  onLimitExceeded,
  nativeLang = "ru",
  targetLang = "uz",
}: CreateDeckModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getSuggestions = () => {
    if (targetLang === "en") {
      return [
        "Airport & Flight check-in",
        "Ordering food at a cafe",
        "Job interview basics",
        "City travel & Asking directions",
        "Shopping & Asking prices",
      ];
    }
    if (targetLang === "ru") {
      return [
        "Kundalik salomlashish va odob",
        "Supermarketda xarid qilish",
        "Metroda yo'l so'rash",
        "Taksida manzilga borish",
        "Do'stlar bilan uchrashuv",
      ];
    }
    return [
      "Поход на базар Чорсу",
      "Заказ плова и чая в чайхане",
      "Поездка на такси в Ташкенте",
      "Глаголы движения (bor-, kel-)",
      "Знакомство и вежливые фразы",
    ];
  };

  const suggestions = getSuggestions();

  const handleGenerate = async (selectedTopic?: string) => {
    const finalTopic = (selectedTopic || topic).trim();
    if (!finalTopic || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/decks/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: finalTopic,
          native_language: nativeLang,
          target_language: targetLang,
        }),
      });

      const data = await res.json();

      if (data.limit_exceeded || res.status === 403) {
        onClose();
        if (onLimitExceeded) onLimitExceeded(data.reason);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || t("Не удалось сгенерировать колоду"));
      }

      // Success: navigate straight to training the new deck
      onClose();
      router.push(`/train/${data.deck_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Ошибка генерации");
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-[#DCD0F5] bg-[#F4EFFE] rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <CardHeader className="pt-6 pb-2 px-6 relative">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[#EFE9FC] flex items-center justify-center text-[#7B6FA6] hover:text-[#2A2352] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="h-12 w-12 rounded-2xl bg-[#B7A0F6]/30 text-[#2A2352] flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-[#2A2352]" />
          </div>

          <CardTitle className="text-lg font-semibold text-[#2A2352]">
            {t("Создать колоду с помощью ИИ")}
          </CardTitle>
          <CardDescription className="text-xs text-[#7B6FA6] leading-relaxed">
            {t("Укажите любую тему, и репетитор сгенерирует 5–7 карточек с примерами и правилами.")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6 pt-2">
          {/* Quick topic tags */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#7B6FA6] uppercase tracking-wider">
              {t("Рекомендуемые темы:")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setTopic(item);
                  }}
                  className="text-xs px-2.5 py-1 rounded-xl bg-white border border-[#DCD0F5] text-[#2A2352] hover:border-[#B7A0F6] active:scale-95 transition-all text-left"
                >
                  {t(item)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom topic input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-3 pt-1"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#7B6FA6]">
                {t("Или введите свою тему:")}
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("например: Разговор в аэропорту, Числительные...")}
                disabled={isGenerating}
                autoFocus
                className="text-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-[#A63A4B] bg-[#FFF1F3] border border-[#F9D7DD] p-2.5 rounded-xl">
                {error}
              </p>
            )}

            {isGenerating && (
              <div className="p-3 bg-[#F2ECFC] border border-[#DCD0F5] rounded-2xl flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 text-[#B7A0F6] animate-spin shrink-0" />
                <p className="text-xs text-[#7B6FA6] leading-relaxed">
                  {t("ИИ составляет карточки и грамматические пояснения...")}
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={!topic.trim() || isGenerating}
              className="w-full text-sm font-semibold h-13 rounded-2xl flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("Генерируем...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Создать и начать тренировку")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
