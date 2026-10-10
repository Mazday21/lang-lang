"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
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
  onComplete: (level: number, mode: PlacementMode, answers: number[]) => Promise<void> | void;
  onClose: () => void;
  canClose?: boolean;
}

type Step = "questions" | "manual" | "done";

export function PlacementTestModal({
  isOpen,
  pairKey,
  onComplete,
  onClose,
  canClose = true,
}: PlacementTestModalProps) {
  const test = getPlacementTest(pairKey);
  const questions: PlacementQuestion[] = test?.questions || [];

  const [step, setStep] = useState<Step>("questions");
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
      setStep("questions");
      setQIndex(0);
      setAnswers([]);
      setManualLevel(null);
      setResult(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      await onComplete(level, "test", finalAnswers);
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
      await onComplete(manualLevel, "manual", []);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onComplete(0, "skip", []);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const question = questions[qIndex];
  const progress =
    step === "done" ? 100 : step === "manual" ? 50 : Math.round((qIndex / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {step === "questions" && question && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[#F5EFEB] flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#482C4E]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#4A4453]">Мини-тест на уровень</h2>
                    <p className="text-[11px] text-[#8A8493]">
                      Вопрос {qIndex + 1} из {questions.length}
                    </p>
                  </div>
                </div>
                {canClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-xl hover:bg-[#F5EFEB] text-[#8A8493] flex items-center justify-center"
                    title="Закрыть"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-[#F5EFEB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E0BBE4] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm font-medium text-[#4A4453] leading-relaxed pt-1">
                {question.text}
              </p>

              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    className="w-full p-3 rounded-2xl border border-[#E8E2D9] bg-white hover:border-[#E0BBE4] hover:bg-[#FDFAFD] active:scale-[0.99] transition-all text-left text-sm text-[#4A4453]"
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
                  Выбрать уровень вручную
                </Button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full text-[11px] text-[#8A8493] underline hover:text-[#4A4453] transition-colors"
                >
                  Пропустить тест
                </button>
              </div>
            </div>
          )}

          {step === "manual" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-[#F5EFEB] flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#482C4E]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[#4A4453]">Уровень владения</h2>
                </div>
                {canClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 rounded-xl hover:bg-[#F5EFEB] text-[#8A8493] flex items-center justify-center"
                    title="Закрыть"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#8A8493] leading-relaxed">
                Выберите свой текущий уровень от 0 до 10. По мере обучения уровень будет
                расти автоматически.
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
                        ? "border-[#E0BBE4] bg-[#FAF6FB] text-[#482C4E]"
                        : "border-[#E8E2D9] bg-white text-[#4A4453] hover:border-[#E0BBE4]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="text-center min-h-[32px]">
                {manualLevel !== null && (
                  <p className="text-xs text-[#8A8493]">
                    Уровень {manualLevel}/10 ·{" "}
                    <span className="font-medium text-[#4A4453]">
                      {proficiencyLabel(manualLevel)}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleManualSave}
                  disabled={manualLevel === null || isSaving}
                  className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
                >
                  <span>{isSaving ? "Сохраняем..." : "Сохранить уровень"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep("questions")}
                    className="w-full text-[11px] text-[#8A8493] underline hover:text-[#4A4453] transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Вернуться к тесту
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="space-y-4 text-center">
              <div className="h-14 w-14 rounded-3xl bg-[#C7E5C8] flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-[#2A472C]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#4A4453]">
                  {result.mode === "test" ? "Тест пройден!" : "Уровень сохранён!"}
                </h2>
                <p className="text-xs text-[#8A8493] mt-1">
                  {result.mode === "test"
                    ? `Правильных ответов: ${result.score} из ${result.total}`
                    : "Уровень выбран вручную"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6FB] border border-[#E0BBE4]">
                <p className="text-xs text-[#8A8493]">Ваш уровень владения</p>
                <p className="text-3xl font-bold text-[#482C4E] mt-1">
                  {result.level}
                  <span className="text-base font-medium text-[#8A8493]">/10</span>
                </p>
                <p className="text-sm font-medium text-[#4A4453] mt-0.5">
                  {proficiencyLabel(result.level)}
                </p>
              </div>

              <p className="text-xs text-[#8A8493] leading-relaxed">
                Мы подняли подходящие вам колоды наверх списка. Уровень будет расти
                автоматически по мере выученных слов, а тест можно пройти заново в любой момент.
              </p>

              <Button
                onClick={onClose}
                className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
                disabled={isSaving}
              >
                <span>{isSaving ? "Сохраняем..." : "Начать обучение"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
