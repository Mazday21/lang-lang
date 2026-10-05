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
  RotateCcw,
  Lightbulb,
  Send,
  Mic,
  Square,
  Sparkles,
  Edit3,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { CardItem } from "@/lib/data/decks";
import { SM2Grade } from "@/lib/sm2";
import { AICheckResult } from "@/lib/ai/checker";
import { DynamicContextResult } from "@/lib/ai/generator";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { PaywallModal } from "@/components/paywall-modal";

export default function TrainPage({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.deckId;

  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [deckTitle, setDeckTitle] = useState<string>("");
  const [isDeckDynamic, setIsDeckDynamic] = useState<boolean>(true);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic context generation state
  const [dynamicContext, setDynamicContext] = useState<DynamicContextResult | null>(null);
  const [isGeneratingContext, setIsGeneratingContext] = useState<boolean>(false);

  // Card interaction state
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isVoiceInput, setIsVoiceInput] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AICheckResult | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [reviewedCount, setReviewedCount] = useState<number>(0);

  // Soft paywall trigger
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Audio recording hook
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
      setIsDeckDynamic(data.deck?.is_dynamic ?? true);
      setCards(data.cards || []);
      setCurrentIndex(0);
      setReviewedCount(0);
      setIsRevealed(false);
      setAiResult(null);
      setDynamicContext(null);
      setUserAnswer("");
      setIsVoiceInput(false);
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
   * Fetches dynamic context for the active card if deck is dynamic
   */
  const fetchDynamicContextForCard = useCallback(async (card: CardItem) => {
    if (!isDeckDynamic) {
      setDynamicContext(null);
      return;
    }

    setIsGeneratingContext(true);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/generate-context", {
        method: "POST",
        headers,
        body: JSON.stringify({
          front: card.front,
          back: card.back,
          rule_description: card.rule_description,
          deck_title: deckTitle,
        }),
      });

      const data = await res.json();
      if (data.limit_exceeded || res.status === 403) {
        setShowPaywall(true);
        return;
      }

      if (data.success && data.result) {
        setDynamicContext(data.result);
      } else {
        setDynamicContext(null);
      }
    } catch (err) {
      console.warn("Failed to generate dynamic context:", err);
      setDynamicContext(null);
    } finally {
      setIsGeneratingContext(false);
    }
  }, [isDeckDynamic, token, deckTitle]);

  // Trigger dynamic generation when card index changes
  useEffect(() => {
    if (currentCard && !isFinished) {
      fetchDynamicContextForCard(currentCard);
    }
  }, [currentCard, isFinished, fetchDynamicContextForCard]);

  /**
   * Submits user answer for AI verification (OpenRouter)
   */
  const handleCheckAnswer = async (textToCheck?: string, voiceUsed = false) => {
    const answer = (textToCheck !== undefined ? textToCheck : userAnswer).trim();
    if (!answer || !currentCard || isChecking) return;

    setIsChecking(true);
    setError(null);

    const targetFront = dynamicContext?.sentence_with_blank || currentCard.front;
    const targetBack = dynamicContext?.expected_answer || currentCard.back;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/check", {
        method: "POST",
        headers,
        body: JSON.stringify({
          front: targetFront,
          back: targetBack,
          rule_description: currentCard.rule_description,
          user_input: answer,
          is_voice: voiceUsed || isVoiceInput,
        }),
      });

      const data = await res.json();

      if (data.limit_exceeded || res.status === 403) {
        setShowPaywall(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Не удалось проверить ответ");
      }

      setAiResult(data.result);
      setIsRevealed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка при проверке";
      console.warn("AI Check error:", msg);
      // Fallback: reveal static answer without blocking
      setAiResult({
        is_correct: answer.toLowerCase() === targetBack.toLowerCase(),
        explanation: currentCard.rule_description || `Правильный ответ: ${targetBack}`,
        highlight_error: "",
        stt_suspicious: false,
      });
      setIsRevealed(true);
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Voice recording controls: click to start or stop
   */
  const toggleRecording = async () => {
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
        const expected = dynamicContext?.expected_answer || currentCard?.back || "";
        if (expected) {
          formData.append("prompt", expected);
        }

        const res = await fetch("/api/speech/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.text) {
          const transcribed = data.text.trim();
          setUserAnswer(transcribed);
          setIsVoiceInput(true);
          await handleCheckAnswer(transcribed, true);
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
        setIsVoiceInput(true);
        try {
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
        } catch {
          // ignore
        }
      }
    }
  };

  /**
   * Soft Fallback Action 1: Re-record voice
   */
  const handleRetryVoice = async () => {
    setIsRevealed(false);
    setAiResult(null);
    setUserAnswer("");
    setIsVoiceInput(true);
    await startRecording();
  };

  /**
   * Soft Fallback Action 2: Edit transcribed text manually
   */
  const handleEditByText = () => {
    setIsRevealed(false);
    setAiResult(null);
    setIsVoiceInput(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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

      // Advance to next card
      setCurrentIndex((prev) => prev + 1);
      setReviewedCount((prev) => prev + 1);
      setIsRevealed(false);
      setAiResult(null);
      setDynamicContext(null);
      setUserAnswer("");
      setIsVoiceInput(false);
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

  // Soft fallback trigger
  const isSoftFallback = Boolean(
    isRevealed &&
    aiResult &&
    !aiResult.is_correct &&
    aiResult.stt_suspicious &&
    isVoiceInput
  );

  const displayQuestion = dynamicContext?.sentence_with_blank || currentCard.front;
  const displayContextTranslation = dynamicContext?.translation;
  const expectedAnswer = dynamicContext?.expected_answer || currentCard.back;

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

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8A8493] font-medium">
              Колода
            </p>
            <h1 className="text-base font-semibold text-[#4A4453] truncate">
              {deckTitle}
            </h1>
          </div>
          {isDeckDynamic && (
            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 font-normal flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#482C4E]" />
              Динамический ИИ
            </Badge>
          )}
        </div>
      </header>

      {/* Main Flashcard */}
      <Card className="border-[#E8E2D9] bg-white rounded-2xl shadow-none">
        <CardContent className="p-6 space-y-4">
          {/* Question / Dynamic context */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-[#8A8493] uppercase tracking-wider">
              {dynamicContext ? "Заполните пропуск в предложении" : "Задание"}
            </span>

            {isGeneratingContext ? (
              <div className="space-y-2 py-1">
                <Skeleton className="h-7 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-1/2 rounded-xl" />
                <p className="text-[11px] text-[#8A8493] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#E0BBE4] animate-spin" />
                  Нейросеть генерирует контекстный пример...
                </p>
              </div>
            ) : (
              <>
                <p className="text-xl font-medium text-[#4A4453] leading-snug">
                  {displayQuestion}
                </p>
                {displayContextTranslation && (
                  <p className="text-xs text-[#8A8493] italic">
                    Контекст: «{displayContextTranslation}»
                  </p>
                )}
              </>
            )}
          </div>

          {/* AI Verification Results when revealed */}
          {isRevealed && aiResult && (
            <div className="pt-3 border-t border-[#F5EFEB] space-y-3 animate-in fade-in duration-200">
              {/* Case A: Soft Fallback */}
              {isSoftFallback ? (
                <div className="p-4 rounded-2xl bg-[#FFF8F7] border border-[#F7D6D0] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6B2E28]">
                    <AlertTriangle className="h-4 w-4 text-[#D9776E]" />
                    <span>Мы не расслышали окончание</span>
                  </div>
                  <p className="text-xs text-[#4A4453] leading-relaxed">
                    Распознано: <span className="font-semibold text-[#6B2E28]">«{userAnswer}»</span>.
                    Похоже, микрофон срезал звук или фоновый шум помешал распознаванию. Прогресс карточки не пострадал.
                  </p>
                </div>
              ) : (
                /* Case B: Regular AI Feedback */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8493]">
                      Вердикт репетитора
                    </span>
                    {aiResult.is_correct ? (
                      <Badge variant="default" className="text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[#2A472C]" />
                        Верно
                      </Badge>
                    ) : (
                      <Badge variant="peach" className="text-[11px] font-medium">
                        Есть ошибка
                      </Badge>
                    )}
                  </div>

                  {/* AI Explanation */}
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#482C4E]">
                      <Sparkles className="h-3.5 w-3.5 text-[#E0BBE4]" />
                      <span>Разбор ответа</span>
                    </div>
                    <p className="text-xs text-[#4A4453] leading-relaxed">
                      {aiResult.explanation}
                    </p>
                    {aiResult.highlight_error && (
                      <p className="text-xs text-[#6B2E28] pt-1">
                        Неточность: <span className="font-mono bg-[#F7D6D0] px-1 py-0.5 rounded text-[11px]">{aiResult.highlight_error}</span>
                      </p>
                    )}
                  </div>

                  {/* Expected answer & rule */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[#2A472C] uppercase tracking-wider">
                      Ожидаемый ответ
                    </span>
                    <p className="text-base font-semibold text-[#2A472C]">
                      {expectedAnswer}
                    </p>
                  </div>

                  {currentCard.rule_description && (
                    <div className="text-xs text-[#8A8493] flex items-start gap-1.5 pt-0.5">
                      <Lightbulb className="h-3.5 w-3.5 text-[#E0BBE4] shrink-0 mt-0.5" />
                      <span>{currentCard.rule_description}</span>
                    </div>
                  )}

                  {userAnswer.trim() && (
                    <div className="text-xs text-[#8A8493] pt-0.5">
                      Ваш ввод: <span className="text-[#4A4453] font-medium">{userAnswer}</span>
                    </div>
                  )}
                </div>
              )}
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
            Распознаем речь (Whisper)...
          </p>
        </div>
      )}

      {/* Checking status */}
      {isChecking && (
        <div className="flex items-center justify-center gap-2 p-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl">
          <Loader2 className="h-3.5 w-3.5 text-[#E0BBE4] animate-spin" />
          <p className="text-xs font-medium text-[#8A8493]">
            ИИ-репетитор проверяет ответ...
          </p>
        </div>
      )}

      {/* Interaction Area */}
      {!isRevealed ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckAnswer();
          }}
          className="space-y-3 mt-auto pt-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8A8493] px-1">
              Ваш ответ:
            </label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setIsVoiceInput(false);
                }}
                placeholder="Вставьте пропущенное слово / суффикс..."
                autoFocus
                disabled={isChecking || isRecording || isTranscribing || isGeneratingContext}
                className="text-sm flex-1"
              />
              <Button
                type="button"
                variant={isRecording ? "softPeach" : "outline"}
                size="icon"
                disabled={isChecking || isTranscribing || isGeneratingContext}
                onClick={toggleRecording}
                className="shrink-0 h-12 w-12 rounded-2xl relative"
                title={isRecording ? "Остановить запись" : "Голосовой ответ"}
              >
                {isRecording ? (
                  <Square className="h-4 w-4 text-[#6B2E28] fill-current" />
                ) : (
                  <Mic className="h-4 w-4 text-[#4A4453]" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={!userAnswer.trim() || isChecking || isRecording || isTranscribing || isGeneratingContext}
            className="w-full text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Проверяем...</span>
              </>
            ) : (
              <>
                <span>Проверить ответ</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      ) : isSoftFallback ? (
        /* Soft Fallback Actions (No SM-2 penalty!) */
        <div className="space-y-2 mt-auto pt-2 animate-in fade-in duration-200">
          <p className="text-xs text-center text-[#8A8493] font-medium">
            Выберите удобный способ повторить:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRetryVoice}
              className="text-xs font-semibold h-12 flex items-center justify-center gap-1.5"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Повторить голосом</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditByText}
              className="text-xs font-semibold h-12 flex items-center justify-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Исправить текстом</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Standard SM-2 4-button Rating block */
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
