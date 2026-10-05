"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        { code: "uz", flag: "🇺🇿", name: "O'zbekcha (Узбекский)" },
        { code: "en", flag: "🇬🇧", name: "English (Английский)" },
      ];
    } else {
      return [
        { code: "en", flag: "🇬🇧", name: "English (Ingliz tili)" },
        { code: "ru", flag: "🇷🇺", name: "Русский (Rus tili)" },
      ];
    }
  };

  const handleSelectNative = (code: string) => {
    setNativeLang(code);
    const availableTargets = getTargetOptions(code);
    if (!availableTargets.some((t) => t.code === targetLang)) {
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
      <Card className="w-full max-w-md border-[#E8E2D9] bg-[#FDFBF7] rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <CardHeader className="pt-6 pb-2 px-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#8A8493] hover:text-[#4A4453] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="h-10 w-10 rounded-2xl bg-[#E0BBE4]/30 text-[#482C4E] flex items-center justify-center mb-1">
            <Globe className="h-5 w-5 text-[#482C4E]" />
          </div>

          <CardTitle className="text-base font-semibold text-[#4A4453]">
            Языковая пара обучения
          </CardTitle>
          <CardDescription className="text-xs text-[#8A8493]">
            Выберите ваш родной язык и язык, который хотите изучать
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6 pt-2">
          {/* Native Language Block */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8A8493] uppercase tracking-wider">
              1. Ваш родной язык:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectNative("ru")}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  nativeLang === "ru"
                    ? "border-[#E0BBE4] bg-white font-medium"
                    : "border-[#E8E2D9] bg-white hover:border-[#E0BBE4]"
                }`}
              >
                <span className="text-xs text-[#4A4453] flex items-center gap-1.5">
                  <span>🇷🇺</span> Русский
                </span>
                {nativeLang === "ru" && (
                  <Check className="h-3.5 w-3.5 text-[#2A472C]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectNative("uz")}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  nativeLang === "uz"
                    ? "border-[#E0BBE4] bg-white font-medium"
                    : "border-[#E8E2D9] bg-white hover:border-[#E0BBE4]"
                }`}
              >
                <span className="text-xs text-[#4A4453] flex items-center gap-1.5">
                  <span>🇺🇿</span> O'zbekcha
                </span>
                {nativeLang === "uz" && (
                  <Check className="h-3.5 w-3.5 text-[#2A472C]" />
                )}
              </button>
            </div>
          </div>

          {/* Target Language Block */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8A8493] uppercase tracking-wider">
              2. Язык изучения:
            </span>
            <div className="space-y-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setTargetLang(opt.code)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    targetLang === opt.code
                      ? "border-[#E0BBE4] bg-white font-medium"
                      : "border-[#E8E2D9] bg-white hover:border-[#E0BBE4]"
                  }`}
                >
                  <span className="text-xs text-[#4A4453] flex items-center gap-2">
                    <span className="text-lg">{opt.flag}</span> {opt.name}
                  </span>
                  {targetLang === opt.code && (
                    <div className="h-5 w-5 rounded-full bg-[#C7E5C8] flex items-center justify-center text-[#2A472C]">
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
            className="w-full text-xs font-semibold h-12 rounded-2xl shadow-none mt-2 bg-[#E0BBE4] text-[#482C4E] hover:bg-[#D7AEDC]"
          >
            {isSaving ? "Сохранение..." : "Применить языковую пару"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
