"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, GraduationCap, ArrowRight } from "lucide-react";
import {
  getPlacementTest,
  scoreToLevel,
  proficiencyLabel,
  PlacementQuestion,
} from "@/lib/data/placement-tests";

interface PlacementTestModalProps {
  isOpen: boolean;
  pairKey: string;
  onComplete: (
    level: number,
    score: number,
    total: number,
    answers: number[]
  ) => Promise<void> | void;
  onClose: () => void;
  canClose?: boolean;
}

type Step = "questions" | "done";

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
  const [result, setResult] = useState<{ level: number; score: number; total: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("questions");
      setQIndex(0);
      setAnswers([]);
      setResult(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen || questions.length === 0) return null;

  const question = questions[qIndex];

  const finish = async (finalAnswers: number[]) => {
    setIsSaving(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) score++;
    });
    const level = scoreToLevel(score, questions.length);
    setResult({ level, score, total: questions.length });
    setStep("done");
    try {
      await onComplete(level, score, questions.length, finalAnswers);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (isSaving) return;
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();

    const finalAnswers = [...answers, optionIndex].slice(0, questions.length);
    finalAnswers[qIndex] = optionIndex;
    setAnswers(finalAnswers);

    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      finish(finalAnswers);
    }
  };

  const answeredCount = answers.filter((a) => a !== undefined).length;
  const progress = step === "done" ? 100 : Math.round((qIndex / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white rounded-3xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {step === "questions" ? (
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

              <p className="text-[11px] text-[#8A8493] text-center pt-1">
                Вопросы усложняются — это поможет точнее определить ваш уровень
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="h-14 w-14 rounded-3xl bg-[#C7E5C8] flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-[#2A472C]" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#4A4453]">Тест пройден!</h2>
                <p className="text-xs text-[#8A8493] mt-1">
                  Правильных ответов: {result?.score ?? 0} из {result?.total ?? questions.length}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF6FB] border border-[#E0BBE4]">
                <p className="text-xs text-[#8A8493]">Ваш уровень владения</p>
                <p className="text-3xl font-bold text-[#482C4E] mt-1">
                  {result?.level ?? 0}
                  <span className="text-base font-medium text-[#8A8493]">/10</span>
                </p>
                <p className="text-sm font-medium text-[#4A4453] mt-0.5">
                  {proficiencyLabel(result?.level ?? 0)}
                </p>
              </div>

              <p className="text-xs text-[#8A8493] leading-relaxed">
                Мы подняли подходящие вам колоды наверх списка. Уровень можно улучшить,
                пройдя тест заново в любой момент.
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
