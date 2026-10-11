"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, Smartphone, Check } from "lucide-react";
import { useI18n } from "@/context/i18n-context";
import { createLocalDeck } from "@/lib/local-decks";

interface ManualDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  nativeLang: string;
  targetLang: string;
  onCreated?: () => void;
}

interface CardDraft {
  front: string;
  back: string;
  rule_description: string;
}

const MAX_CARDS = 30;
const EMPTY_CARD = (): CardDraft => ({ front: "", back: "", rule_description: "" });

export function ManualDeckModal({
  isOpen,
  onClose,
  nativeLang,
  targetLang,
  onCreated,
}: ManualDeckModalProps) {
  const router = useRouter();
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<CardDraft[]>([EMPTY_CARD(), EMPTY_CARD()]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setLevel(1);
      setCards([EMPTY_CARD(), EMPTY_CARD()]);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateCard = (index: number, field: keyof CardDraft, value: string) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addCard = () => {
    if (cards.length >= MAX_CARDS) {
      setError(t("Максимум {n} карточек", { n: MAX_CARDS }));
      return;
    }
    setCards((prev) => [...prev, EMPTY_CARD()]);
  };

  const removeCard = (index: number) => {
    setCards((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError(t("Заполните название колоды"));
      return;
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError(t("Добавьте хотя бы одну карточку"));
      return;
    }
    if (validCards.length !== cards.filter((c) => c.front.trim() || c.back.trim()).length) {
      setError(t("Заполните «вопрос» и «ответ» в каждой карточке"));
      return;
    }

    setIsSaving(true);
    try {
      const deck = createLocalDeck({
        title: cleanTitle.slice(0, 80),
        description: description.trim().slice(0, 200),
        level,
        native_language: nativeLang,
        target_language: targetLang,
        cards: validCards.map((c) => ({
          front: c.front.trim().slice(0, 300),
          back: c.back.trim().slice(0, 300),
          rule_description: c.rule_description.trim().slice(0, 500),
        })),
      });
      onCreated?.();
      onClose();
      router.push(`/train/${deck.id}`);
    } catch {
      setIsSaving(false);
      setError(t("Не удалось создать колоду"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3">
      <Card className="w-full max-w-md bg-white rounded-3xl border-none shadow-xl max-h-[92vh] overflow-y-auto">
        <CardHeader className="pt-6 pb-2 px-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-[#EFE9FC] flex items-center justify-center text-[#7B6FA6] hover:text-[#2A2352] transition-colors"
            title={t("Закрыть")}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="h-12 w-12 rounded-2xl bg-[#B9EBDD] text-[#1D6B5B] flex items-center justify-center mb-2">
            <Plus className="h-6 w-6" />
          </div>

          <CardTitle className="text-lg font-semibold text-[#2A2352]">
            {t("Создать колоду вручную")}
          </CardTitle>
          <CardDescription className="text-xs text-[#7B6FA6] leading-relaxed">
            {t("Заполните карточки сами — прогресс сохранится только на этом устройстве")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6 pt-2">
          {/* Deck meta */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#7B6FA6]">{t("Название колоды")}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Например: Заказ в ресторане")}
              disabled={isSaving}
              autoFocus
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#7B6FA6]">
              {t("Описание (необязательно)")}
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Для чего эта колода")}
              disabled={isSaving}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
              {t("Уровень сложности")}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 h-9 rounded-xl border text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    level === lvl
                      ? "border-[#B7A0F6] bg-[#F0EAFB] text-[#2A2352]"
                      : "border-[#DCD0F5] bg-white text-[#7B6FA6] hover:border-[#B7A0F6]"
                  }`}
                >
                  {level === lvl && <Check className="h-3 w-3" />}
                  {t("Уровень")} {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Cards editor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#7B6FA6] uppercase tracking-wider">
                {t("Карточки")}
              </span>
              <span className="text-[11px] text-[#7B6FA6]">
                {cards.length} / {MAX_CARDS}
              </span>
            </div>

            {cards.map((card, index) => (
              <div
                key={index}
                className="p-3 rounded-2xl border border-[#DCD0F5] bg-[#FAF7FF] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#7B6FA6]">
                    {t("Карточка")} {index + 1}
                  </span>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => removeCard(index)}
                      className="h-7 w-7 rounded-lg hover:bg-[#FFECF0] text-[#A63A4B] flex items-center justify-center transition-colors"
                      title={t("Удалить карточку")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <Input
                  value={card.front}
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  placeholder={t("Вопрос или фраза (на родном языке)")}
                  disabled={isSaving}
                  className="text-sm"
                />
                <Input
                  value={card.back}
                  onChange={(e) => updateCard(index, "back", e.target.value)}
                  placeholder={t("Ответ (на изучаемом языке)")}
                  disabled={isSaving}
                  className="text-sm"
                />
                <Input
                  value={card.rule_description}
                  onChange={(e) => updateCard(index, "rule_description", e.target.value)}
                  placeholder={t("Правило / пояснение (необязательно)")}
                  disabled={isSaving}
                  className="text-xs"
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addCard}
              disabled={isSaving || cards.length >= MAX_CARDS}
              className="w-full text-xs font-medium h-10 rounded-2xl"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("Добавить карточку")}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-[#A63A4B] bg-[#FFF1F3] border border-[#F9D7DD] p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[#7B6FA6] bg-[#E3F7EF] border border-[#B9EBDD] p-2.5 rounded-xl">
            <Smartphone className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0" />
            <span>{t("Колода хранится только на этом устройстве и не видна с других")}</span>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-xs font-semibold h-12 rounded-2xl"
          >
            {isSaving ? t("Сохраняем...") : t("Создать колоду")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
