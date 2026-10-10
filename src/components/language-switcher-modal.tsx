"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n-context";
import { X, Check, Globe } from "lucide-react";

interface LanguageSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNative?: string;
  currentTarget?: string;
  onSave: (nativeLang: string, targetLang: string) => Promise<void>;
}

export function LanguageSwitcherModal({
  isOpen,
  onClose,
  currentNative = "ru",
  currentTarget = "uz",
  onSave,
}: LanguageSwitcherModalProps) {
  const { t } = useI18n();
  const [nativeLang, setNativeLang] = useState(currentNative);
  const [targetLang, setTargetLang] = useState(currentTarget);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNativeLang(currentNative);
    setTargetLang(currentTarget);
  }, [currentNative, currentTarget, isOpen]);

  if (!isOpen) return null;

  const getTargetOptions = (native: string) => {
    if (native === "ru") {
      return [
        { code: "uz", codeBadge: "UZ", name: "O'zbekcha (Узбекский)" },
        { code: "en", codeBadge: "EN", name: "English (Английский)" },
        { code: "it", codeBadge: "IT", name: "Italiano (Итальянский)" },
      ];
    } else {
      return [
        { code: "en", codeBadge: "EN", name: "English (Ingliz tili)" },
        { code: "ru", codeBadge: "RU", name: "Русский (Rus tili)" },
        { code: "it", codeBadge: "IT", name: "Italiano (Italyan tili)" },
      ];
    }
  };

  const handleSelectNative = (code: string) => {
    setNativeLang(code);
    const availableTargets = getTargetOptions(code);
    if (!availableTargets.some((opt) => opt.code === targetLang)) {
      setTargetLang(availableTargets[0].code);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(nativeLang, targetLang);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const targetOptions = getTargetOptions(nativeLang);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-[#DCD0F5] bg-[#F4EFFE] rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <CardHeader className="pt-6 pb-2 px-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[#EFE9FC] flex items-center justify-center text-[#7B6FA6] hover:text-[#2A2352] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="h-10 w-10 rounded-2xl bg-[#B7A0F6]/30 text-[#2A2352] flex items-center justify-center mb-1">
            <Globe className="h-5 w-5 text-[#2A2352]" />
          </div>

          <CardTitle className="text-base font-semibold text-[#2A2352]">
            {t("Языковая пара обучения")}
          </CardTitle>
          <CardDescription className="text-xs text-[#7B6FA6]">
            {t("Выберите ваш родной язык и язык, который хотите изучать")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6 pt-2">
          {/* Native Language Block */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
              {t("1. Ваш родной язык:")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectNative("ru")}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  nativeLang === "ru"
                    ? "border-[#B7A0F6] bg-white font-medium"
                    : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                }`}
              >
                <span className="text-xs text-[#2A2352] flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5] text-[#2A2352]">RU</span>
                  <span>{t("Русский")}</span>
                </span>
                {nativeLang === "ru" && (
                  <Check className="h-3.5 w-3.5 text-[#1D6B5B]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectNative("uz")}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  nativeLang === "uz"
                    ? "border-[#B7A0F6] bg-white font-medium"
                    : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                }`}
              >
                <span className="text-xs text-[#2A2352] flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5] text-[#2A2352]">UZ</span>
                  <span>{t("O'zbekcha")}</span>
                </span>
                {nativeLang === "uz" && (
                  <Check className="h-3.5 w-3.5 text-[#1D6B5B]" />
                )}
              </button>
            </div>
          </div>

          {/* Target Language Block */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
              {t("2. Язык изучения:")}
            </span>
            <div className="space-y-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setTargetLang(opt.code)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    targetLang === opt.code
                      ? "border-[#B7A0F6] bg-white font-medium"
                      : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                  }`}
                >
                  <span className="text-xs text-[#2A2352] flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5] text-[#2A2352]">{opt.codeBadge}</span>
                    <span>{t(opt.name)}</span>
                  </span>
                  {targetLang === opt.code && (
                    <div className="h-5 w-5 rounded-full bg-[#B9EBDD] flex items-center justify-center text-[#1D6B5B]">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-xs font-semibold h-12 rounded-2xl shadow-none mt-2 bg-[#B7A0F6] text-[#2A2352] hover:bg-[#9C82F0]"
          >
            {isSaving ? t("Сохранение...") : t("Применить языковую пару")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
