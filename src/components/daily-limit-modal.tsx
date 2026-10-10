"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sunrise } from "lucide-react";
import { useI18n } from "@/context/i18n-context";

interface DailyLimitModalProps {
  isOpen: boolean;
  kind: "voice" | "generation";
  onClose: () => void;
  /** Optional secondary action, e.g. "Продолжить без голоса" in training */
  onSecondary?: () => void;
  secondaryLabel?: string;
}

/**
 * Soft "come back tomorrow" stub shown instead of the paywall when a DAILY
 * AI limit is exhausted: the limit resets at midnight, so we motivate the user
 * to rest instead of pushing a purchase.
 */
export function DailyLimitModal({
  isOpen,
  kind,
  onClose,
  onSecondary,
  secondaryLabel,
}: DailyLimitModalProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  const isVoice = kind === "voice";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl border-none shadow-xl">
        <CardContent className="p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[#B9EBDD] mx-auto flex items-center justify-center">
            <Moon className="h-8 w-8 text-[#1D6B5B]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-[#2A2352]">
              {isVoice ? t("Вы отлично потрудились!") : t("Хватит на сегодня!")}
            </h2>
            <p className="text-xs text-[#7B6FA6] leading-relaxed">
              {isVoice
                ? t("Так много учили сегодня — рекомендуем отдохнуть до завтра. Голосовые проверки уже ждут вас завтра.")
                : t("Все колоды на сегодня созданы. Отдохните — завтра снова можно генерировать новые.")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F0EAFB] border border-[#DCD0F5] flex items-center gap-2.5 text-left">
            <Sunrise className="h-4 w-4 text-[#B7A0F6] shrink-0" />
            <p className="text-[11px] text-[#2A2352] leading-relaxed">
              {t("Лимит обновится в полночь — можно будет продолжить обучение в своём ритме 🌙")}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onClose}
              className="w-full text-xs font-semibold h-12 rounded-2xl"
            >
              {t("Хорошо, до завтра 👋")}
            </Button>
            {onSecondary && (
              <button
                type="button"
                onClick={onSecondary}
                className="w-full text-[11px] text-[#7B6FA6] underline hover:text-[#2A2352] transition-colors"
              >
                {secondaryLabel || t("Продолжить без ИИ")}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
