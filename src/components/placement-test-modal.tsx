"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n-context";
import { Check, X, GraduationCap, ArrowRight, ArrowLeft, Globe } from "lucide-react";
import {
  getPlacementTest,
  scoreToLevel,
  proficiencyLabel,
  PlacementQuestion,
} from "@/lib/data/placement-tests";

export type PlacementMode = "test" | "manual" | "skip";

interface PlacementTestModalProps {
  isOpen: boolean;
  pairKey: string;
  /** Show the language selection banner before the test (new users). */
  startWithLanguage?: boolean;
  onComplete: (
    level: number,
    mode: PlacementMode,
    answers: number[],
    pair?: string
  ) => Promise<void> | void;
  onLanguagesChange?: (native: string, target: string) => Promise<void> | void;
  onClose: () => void;
  canClose?: boolean;
}

type Step = "language" | "questions" | "manual" | "done";

const NATIVE_OPTIONS = [
  { code: "ru", badge: "RU", name: "Русский" },
  { code: "uz", badge: "UZ", name: "O'zbekcha" },
];

function getTargetOptions(native: string) {
  if (native === "ru") {
    return [
      { code: "uz", badge: "UZ", name: "Узбекский" },
      { code: "en", badge: "EN", name: "Английский" },
      { code: "it", badge: "IT", name: "Итальянский" },
    ];
  }
  return [
    { code: "ru", badge: "RU", name: "Русский" },
    { code: "en", badge: "EN", name: "Английский" },
    { code: "it", badge: "IT", name: "Итальянский" },
  ];
}

export function PlacementTestModal({
  isOpen,
  pairKey,
  startWithLanguage = false,
  onComplete,
  onLanguagesChange,
  onClose,
  canClose = true,
}: PlacementTestModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("language");
  const [selNative, setSelNative] = useState<string>("ru");
  const [selTarget, setSelTarget] = useState<string>("uz");
  const [activePair, setActivePair] = useState<string>(pairKey);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [manualLevel, setManualLevel] = useState<number | null>(null);
  const [result, setResult] = useState<{
    level: number;
    mode: PlacementMode;
    score: number;
    total: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const [nat, tar] = pairKey.split("-");
      setSelNative(nat || "ru");
      setSelTarget(tar || "uz");
      setActivePair(pairKey);
      setStep(startWithLanguage ? "language" : "questions");
      setQIndex(0);
      setAnswers([]);
      setManualLevel(null);
      setResult(null);
      setIsSaving(false);
    }
  }, [isOpen, pairKey, startWithLanguage]);

  if (!isOpen) return null;

  const test = getPlacementTest(activePair);
  const questions: PlacementQuestion[] = test?.questions || [];
  const question = questions[qIndex];

  const handleSelectNative = (code: string) => {
    setSelNative(code);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    const options = getTargetOptions(code);
    if (!options.some((o) => o.code === selTarget)) {
      setSelTarget(options[0].code);
    }
  };

  const handleLanguageNext = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onLanguagesChange?.(selNative, selTarget);
      setActivePair(`${selNative}-${selTarget}`);
      setQIndex(0);
      setAnswers([]);
      setStep("questions");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    } finally {
      setIsSaving(false);
    }
  };

  const finishTest = async (finalAnswers: number[]) => {
    setIsSaving(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) score++;
    });
    const level = scoreToLevel(score, questions.length);
    setResult({ level, mode: "test", score, total: questions.length });
    setStep("done");
    try {
      await onComplete(level, "test", finalAnswers, activePair);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isSaving || questions.length === 0) return;
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();

    const finalAnswers = [...answers];
    finalAnswers[qIndex] = optionIndex;
    setAnswers(finalAnswers);

    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      finishTest(finalAnswers);
    }
  };

  const handleManualSave = async () => {
    if (manualLevel === null || isSaving) return;
    setIsSaving(true);
    setResult({ level: manualLevel, mode: "manual", score: 0, total: 0 });
    setStep("done");
    try {
      await onComplete(manualLevel, "manual", [], activePair);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onComplete(0, "skip", [], activePair);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {step === "language" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[#EFE9FC] flex items-center justify-center">
                    <Globe className="h-5 w-5 text-[#2A2352]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#2A2352]">{t("Языки обучения")}</h2>
                    <p className="text-[11px] text-[#7B6FA6]">
                      {t("Шаг перед мини-тестом на уровень")}
                    </p>
                  </div>
                </div>
                {canClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-xl hover:bg-[#EFE9FC] text-[#7B6FA6] flex items-center justify-center"
                    title={t("Закрыть")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#7B6FA6] leading-relaxed">
                {t(
                  "Выберите ваш родной язык и язык, который хотите изучать. Тест и колоды будут подобраны именно для этой пары."
                )}
              </p>

              {/* Native language */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
                  {t("1. Родной язык:")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {NATIVE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleSelectNative(opt.code)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selNative === opt.code
                          ? "border-[#B7A0F6] bg-white font-medium"
                          : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                      }`}
                    >
                      <span className="text-xs text-[#2A2352] flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5]">
                          {opt.badge}
                        </span>
                        <span>{t(opt.name)}</span>
                      </span>
                      {selNative === opt.code && <Check className="h-3.5 w-3.5 text-[#1D6B5B]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target language */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
                  {t("2. Язык изучения:")}
                </span>
                <div className="space-y-2">
                  {getTargetOptions(selNative).map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setSelTarget(opt.code);
                        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selTarget === opt.code
                          ? "border-[#B7A0F6] bg-white font-medium"
                          : "border-[#DCD0F5] bg-white hover:border-[#B7A0F6]"
                      }`}
                    >
                      <span className="text-xs text-[#2A2352] flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F2ECFC] border border-[#DCD0F5]">
                          {opt.badge}
                        </span>
                        <span>{t(opt.name)}</span>
                      </span>
                      {selTarget === opt.code && <Check className="h-3.5 w-3.5 text-[#1D6B5B]" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleLanguageNext}
                disabled={isSaving}
                className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
              >
                <span>{isSaving ? t("Сохраняем...") : t("Далее — мини-тест")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === "questions" && question && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[#EFE9FC] flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#2A2352]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#2A2352]">{t("Мини-тест на уровень")}</h2>
                    <p className="text-[11px] text-[#7B6FA6]">
                      {t("Вопрос {i} из {n}", { i: qIndex + 1, n: questions.length })}
                    </p>
                  </div>
                </div>
                {canClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-xl hover:bg-[#EFE9FC] text-[#7B6FA6] flex items-center justify-center"
                    title={t("Закрыть")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-[#EFE9FC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B7A0F6] rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((qIndex / questions.length) * 100)}%` }}
                />
              </div>

              <p className="text-sm font-medium text-[#2A2352] leading-relaxed pt-1">
                {question.text}
              </p>

              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    className="w-full p-3 rounded-2xl border border-[#DCD0F5] bg-white hover:border-[#B7A0F6] hover:bg-[#F8F4FE] active:scale-[0.99] transition-all text-left text-sm text-[#2A2352]"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="pt-1 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("manual")}
                  className="w-full text-xs font-medium h-10 rounded-2xl"
                >
                  {t("Выбрать уровень вручную")}
                </Button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full text-[11px] text-[#7B6FA6] underline hover:text-[#2A2352] transition-colors"
                >
                  {t("Пропустить тест")}
                </button>
              </div>
            </div>
          )}

          {step === "manual" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[#EFE9FC] flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#2A2352]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[#2A2352]">{t("Уровень владения")}</h2>
                </div>
                {canClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-xl hover:bg-[#EFE9FC] text-[#7B6FA6] flex items-center justify-center"
                    title={t("Закрыть")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#7B6FA6] leading-relaxed">
                {t(
                  "Выберите свой текущий уровень от 0 до 10. По мере обучения уровень будет расти автоматически."
                )}
              </p>

              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 11 }, (_, i) => i).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setManualLevel(lvl);
                      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
                    }}
                    className={`h-11 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                      manualLevel === lvl
                        ? "border-[#B7A0F6] bg-[#F0EAFB] text-[#2A2352]"
                        : "border-[#DCD0F5] bg-white text-[#2A2352] hover:border-[#B7A0F6]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="text-center min-h-[32px]">
                {manualLevel !== null && (
                  <p className="text-xs text-[#7B6FA6]">
                    {t("Уровень {n}/10 · {label}", {
                      n: manualLevel,
                      label: t(proficiencyLabel(manualLevel)),
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleManualSave}
                  disabled={manualLevel === null || isSaving}
                  className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
                >
                  <span>{isSaving ? t("Сохраняем...") : t("Сохранить уровень")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep("questions")}
                    className="w-full text-[11px] text-[#7B6FA6] underline hover:text-[#2A2352] transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    {t("Вернуться к тесту")}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="space-y-4 text-center">
              <div className="h-14 w-14 rounded-3xl bg-[#B9EBDD] flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-[#1D6B5B]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#2A2352]">
                  {result.mode === "test" ? t("Тест пройден!") : t("Уровень сохранён!")}
                </h2>
                <p className="text-xs text-[#7B6FA6] mt-1">
                  {result.mode === "test"
                    ? t("Правильных ответов: {s} из {t}", {
                        s: result.score,
                        t: result.total,
                      })
                    : t("Уровень выбран вручную")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0EAFB] border border-[#B7A0F6]">
                <p className="text-xs text-[#7B6FA6]">{t("Ваш уровень владения")}</p>
                <p className="text-3xl font-bold text-[#2A2352] mt-1">
                  {result.level}
                  <span className="text-base font-medium text-[#7B6FA6]">/10</span>
                </p>
                <p className="text-sm font-medium text-[#2A2352] mt-0.5">
                  {t(proficiencyLabel(result.level))}
                </p>
              </div>

              <p className="text-xs text-[#7B6FA6] leading-relaxed">
                {t(
                  "Мы подняли подходящие вам колоды наверх списка. Уровень будет расти автоматически по мере выученных слов, а тест можно пройти заново в любой момент."
                )}
              </p>

              <Button
                onClick={onClose}
                className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
                disabled={isSaving}
              >
                <span>{isSaving ? t("Сохраняем...") : t("Начать обучение")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
