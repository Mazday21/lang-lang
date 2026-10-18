"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, ThumbsUp, CalendarCheck, Sparkles, ArrowRight } from "lucide-react";
import { useI18n } from "@/context/i18n-context";

interface HowToScreenProps {
  onStart: () => void;
}

/**
 * First-run explainer: a short, clear page shown right after the user picks
 * their languages — how to use the app and what it gives them.
 */
export function HowToScreen({ onStart }: HowToScreenProps) {
  const { t } = useI18n();

  const steps = [
    {
      icon: Eye,
      title: t("1. Смотри карточку"),
      text: t("Вспомни перевод слова или фразы — и только потом нажимай «Проверить»."),
    },
    {
      icon: CheckCircle2,
      title: t("2. Проверяй перевод"),
      text: t("Ответ и грамматическое правило появятся сразу после проверки."),
    },
    {
      icon: ThumbsUp,
      title: t("3. Оцени, как вспомнилось"),
      text: t("«Не помню» или «Легко» — умный алгоритм SM-2 сам подстроит интервал повторения."),
    },
    {
      icon: CalendarCheck,
      title: t("4. 15 карточек в день"),
      text: t("«Колода на сегодня» сама соберёт нужный микс: слова вернутся ровно тогда, когда начнёшь их забывать."),
    },
  ];

  return (
    <main className="min-h-screen bg-[#F4EFFE] text-[#2A2352] px-5 py-8 max-w-lg mx-auto flex flex-col">
      {/* Hero */}
      <div className="text-center space-y-3 pb-2">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#B7A0F6] to-[#9FE2CE] mx-auto flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold leading-tight">{t("Как пользоваться LangLang")}</h1>
        <p className="text-sm text-[#7B6FA6] leading-relaxed max-w-xs mx-auto">
          {t("Всего 3 шага — и слова запоминаются надолго, а не «на завтра»")}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 py-4">
        {steps.map((step) => (
          <Card key={step.title} className="border-[#DCD0F5] bg-white shadow-none">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F0EAFB] flex items-center justify-center shrink-0">
                <step.icon className="h-4 w-4 text-[#B7A0F6]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#2A2352]">{step.title}</p>
                <p className="text-xs text-[#7B6FA6] leading-relaxed">{step.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <div className="p-4 rounded-2xl bg-[#E3F7EF] border border-[#B9EBDD] space-y-2">
        <p className="text-xs font-semibold text-[#1D6B5B] uppercase tracking-wider">
          {t("Что это даёт")}
        </p>
        <ul className="space-y-1.5 text-xs text-[#2A2352]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
            {t("Слова остаются в памяти надолго — повторения приходят в нужный момент")}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
            {t("Виден прогресс: уровень владения растёт с каждой карточкой")}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#1D6B5B] shrink-0 mt-0.5" />
            {t("Достаточно 10–15 минут в день — без зубрёжки и стресса")}
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-5">
        <Button
          onClick={onStart}
          className="w-full text-sm font-semibold h-12 rounded-2xl flex items-center justify-center gap-2"
        >
          <span>{t("Понятно, начать!")}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
