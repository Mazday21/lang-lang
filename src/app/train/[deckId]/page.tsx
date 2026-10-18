"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, Lightbulb, Eye, HelpCircle } from "lucide-react";
import { CardItem } from "@/lib/data/decks";
import { SM2Grade } from "@/lib/sm2";
import { isLocalDeckId, getLocalDeck, gradeLocalCard } from "@/lib/local-decks";

/**
 * Training: classic flashcard flip.
 * 1) The card shows a word/phrase and a «Проверить» button.
 * 2) Tap → the translation (and rule) is revealed.
 * 3) Self-assessment buttons grade the recall for SM-2 (1..4).
 * No AI, no voice, no typing — the whole flow is offline-fast.
 */
export default function TrainPage({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.deckId;

  const router = useRouter();
  const { token, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();

  const [deckTitle, setDeckTitle] = useState<string>("");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Card interaction state
  const [revealed, setRevealed] = useState<boolean>(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [reviewedCount, setReviewedCount] = useState<number>(0);

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

      // Manually created decks are stored on this device (localStorage)
      if (isLocalDeckId(deckId)) {
        const localDeck = getLocalDeck(deckId);
        if (!localDeck) {
          throw new Error(t("Колода не найдена"));
        }
        setDeckTitle(localDeck.title);
        setCards(
          localDeck.cards.slice(0, 20).map((c) => ({ ...c, deck_id: localDeck.id }))
        );
        setCurrentIndex(0);
        setReviewedCount(0);
        setRevealed(false);
        return;
      }

      const isTodayDeck = deckId === "today";
      const res = await fetch(
        isTodayDeck ? "/api/decks/today" : `/api/decks/${deckId}/cards`,
        { headers }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t("Не удалось загрузить карточки"));
      }

      setDeckTitle(data.deck?.title || t("Колода"));
      // Enforce training session limit: max 20 cards per session
      setCards((data.cards || []).slice(0, 20));
      setCurrentIndex(0);
      setReviewedCount(0);
      setRevealed(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Ошибка загрузки карточек");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, token, t]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadDeckCards();
    }
  }, [isAuthLoading, loadDeckCards]);

  const currentCard = cards[currentIndex];
  const isFinished = !isLoading && cards.length > 0 && currentIndex >= cards.length;

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

      // Manually created decks: SM-2 progress stays on this device
      if (isLocalDeckId(deckId)) {
        gradeLocalCard(deckId, cardId, grade);
      } else {
        fetch(`/api/cards/${cardId}/review`, {
          method: "POST",
          headers,
          body: JSON.stringify({ grade }),
        }).catch((err) => console.error("Error saving SM-2:", err));
      }

      // Advance to next card immediately
      setCurrentIndex((prev) => prev + 1);
      setReviewedCount((prev) => prev + 1);
      setRevealed(false);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F4EFFE] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#B7A0F6] animate-ping" />
          <p className="text-xs font-medium text-[#7B6FA6]">{t("Загрузка карточек...")}</p>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </main>
    );
  }

  if (error && !currentCard) {
    return (
      <main className="min-h-screen bg-[#F4EFFE] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <Card className="border-[#F9D7DD] bg-[#FFF1F3]">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-[#A63A4B]">{t("Ошибка")}</p>
            <p className="text-xs text-[#7B6FA6]">{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              {t("Вернуться на главную")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-[#F4EFFE] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <Card className="border-[#DCD0F5] bg-white p-6 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[#1D6B5B] mx-auto opacity-70" />
          <h2 className="text-base font-semibold text-[#2A2352]">{t("Карточки не найдены")}</h2>
          <p className="text-xs text-[#7B6FA6]">{t("В этой колоде пока нет карточек для тренировки.")}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            {t("Вернуться на главную")}
          </Button>
        </Card>
      </main>
    );
  }

  // Session Completed State
  if (isFinished) {
    return (
      <main className="min-h-screen bg-[#F4EFFE] p-6 max-w-lg mx-auto flex flex-col justify-center gap-5">
        <Card className="border-[#DCD0F5] bg-white text-center p-8 space-y-4 rounded-2xl shadow-none">
          <div className="h-16 w-16 rounded-full bg-[#B9EBDD] mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#1D6B5B]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#2A2352]">{t("Тренировка завершена!")}</h2>
            <p className="text-xs text-[#7B6FA6] leading-relaxed">
              {t("Повторено карточек: {n}. Все интервалы повторения пересчитаны по алгоритму SM-2.", { n: reviewedCount })}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full text-xs font-semibold"
              onClick={() => router.push("/")}
            >
              {t("Вернуться в хаб")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={loadDeckCards}
            >
              {t("Пройти ещё раз")}
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const progressPercent = Math.round((currentIndex / cards.length) * 100);

  return (
    <main className="min-h-screen bg-[#F4EFFE] text-[#2A2352] px-4 py-5 max-w-lg mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-xs text-[#7B6FA6] hover:text-[#2A2352] transition-colors -ml-1 p-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("В хаб")}</span>
        </button>
        <div className="text-xs text-[#7B6FA6] font-medium">
          {t("{i} из {n}", { i: currentIndex + 1, n: cards.length })}
        </div>
      </div>

      {/* Deck title */}
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
          {t("КОЛОДА")}
        </p>
        <h1 className="text-lg font-semibold text-[#2A2352] leading-snug">{t(deckTitle)}</h1>
      </div>

      {/* Progress */}
      <div className="h-1.5 w-full bg-[#DCD0F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#B7A0F6] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard */}
      <Card className="border-[#DCD0F5] bg-white shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7B6FA6] flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-[#B7A0F6] shrink-0" />
              {t("Какой перевод?")}
            </p>
            <p className="text-2xl font-semibold text-[#2A2352] leading-snug break-words">
              {currentCard.front}
            </p>
          </div>

          {!revealed ? (
            <Button
              onClick={() => {
                setRevealed(true);
                try {
                  window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
                } catch {
                  // ignore
                }
              }}
              className="w-full text-sm font-semibold h-12 rounded-2xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("Проверить")}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Answer */}
              <div className="p-4 rounded-2xl bg-[#F0EAFB] border border-[#DCD0F5] space-y-2">
                <p className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
                  {t("Перевод")}
                </p>
                <p className="text-xl font-semibold text-[#2A2352] leading-snug">
                  {currentCard.back}
                </p>
                {currentCard.rule_description && (
                  <div className="pt-2 border-t border-[#DCD0F5] space-y-1">
                    <p className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {t("Грамматическое правило")}
                    </p>
                    <p className="text-xs text-[#7B6FA6] leading-relaxed">
                      {currentCard.rule_description}
                    </p>
                  </div>
                )}
              </div>

              {/* Self-assessment */}
              <div className="space-y-2">
                <p className="text-xs text-[#7B6FA6] text-center">
                  {t("Оцените, насколько легко было вспомнить:")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    disabled={isSubmittingGrade}
                    onClick={() => handleGrade(1)}
                    className="h-12 rounded-2xl text-xs font-semibold border-[#F9D7DD] bg-[#FFF1F3] text-[#A63A4B] hover:bg-[#F9D7DD]"
                  >
                    {t("Не помню")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isSubmittingGrade}
                    onClick={() => handleGrade(2)}
                    className="h-12 rounded-2xl text-xs font-semibold"
                  >
                    {t("С трудом")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isSubmittingGrade}
                    onClick={() => handleGrade(3)}
                    className="h-12 rounded-2xl text-xs font-semibold"
                  >
                    {t("Нормально")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isSubmittingGrade}
                    onClick={() => handleGrade(4)}
                    className="h-12 rounded-2xl text-xs font-semibold border-[#B9EBDD] bg-[#E3F7EF] text-[#1D6B5B] hover:bg-[#B9EBDD]"
                  >
                    {t("Легко")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card navigation hint */}
      <p className="text-[11px] text-[#7B6FA6] text-center">
        {revealed
          ? t("Оцените запоминание — и следующая карточка появится автоматически")
          : t("Вспомните перевод, затем нажмите «Проверить»")}
      </p>
    </main>
  );
}
