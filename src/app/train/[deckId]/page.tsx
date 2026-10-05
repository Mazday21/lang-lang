"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  Send,
  Mic,
  Square,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { CardItem } from "@/lib/data/decks";
import { SM2Grade } from "@/lib/sm2";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { PaywallModal } from "@/components/paywall-modal";

type TrainingViewMode = "unanswered" | "voice_retry" | "manual_correction" | "evaluated";

/**
 * Normalizes answer string: trims, lowercases, removes punctuation and extra spaces
 */
function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"«»—–]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Checks answer strictly locally without LLM calls.
 * Supports multiple valid options separated by '/', ',', or ';'.
 */
function checkAnswerLocally(userInput: string, expectedAnswer: string): boolean {
  const normUser = normalizeAnswer(userInput);
  const normExpected = normalizeAnswer(expectedAnswer);

  if (!normUser || !normExpected) return false;

  if (normUser === normExpected) return true;

  // Split alternatives like "Salom / Assalomu alaykum"
  const alternatives = expectedAnswer
    .split(/[\/,;]+/)
    .map(normalizeAnswer)
    .filter(Boolean);

  return alternatives.includes(normUser);
}

export default function TrainPage({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.deckId;

  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [deckTitle, setDeckTitle] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("узбекский");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Card interaction state
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [viewMode, setViewMode] = useState<TrainingViewMode>("unanswered");
  const [voiceAttempts, setVoiceAttempts] = useState<number>(0);
  const [isCorrectResult, setIsCorrectResult] = useState<boolean>(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [reviewedCount, setReviewedCount] = useState<number>(0);

  // Soft paywall trigger (only used if AI limits hit during voice transcription)
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Audio recording hook (Gemini STT)
  const {
    isRecording,
    permissionDenied,
    error: micError,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // Native Telegram Back Button
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

  const loadDeckCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/decks/${deckId}/cards`, { headers });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Не удалось загрузить карточки");
      }

      setDeckTitle(data.deck?.title || "Колода");
      setTargetLanguage(data.deck?.target_language || "узбекский");
      // Enforce training session limit: max 20 cards per session
      setCards((data.cards || []).slice(0, 20));
      setCurrentIndex(0);
      setReviewedCount(0);
      setViewMode("unanswered");
      setVoiceAttempts(0);
      setIsCorrectResult(false);
      setUserAnswer("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки карточек";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, token]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadDeckCards();
    }
  }, [isAuthLoading, loadDeckCards]);

  const currentCard = cards[currentIndex];
  const isFinished = !isLoading && cards.length > 0 && currentIndex >= cards.length;

  /**
   * Fast local text check: ZERO LLM calls, ZERO limit consumed, instant response!
   */
  const handleCheckAnswer = (textToCheck?: string) => {
    const answer = (textToCheck !== undefined ? textToCheck : userAnswer).trim();
    if (!answer || !currentCard) return;

    const isMatch = checkAnswerLocally(answer, currentCard.back);
    setIsCorrectResult(isMatch);
    setViewMode("evaluated");

    // Haptic feedback in Telegram
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(
        isMatch ? "success" : "warning"
      );
    } catch {
      // ignore
    }
  };

  /**
   * Voice recording controls with Gemini STT and 2-attempt flow
   */
  const toggleRecording = async () => {
    // If 2 attempts already exhausted, microphone is locked
    if (!isRecording && voiceAttempts >= 2) return;

    if (isRecording) {
      setIsTranscribing(true);
      const audioBlob = await stopRecording();

      if (!audioBlob) {
        setIsTranscribing(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.webm");
        formData.append("targetLanguage", targetLanguage);
        if (currentCard?.back) {
          formData.append("prompt", currentCard.back);
        }

        const res = await fetch("/api/speech/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.limit_exceeded || res.status === 403) {
          setShowPaywall(true);
          return;
        }

        if (data.success && data.text) {
          const transcribed = data.text.trim();
          setUserAnswer(transcribed);

          const newAttemptCount = voiceAttempts + 1;
          setVoiceAttempts(newAttemptCount);

          // Local check of transcribed text
          const isMatch = checkAnswerLocally(transcribed, currentCard.back);

          if (isMatch) {
            // Success on voice -> proceed straight to SM-2
            setIsCorrectResult(true);
            setViewMode("evaluated");
            try {
              window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
            } catch {
              // ignore
            }
          } else {
            // Text did not match
            if (newAttemptCount === 1) {
              // Attempt 1 failed -> give exactly ONE retry voice attempt
              setIsCorrectResult(false);
              setViewMode("voice_retry");
            } else {
              // Attempt 2 failed -> lock mic, switch to manual correction mode
              setIsCorrectResult(false);
              setViewMode("manual_correction");
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            }
          }
        } else {
          setError("Не удалось распознать речь. Попробуйте напечатать ответ.");
        }
      } catch (sttErr) {
        console.error("Transcription error:", sttErr);
        setError("Ошибка распознавания речи. Введите ответ текстом.");
      } finally {
        setIsTranscribing(false);
      }
    } else {
      const started = await startRecording();
      if (started) {
        try {
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
        } catch {
          // ignore
        }
      }
    }
  };

  /**
   * Manual correction: check edited string locally
   */
  const handleVerifyEditedText = () => {
    handleCheckAnswer(userAnswer);
  };

  /**
   * Manual correction: user definitively accepts their answer as is
   */
  const handleConfirmAsMyAnswer = () => {
    setIsCorrectResult(false);
    setViewMode("evaluated");
  };

  /**
   * Grade submission for SM-2 interval repetition
   */
  const handleGrade = async (grade: SM2Grade) => {
    if (!currentCard || isSubmittingGrade) return;

    setIsSubmittingGrade(true);
    const cardId = currentCard.id;

    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(
        grade === 1 ? "rigid" : "light"
      );
    } catch {
      // ignore
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      fetch(`/api/cards/${cardId}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify({ grade }),
      }).catch((err) => console.error("Error saving SM-2:", err));

      // Advance to next card immediately
      setCurrentIndex((prev) => prev + 1);
      setReviewedCount((prev) => prev + 1);
      setViewMode("unanswered");
      setVoiceAttempts(0);
      setIsCorrectResult(false);
      setUserAnswer("");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#E0BBE4] animate-ping" />
          <p className="text-xs font-medium text-[#8A8493]">Загрузка карточек...</p>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </main>
    );
  }

  if (error && !currentCard) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <Card className="border-[#F7D6D0] bg-[#FFF8F7]">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-[#6B2E28]">Ошибка</p>
            <p className="text-xs text-[#8A8493]">{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <Card className="border-[#E8E2D9] bg-white p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[#2A472C] mx-auto opacity-70" />
          <h2 className="text-base font-semibold text-[#4A4453]">Карточки не найдены</h2>
          <p className="text-xs text-[#8A8493]">В этой колоде пока нет карточек для тренировки.</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Вернуться на главную
          </Button>
        </Card>
      </main>
    );
  }

  // Session Completed State
  if (isFinished) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 max-w-lg mx-auto flex flex-col justify-center gap-5">
        <Card className="border-[#E8E2D9] bg-white text-center p-8 space-y-4 rounded-2xl shadow-none">
          <div className="h-16 w-16 rounded-full bg-[#C7E5C8] mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#2A472C]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#4A4453]">Тренировка завершена!</h2>
            <p className="text-xs text-[#8A8493] leading-relaxed">
              Повторено карточек: {reviewedCount}. Все интервалы повторения пересчитаны по алгоритму SM-2.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full text-xs font-semibold"
              onClick={() => router.push("/")}
            >
              Вернуться в хаб
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={loadDeckCards}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Повторить ещё раз
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const progressPercent = Math.round(((currentIndex) / cards.length) * 100);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#4A4453] px-4 py-5 max-w-lg mx-auto flex flex-col gap-4">
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        token={token}
      />

      {/* Top Bar */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-xs text-[#8A8493] hover:text-[#4A4453] transition-colors -ml-1 p-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>В хаб</span>
          </button>
          <span className="text-xs font-medium text-[#8A8493]">
            {currentIndex + 1} из {cards.length}
          </span>
        </div>

        {/* Soft Progress Bar */}
        <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#C7E5C8] h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#8A8493] font-medium">
            Колода
          </p>
          <h1 className="text-base font-semibold text-[#4A4453] truncate">
            {deckTitle}
          </h1>
        </div>
      </header>

      {/* Main Flashcard */}
      <Card className="border-[#E8E2D9] bg-white rounded-2xl shadow-none">
        <CardContent className="p-6 space-y-4">
          {/* Question */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#8A8493] uppercase tracking-wider">
              Задание
            </span>
            <p className="text-xl font-medium text-[#4A4453] leading-snug">
              {currentCard.front}
            </p>
          </div>

          {/* Evaluated Result when revealed */}
          {viewMode === "evaluated" && (
            <div className="pt-3 border-t border-[#F5EFEB] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8493]">
                  Результат
                </span>
                {isCorrectResult ? (
                  <Badge variant="default" className="text-[11px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#2A472C]" />
                    Верно
                  </Badge>
                ) : (
                  <Badge variant="peach" className="text-[11px] font-medium flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-[#6B2E28]" />
                    Есть ошибка
                  </Badge>
                )}
              </div>

              {/* Expected answer */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-[#2A472C] uppercase tracking-wider">
                  Правильный ответ
                </span>
                <p className="text-lg font-semibold text-[#2A472C]">
                  {currentCard.back}
                </p>
              </div>

              {/* User answer if wrong */}
              {!isCorrectResult && userAnswer.trim() && (
                <div className="text-xs text-[#8A8493] pt-0.5">
                  Ваш ответ: <span className="text-[#6B2E28] font-medium line-through">{userAnswer}</span>
                </div>
              )}

              {/* Grammar rule explanation */}
              {currentCard.rule_description && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#482C4E]">
                    <Lightbulb className="h-3.5 w-3.5 text-[#E0BBE4]" />
                    <span>Грамматическое правило</span>
                  </div>
                  <p className="text-xs text-[#4A4453] leading-relaxed">
                    {currentCard.rule_description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Voice Attempt 1 Failed notice */}
          {viewMode === "voice_retry" && (
            <div className="pt-3 border-t border-[#F5EFEB] space-y-2.5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FFF8F7] border border-[#F7D6D0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B2E28]">
                  <AlertTriangle className="h-4 w-4 text-[#D9776E]" />
                  <span>Текст не совпал с карточкой</span>
                </div>
                <p className="text-xs text-[#4A4453] leading-relaxed">
                  Распознано: <span className="font-semibold text-[#6B2E28]">«{userAnswer}»</span>.
                  Возможно, микрофон срезал звук или была опечатка. Вы можете наговорить ответ еще раз.
                </p>
              </div>
            </div>
          )}

          {/* Voice Attempt 2 Failed notice -> Manual correction mode */}
          {viewMode === "manual_correction" && (
            <div className="pt-3 border-t border-[#F5EFEB] space-y-2.5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#482C4E]">
                  <AlertTriangle className="h-4 w-4 text-[#E0BBE4]" />
                  <span>Ручная корректировка (Микрофон заблокирован)</span>
                </div>
                <p className="text-xs text-[#8A8493] leading-relaxed">
                  Мы услышали: <span className="font-semibold text-[#4A4453]">«{userAnswer}»</span>.
                  Подправьте пару букв в поле ввода ниже или подтвердите ответ как есть.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mic error notice if any */}
      {(micError || permissionDenied) && (
        <div className="text-xs text-[#6B2E28] bg-[#FFF8F7] border border-[#F7D6D0] p-3 rounded-xl">
          {micError}
        </div>
      )}

      {/* Recording status pill */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 p-3 bg-[#FFF3F0] border border-[#F7D6D0] rounded-2xl animate-pulse">
          <div className="h-2.5 w-2.5 rounded-full bg-[#D9776E]" />
          <p className="text-xs font-medium text-[#6B2E28]">
            Идет запись голоса... Нажмите кнопку для остановки
          </p>
        </div>
      )}

      {/* Transcribing status */}
      {isTranscribing && (
        <div className="flex items-center justify-center gap-2 p-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl">
          <Loader2 className="h-3.5 w-3.5 text-[#E0BBE4] animate-spin" />
          <p className="text-xs font-medium text-[#8A8493]">
            Распознаем речь (Gemini)...
          </p>
        </div>
      )}

      {/* Interaction Area based on viewMode */}
      {viewMode === "unanswered" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckAnswer();
          }}
          className="space-y-3 mt-auto pt-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A8493] px-1">
              Ваш перевод или ответ:
            </label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите ответ на изучаемом языке..."
                autoFocus
                disabled={isRecording || isTranscribing}
                className="text-sm flex-1"
              />
              <Button
                type="button"
                variant={isRecording ? "softPeach" : "outline"}
                size="icon"
                disabled={isTranscribing || voiceAttempts >= 2}
                onClick={toggleRecording}
                className="shrink-0 h-12 w-12 rounded-2xl relative"
                title={
                  voiceAttempts >= 2
                    ? "Голосовые попытки исчерпаны"
                    : isRecording
                    ? "Остановить запись"
                    : "Голосовой ответ"
                }
              >
                {isRecording ? (
                  <Square className="h-4 w-4 text-[#6B2E28] fill-current" />
                ) : (
                  <Mic className={`h-4 w-4 ${voiceAttempts >= 2 ? "text-[#8A8493] opacity-40" : "text-[#4A4453]"}`} />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={!userAnswer.trim() || isRecording || isTranscribing}
            className="w-full text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>Проверить ответ</span>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* View Mode: Voice Attempt 1 Failed -> One retry allowed */}
      {viewMode === "voice_retry" && (
        <div className="space-y-2 mt-auto pt-2 animate-in fade-in duration-200">
          <Button
            type="button"
            variant={isRecording ? "softPeach" : "secondary"}
            size="lg"
            disabled={isTranscribing}
            onClick={toggleRecording}
            className={`w-full text-xs sm:text-sm font-semibold h-13 rounded-2xl flex items-center justify-center gap-2 ${
              isRecording
                ? "bg-[#FFF3F0] text-[#6B2E28] border border-[#F7D6D0]"
                : "bg-[#E0BBE4] text-[#482C4E]"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 text-[#6B2E28] fill-current" />
                <span>Остановить запись</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Попробовать сказать еще раз (1/1)</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRecording || isTranscribing}
            onClick={() => {
              setViewMode("manual_correction");
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full text-xs text-[#8A8493]"
          >
            Ввести ответ текстом
          </Button>
        </div>
      )}

      {/* View Mode: Voice Attempt 2 Failed -> Manual correction with pre-filled text */}
      {viewMode === "manual_correction" && (
        <div className="space-y-3 mt-auto pt-2 animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A8493] px-1">
              Отредактируйте распознанный текст:
            </label>
            <Input
              ref={inputRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Исправьте текст..."
              autoFocus
              className="text-sm w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={!userAnswer.trim()}
              onClick={handleVerifyEditedText}
              className="text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Проверить исправленный текст</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleConfirmAsMyAnswer}
              className="text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-1.5"
            >
              <span>Да, это мой ответ</span>
            </Button>
          </div>
        </div>
      )}

      {/* View Mode: Evaluated -> Show SM-2 4-button rating block */}
      {viewMode === "evaluated" && (
        <div className="space-y-2.5 mt-auto pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs font-medium text-center text-[#8A8493]">
            Оцените, насколько легко было вспомнить:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {/* Again (1) */}
            <Button
              type="button"
              variant="softPeach"
              disabled={isSubmittingGrade}
              onClick={() => handleGrade(1)}
              className="flex flex-col h-16 py-2 px-1 rounded-xl"
            >
              <span className="text-xs font-semibold">Снова</span>
              <span className="text-[10px] opacity-80 font-normal">Забыл</span>
            </Button>

            {/* Hard (2) */}
            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingGrade}
              onClick={() => handleGrade(2)}
              className="flex flex-col h-16 py-2 px-1 rounded-xl"
            >
              <span className="text-xs font-semibold">Трудно</span>
              <span className="text-[10px] text-[#8A8493] font-normal">С трудом</span>
            </Button>

            {/* Good (3) */}
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmittingGrade}
              onClick={() => handleGrade(3)}
              className="flex flex-col h-16 py-2 px-1 rounded-xl"
            >
              <span className="text-xs font-semibold">Хорошо</span>
              <span className="text-[10px] text-[#482C4E] opacity-80 font-normal">Нормально</span>
            </Button>

            {/* Easy (4) */}
            <Button
              type="button"
              variant="default"
              disabled={isSubmittingGrade}
              onClick={() => handleGrade(4)}
              className="flex flex-col h-16 py-2 px-1 rounded-xl"
            >
              <span className="text-xs font-semibold">Легко</span>
              <span className="text-[10px] text-[#2A472C] opacity-80 font-normal">Сразу</span>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
