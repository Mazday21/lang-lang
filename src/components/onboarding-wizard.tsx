"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ArrowLeft, Check, Globe } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (nativeLang: string, targetLang: string) => Promise<void>;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nativeLanguage, setNativeLanguage] = useState<string>("ru");
  const [targetLanguage, setTargetLanguage] = useState<string>("uz");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target options dynamically exclude the chosen native language
  const getTargetOptions = (native: string) => {
    if (native === "ru") {
      return [
        {
          code: "uz",
          codeBadge: "UZ",
          name: "O'zbekcha",
          subtitle: "Узбекский язык • Разговорный и грамматика",
        },
        {
          code: "en",
          codeBadge: "EN",
          name: "English",
          subtitle: "Английский язык • Для работы и путешествий",
        },
        {
          code: "it",
          codeBadge: "IT",
          name: "Italiano",
          subtitle: "Итальянский язык • Музыка, кухня и путешествия",
        },
      ];
    } else {
      return [
        {
          code: "en",
          codeBadge: "EN",
          name: "English",
          subtitle: "Ingliz tili • Xalqaro muloqot va sayohat",
        },
        {
          code: "ru",
          codeBadge: "RU",
          name: "Русский",
          subtitle: "Rus tili • Muloqot va kundalik iboralar",
        },
        {
          code: "it",
          codeBadge: "IT",
          name: "Italiano",
          subtitle: "Italyan tili • Musiqa, oshxona va sayohat",
        },
      ];
    }
  };

  const handleSelectNative = (code: string) => {
    setNativeLanguage(code);
    // Auto-select first available target language for this native
    const targets = getTargetOptions(code);
    setTargetLanguage(targets[0].code);
    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(nativeLanguage, targetLanguage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetOptions = getTargetOptions(nativeLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F4EFFE] animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-6">
        {/* Progress & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B7A0F6]/30 text-[#2A2352] text-xs font-medium">
            <Globe className="h-3.5 w-3.5 text-[#2A2352]" />
            <span>
              {step === 1 ? "Шаг 1 из 2 • Ona tili" : "Шаг 2 из 2 • O'rganish tili"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#2A2352] tracking-tight">
            {step === 1 ? "Выберите родной язык" : "Какой язык хотите изучать?"}
          </h1>

          <p className="text-xs text-[#7B6FA6] max-w-xs mx-auto leading-relaxed">
            {step === 1
              ? "Siz gapiradigan yoki tushunadigan asosiy tilingizni tanlang"
              : "Biz siz uchun boshlang'ich bepul darslar va lug'atlarni tayyorlaymiz"}
          </p>
        </div>

        {/* Step 1: Native Language Selection */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right duration-200">
            {/* Russian */}
            <Card
              onClick={() => handleSelectNative("ru")}
              className={`border-2 cursor-pointer transition-all active:scale-[0.98] rounded-2xl shadow-none ${
                nativeLanguage === "ru"
                  ? "border-[#B7A0F6] bg-white"
                  : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="h-10 w-10 rounded-xl bg-[#F2ECFC] border border-[#DCD0F5] flex items-center justify-center font-bold text-xs text-[#2A2352] shrink-0">
                    RU
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2A2352]">Русский язык</h3>
                    <p className="text-xs text-[#7B6FA6]">Пояснения и правила будут на русском</p>
                  </div>
                </div>
                {nativeLanguage === "ru" && (
                  <div className="h-7 w-7 rounded-full bg-[#B9EBDD] flex items-center justify-center text-[#1D6B5B]">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uzbek */}
            <Card
              onClick={() => handleSelectNative("uz")}
              className={`border-2 cursor-pointer transition-all active:scale-[0.98] rounded-2xl shadow-none ${
                nativeLanguage === "uz"
                  ? "border-[#B7A0F6] bg-white"
                  : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="h-10 w-10 rounded-xl bg-[#F2ECFC] border border-[#DCD0F5] flex items-center justify-center font-bold text-xs text-[#2A2352] shrink-0">
                    UZ
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2A2352]">O'zbek tili</h3>
                    <p className="text-xs text-[#7B6FA6]">Qoidalar va tushuntirishlar o'zbek tilida bo'ladi</p>
                  </div>
                </div>
                {nativeLanguage === "uz" && (
                  <div className="h-7 w-7 rounded-full bg-[#B9EBDD] flex items-center justify-center text-[#1D6B5B]">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(2)}
              variant="default"
              size="lg"
              className="w-full text-sm font-semibold h-13 rounded-2xl shadow-none mt-2 flex items-center justify-center gap-2"
            >
              <span>Далее</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Target Language Selection */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right duration-200">
            {targetOptions.map((opt) => (
              <Card
                key={opt.code}
                onClick={() => setTargetLanguage(opt.code)}
                className={`border-2 cursor-pointer transition-all active:scale-[0.98] rounded-2xl shadow-none ${
                  targetLanguage === opt.code
                    ? "border-[#B7A0F6] bg-white"
                    : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="h-10 w-10 rounded-xl bg-[#F2ECFC] border border-[#DCD0F5] flex items-center justify-center font-bold text-xs text-[#2A2352] shrink-0">
                      {opt.codeBadge}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#2A2352]">{opt.name}</h3>
                      <p className="text-xs text-[#7B6FA6]">{opt.subtitle}</p>
                    </div>
                  </div>
                  {targetLanguage === opt.code && (
                    <div className="h-7 w-7 rounded-full bg-[#B9EBDD] flex items-center justify-center text-[#1D6B5B]">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="h-13 rounded-2xl px-4 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs">Назад</span>
              </Button>

              <Button
                onClick={handleFinish}
                variant="secondary"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 text-sm font-semibold h-13 rounded-2xl shadow-none flex items-center justify-center gap-2 bg-[#B7A0F6] text-[#2A2352]"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isSubmitting ? "Тайёрланмоқда..." : "Начать обучение"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
