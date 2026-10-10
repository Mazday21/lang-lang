"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Terminal,
  CheckCircle2,
  Settings,
  Zap,
  Trash2,
  Plus,
  ChevronDown,
  Gauge,
} from "lucide-react";
import { DeckItem } from "@/lib/data/decks";
import { UserLimitStatus } from "@/lib/limits";
import { UserProgress, DAILY_REVIEW_LIMIT } from "@/lib/data/user-progress";
import { proficiencyLabel } from "@/lib/data/placement-tests";
import { CreateDeckModal } from "@/components/create-deck-modal";
import { PaywallModal } from "@/components/paywall-modal";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { LanguageSwitcherModal } from "@/components/language-switcher-modal";
import { PlacementTestModal, PlacementMode } from "@/components/placement-test-modal";

export default function HubPage() {
  const router = useRouter();
  const {
    user,
    token,
    isLoading: isAuthLoading,
    isTelegram,
    isDevMock,
    loginWithDevMock,
    setLanguages,
  } = useAuth();

  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [limits, setLimits] = useState<UserLimitStatus | null>(null);
  const [isLoadingDecks, setIsLoadingDecks] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);

  // Proficiency level (0..10) + placement test
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);

  // Helper to normalize language code (strictly turns "gb" into "en")
  const cleanCode = (code?: string | null, fallback = "ru") => {
    if (!code) return fallback;
    const c = code.toLowerCase().trim();
    if (c === "gb") return "en";
    return c;
  };

  // Active language pair
  const nativeLang = cleanCode(user?.native_language, "ru");
  const targetLang = cleanCode(user?.target_language, "uz");
  const currentPairKey = `${nativeLang}-${targetLang}`;

  const pairLabel = `${nativeLang.toUpperCase()} ➔ ${targetLang.toUpperCase()}`;

  // Deck difficulty levels
  const LEVEL_NAMES: Record<number, string> = {
    1: "Новичок",
    2: "Базовый",
    3: "Средний",
    4: "Продвинутый",
    5: "Эксперт",
  };
  const levelName = (level: number) => LEVEL_NAMES[level] || "Эксперт";

  // Proficiency (0..10) → recommended deck difficulty (1..5)
  const proficiency = progress?.proficiency_level ?? 0;
  const recommendedLevel = Math.min(5, Math.floor(proficiency / 2) + 1);

  // Group decks by difficulty level, recommended groups first
  const decksByLevel = [...decks]
    .sort((a, b) => (a.level || 1) - (b.level || 1))
    .reduce<Record<number, DeckItem[]>>((acc, deck) => {
      const lvl = deck.level || 1;
      if (!acc[lvl]) acc[lvl] = [];
      acc[lvl].push(deck);
      return acc;
    }, {});
  const levelGroups = Object.keys(decksByLevel)
    .map(Number)
    .sort(
      (a, b) =>
        Math.abs(a - recommendedLevel) - Math.abs(b - recommendedLevel) || a - b
    );

  const fetchDecksAndLimits = useCallback(
    async (overrideNative?: string, overrideTarget?: string) => {
      setIsLoadingDecks(true);
      setError(null);
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const nat = cleanCode(overrideNative || user?.native_language, "ru");
        const tar = cleanCode(overrideTarget || user?.target_language, "uz");
        const pair = `${nat}-${tar}`.toLowerCase();

        const [decksRes, limitsRes, progressRes] = await Promise.all([
          fetch(`/api/decks?pair=${pair}`, { headers }),
          fetch("/api/user/limits", { headers }),
          fetch("/api/user/progress", { headers }),
        ]);

        const decksData = await decksRes.json();

        if (decksData.success) {
          setDecks(decksData.decks || []);
        }

        const limitsData = await limitsRes.json();
        if (limitsData.success) {
          setLimits(limitsData);
        }

        const progressData = await progressRes.json().catch(() => null);
        if (progressData?.success) {
          setProgress({
            proficiency_level: progressData.proficiency_level ?? 0,
            base_level: progressData.base_level ?? 0,
            placement_tested: Boolean(progressData.placement_tested),
            learned_points: progressData.learned_points ?? 0,
            mastered_cards: progressData.mastered_cards ?? 0,
            reviewed_today: progressData.reviewed_today ?? 0,
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ошибка загрузки";
        setError(msg);
      } finally {
        setIsLoadingDecks(false);
      }
    },
    [token, user?.native_language, user?.target_language]
  );

  useEffect(() => {
    if (!isAuthLoading) {
      fetchDecksAndLimits();
    }
  }, [isAuthLoading, fetchDecksAndLimits]);

  // Background content pipeline: fills shared curriculum + personal top-up decks.
  // Runs at most once per language pair per session; never blocks the UI.
  const populatedPairRef = useRef<string | null>(null);
  useEffect(() => {
    if (isAuthLoading || !user || !token) return;

    const nat = user.native_language || "ru";
    const tar = user.target_language || "uz";
    const pairKey = `${nat}-${tar}`;
    if (!nat || !tar || populatedPairRef.current === pairKey) return;
    populatedPairRef.current = pairKey;

    (async () => {
      try {
        const res = await fetch("/api/decks/auto-populate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ native: nat, target: tar }),
        });
        const data = await res.json().catch(() => null);
        const createdAny =
          (data?.shared?.created ?? 0) > 0 || data?.personal?.created === true;
        if (res.ok && data?.success && createdAny) {
          // Silently refresh the list so new decks appear
          fetchDecksAndLimits(nat, tar);
        }
      } catch {
        // Background enrichment must never break the hub
      }
    })();
  }, [isAuthLoading, user, token, fetchDecksAndLimits]);

  const handleCompleteOnboarding = async (native: string, target: string) => {
    await setLanguages(native, target);
    await fetchDecksAndLimits(native, target);
  };

  const handleSwitchLanguagePair = async (newNative: string, newTarget: string) => {
    await setLanguages(newNative, newTarget);
    await fetchDecksAndLimits(newNative, newTarget);
  };

  // Saves placement result (test / manual / skip); the server re-scores the answers
  // and grows the level dynamically from study results afterwards.
  const handlePlacementComplete = async (
    level: number,
    mode: PlacementMode,
    answers: number[]
  ) => {
    // Optimistic update so the modal closes smoothly
    setProgress((prev) => ({
      proficiency_level: Math.max(prev?.proficiency_level ?? 0, level),
      base_level: mode === "skip" ? prev?.base_level ?? 0 : level,
      placement_tested: true,
      learned_points: prev?.learned_points ?? 0,
      mastered_cards: prev?.mastered_cards ?? 0,
      reviewed_today: prev?.reviewed_today ?? 0,
    }));
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body =
        mode === "test"
          ? { pair: currentPairKey, answers }
          : mode === "manual"
          ? { level }
          : { skip: true };
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setProgress({
          proficiency_level: data.proficiency_level ?? level,
          base_level: data.base_level ?? level,
          placement_tested: Boolean(data.placement_tested),
          learned_points: data.learned_points ?? 0,
          mastered_cards: data.mastered_cards ?? 0,
          reviewed_today: data.reviewed_today ?? 0,
        });
      }
    } catch {
      // Keep the optimistic value on network errors
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      setDecks((prev) => prev.filter((d) => d.id !== deckId));

      await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
        headers,
      });
    } catch (err) {
      console.error("Failed to delete deck:", err);
      fetchDecksAndLimits();
    }
  };

  const totalDue = decks.reduce((acc, d) => acc + d.due_cards, 0);

  // Daily review plan: a motivating, non-scary number; the backlog calmly waits its turn
  const remainingToday = Math.min(
    totalDue,
    Math.max(0, DAILY_REVIEW_LIMIT - (progress?.reviewed_today ?? 0))
  );

  // Russian plural form for "карточка"
  const cardsWord = (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "карточка";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "карточки";
    return "карточек";
  };

  // Check if first-time onboarding should be displayed
  const needsOnboarding = Boolean(
    !isAuthLoading &&
    user &&
    (!user.native_language || !user.target_language)
  );

  // New users without a proficiency level take the placement mini-test first
  const needsPlacement = Boolean(
    user && !isAuthLoading && !needsOnboarding && progress && !progress.placement_tested
  );

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 max-w-lg mx-auto flex flex-col justify-center gap-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#C7E5C8] animate-ping" />
          <p className="text-xs font-medium text-[#8A8493]">Загрузка профиля...</p>
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </main>
    );
  }

  // First-time onboarding screen
  if (needsOnboarding) {
    return <OnboardingWizard onComplete={handleCompleteOnboarding} />;
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#4A4453] px-4 py-6 md:py-10 max-w-lg mx-auto flex flex-col gap-5">
      {/* Placement Mini-Test Modal */}
      <PlacementTestModal
        isOpen={isTestOpen || needsPlacement}
        pairKey={currentPairKey}
        onComplete={handlePlacementComplete}
        onClose={() => setIsTestOpen(false)}
        canClose={!needsPlacement || isTestOpen}
      />

      {/* Language Switcher Modal */}
      <LanguageSwitcherModal
        isOpen={isLanguageSwitcherOpen}
        onClose={() => setIsLanguageSwitcherOpen(false)}
        currentNative={nativeLang}
        currentTarget={targetLang}
        onSave={handleSwitchLanguagePair}
      />

      {/* Create Deck AI Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        token={token}
        onLimitExceeded={() => setIsPaywallOpen(true)}
        nativeLang={nativeLang}
        targetLang={targetLang}
      />

      {/* Soft Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        token={token}
      />

      {/* Calm Header with Language Pair Badge */}
      <header className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
        <div>
          <p className="text-xs font-medium text-[#8A8493] tracking-wide uppercase">
            Тренажер языков • SM-2
          </p>
          <h1 className="text-xl font-semibold text-[#4A4453] mt-0.5">
            {user?.first_name ? `Привет, ${user.first_name}` : "Личный тренажер"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Pair Selector Button */}
          <button
            onClick={() => setIsLanguageSwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D9] hover:border-[#E0BBE4] active:scale-95 text-xs font-semibold text-[#4A4453] transition-all shadow-none whitespace-nowrap shrink-0"
            style={{ whiteSpace: "nowrap" }}
            title="Сменить язык обучения"
          >
            <span className="whitespace-nowrap font-bold tracking-wide">{pairLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#8A8493] shrink-0" />
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
            className="h-9 w-9 rounded-xl hover:bg-[#F5EFEB] text-[#8A8493]"
            title="Настройки"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Dev Mode prompt if outside Telegram and not authed */}
      {!isTelegram && !user && (
        <Card className="border-[#E8E2D9] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#8A8493]" />
              Локальная разработка
            </CardTitle>
            <CardDescription className="text-xs">
              Запустите тестовую сессию для эмуляции пользователя.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={loginWithDevMock}
              variant="secondary"
              size="sm"
              className="w-full text-xs"
            >
              Включить Dev-пользователя
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Overview Banner */}
      <Card className="border-[#E8E2D9] bg-white shadow-none">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[#8A8493] font-medium">Повторение на сегодня</p>
            <p className="text-2xl font-semibold text-[#4A4453]">
              {isLoadingDecks
                ? "..."
                : remainingToday > 0
                ? `${remainingToday} ${cardsWord(remainingToday)}`
                : totalDue > 0
                ? "План выполнен!"
                : "Всё повторено!"}
            </p>
            {!isLoadingDecks && totalDue > 0 && (
              <p className="text-[11px] text-[#8A8493]">
                {remainingToday > 0
                  ? `Ещё ${totalDue - remainingToday} можно повторить позже`
                  : `Ещё ${totalDue} ${cardsWord(totalDue)} — повторите позже или завтра`}
              </p>
            )}
            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <span className="text-xs text-[#8A8493] flex items-center gap-1 whitespace-nowrap">
                <Gauge className="h-3 w-3 text-[#E0BBE4]" />
                Уровень владения:{" "}
                {progress
                  ? `${progress.proficiency_level}/10 · ${proficiencyLabel(progress.proficiency_level)}`
                  : "—"}
                {progress && progress.proficiency_level > progress.base_level && (
                  <span className="text-[#2A472C]">
                    {" "}
                    (+{progress.proficiency_level - progress.base_level} за обучение)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsTestOpen(true)}
                className="text-[11px] text-[#8A8493] underline hover:text-[#4A4453] transition-colors"
              >
                {progress?.placement_tested ? "Пройти заново" : "Пройти тест"}
              </button>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#F5EFEB] flex items-center justify-center text-[#482C4E]">
            <Sparkles className="h-6 w-6 text-[#E0BBE4]" />
          </div>
        </CardContent>
      </Card>

      {/* AI Deck Builder Action Button */}
      <Button
        variant="secondary"
        size="lg"
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full text-sm font-semibold h-14 rounded-2xl shadow-none flex items-center justify-center gap-2 bg-[#E0BBE4] text-[#482C4E] hover:bg-[#D7AEDC]"
      >
        <Sparkles className="h-4 w-4" />
        <span>Сгенерировать колоду с помощью AI</span>
      </Button>

      {/* Decks Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[#4A4453]">
            Колоды для изучения ({pairLabel})
          </h2>
          <button
            onClick={() => fetchDecksAndLimits()}
            disabled={isLoadingDecks}
            className="text-xs text-[#8A8493] hover:text-[#4A4453] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingDecks ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>

        {error && (
          <Card className="border-[#F7D6D0] bg-[#FFF8F7]">
            <CardContent className="p-4 text-xs text-[#6B2E28]">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDecksAndLimits()}
                className="mt-2 block w-full text-xs"
              >
                Повторить попытку
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoadingDecks ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : decks.length === 0 ? (
          /* Empty State */
          <Card className="border-[#E8E2D9] bg-white p-8 text-center rounded-3xl shadow-none space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-[#E0BBE4]/30 mx-auto flex items-center justify-center text-[#482C4E]">
              <Sparkles className="h-8 w-8 text-[#482C4E]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-[#4A4453]">
                У вас пока нет колод для этой языковой пары
              </h3>
              <p className="text-xs text-[#8A8493] leading-relaxed max-w-xs mx-auto">
                Давайте создадим первую с помощью ИИ! Назовите любую тему — от приветствий до покупок.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full text-xs font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Создать колоду ({pairLabel})</span>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {levelGroups.map((level) => (
              <div key={level} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#8A8493] uppercase tracking-wider whitespace-nowrap">
                    Уровень {level} · {levelName(level)}
                  </span>
                  {level === recommendedLevel && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 font-normal text-[#2A472C] border-[#C7E5C8] bg-[#F2FAF3] whitespace-nowrap"
                    >
                      Рекомендуем
                    </Badge>
                  )}
                  <div className="flex-1 h-px bg-[#E8E2D9]" />
                  <span className="text-[11px] text-[#8A8493] whitespace-nowrap">
                    {decksByLevel[level].length} колод
                  </span>
                </div>
                {decksByLevel[level].map((deck) => {
                  const hasDue = deck.due_cards > 0;
                  return (
                <Card
                  key={deck.id}
                  onClick={() => router.push(`/train/${deck.id}`)}
                  className="border-[#E8E2D9] bg-white hover:border-[#E0BBE4] active:scale-[0.99] transition-all cursor-pointer rounded-2xl shadow-none group"
                >
                  <CardContent className="p-5 flex items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#4A4453] truncate">
                          {deck.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 font-normal text-[#482C4E] border-[#E0BBE4] bg-[#FAF6FB] whitespace-nowrap"
                        >
                          Уровень {deck.level || 1} · {levelName(deck.level || 1)}
                        </Badge>
                      </div>
                      {deck.description && (
                        <p className="text-xs text-[#8A8493] line-clamp-2 leading-relaxed">
                          {deck.description}
                        </p>
                      )}
                      <div className="pt-1 flex items-center gap-2">
                        {hasDue ? (
                          <Badge variant="default" className="text-[11px] font-medium">
                            {deck.due_cards} к повторению
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-[#8A8493] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-[#2A472C]" />
                            Все {deck.total_cards} слов повторены
                          </Badge>
                        )}
                        <span className="text-[11px] text-[#8A8493]">
                          Всего: {deck.total_cards}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeck(deck.id);
                        }}
                        className="h-8 w-8 rounded-xl hover:bg-[#FFF3F0] text-[#8A8493] hover:text-[#6B2E28] transition-colors flex items-center justify-center opacity-70 hover:opacity-100"
                        title="Удалить колоду"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="h-9 w-9 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#8A8493]">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
