"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  RotateCcw,
  RefreshCw,
  Shuffle,
  User,
  Users,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Layers,
} from "lucide-react";
import {
  GameStateData,
  TargetMode,
  NUMBER_CARDS,
  BONUS_CARDS,
  ACTION_CARDS,
} from "@/types/flip7";
import { Flip7Card } from "@/components/Flip7Card";
import { Flip7Logo } from "@/components/Flip7Logo";
import { IntroAnimation } from "@/components/IntroAnimation";
import { RulesModal } from "@/components/RulesModal";

const INITIAL_DECK_COUNTS: Record<string, number> = {
  NUM_0: 1,
  NUM_1: 1,
  NUM_2: 2,
  NUM_3: 3,
  NUM_4: 4,
  NUM_5: 5,
  NUM_6: 6,
  NUM_7: 7,
  NUM_8: 8,
  NUM_9: 9,
  NUM_10: 10,
  NUM_11: 11,
  NUM_12: 12,
  BONUS_2: 1,
  BONUS_4: 1,
  BONUS_6: 1,
  BONUS_8: 1,
  BONUS_10: 1,
  BONUS_X2: 1,
  ACT_SECOND_CHANCE: 3,
  ACT_FLIP_THREE: 3,
  ACT_FREEZE: 3,
};

const INITIAL_STATE: GameStateData = {
  hand_numbers: [],
  unique_count: 0,
  has_second_chance: false,
  has_x2: false,
  bonus_cards: [],
  bonus_sum: 0,
  busted: false,
  flip7: false,
  current_score: 0,
  remaining_total: 94,
  deck_counts: INITIAL_DECK_COUNTS,
  bust_risk: 0.0,
  prob_stop: 0.0,
  prob_hit: 100.0,
  expected_value: 26.5,
  recommendation: "NOCH EINE",
};

export default function Flip7AssistantPage() {
  const [gameState, setGameState] = useState<GameStateData>(INITIAL_STATE);
  const [targetMode, setTargetMode] = useState<TargetMode>("me");
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [lastPlayedCard, setLastPlayedCard] = useState<string | null>(null);
  const prevFlip7Ref = useRef<boolean>(false);

  const callApi = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<GameStateData | null> => {
      try {
        const res = await fetch(endpoint, {
          ...options,
          cache: "no-store",
        });
        if (res.ok) {
          setApiConnected(true);
          return await res.json();
        }
        setApiConnected(false);
      } catch {
        setApiConnected(false);
      }
      return null;
    },
    []
  );

  useEffect(() => {
    callApi("/api/state").then((data) => {
      if (data) setGameState(data);
    });
  }, [callApi]);

  // Trigger celebratory confetti when achieving FLIP 7 (7 unique number cards!)
  useEffect(() => {
    const isFlip7 = Boolean(gameState.flip7) || gameState.unique_count >= 7;
    if (isFlip7 && !prevFlip7Ref.current && !gameState.busted) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#e6d130", "#48b8b8", "#d62c2c", "#fcf8e3", "#2eb85c"],
      });
    }
    prevFlip7Ref.current = isFlip7;
  }, [gameState.flip7, gameState.unique_count, gameState.busted]);

  const handleSendCard = async (cardKey: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setLastPlayedCard(cardKey);
    const data = await callApi("/api/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card: cardKey, target: targetMode }),
    });
    if (data) {
      setGameState(data);
    }
    setIsLoading(false);
  };

  const handlePostAction = async (endpoint: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setLastPlayedCard(null);
    const data = await callApi(endpoint, { method: "POST" });
    if (data) {
      setGameState(data);
    }
    setIsLoading(false);
  };

  const isFlip7 = Boolean(gameState.flip7) || gameState.unique_count >= 7;
  const handSum = gameState.hand_numbers.reduce((acc, n) => acc + n, 0);
  const doubledSum = gameState.has_x2 ? handSum * 2 : handSum;
  const hasAnyHandCards =
    gameState.hand_numbers.length > 0 ||
    gameState.bonus_cards.length > 0 ||
    gameState.has_x2 ||
    gameState.has_second_chance;

  // Count how many cards in remaining deck would cause a bust
  const bustCardsRemaining = gameState.hand_numbers.reduce(
    (sum, num) => sum + (gameState.deck_counts[`NUM_${num}`] ?? 0),
    0
  );

  return (
    <>
      {/* Fullscreen HTML Logo Zoom & Dissolve Intro Animation */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {/* Official Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <main className="min-h-screen pb-24 md:pb-12 pt-3 px-2.5 sm:px-5 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* =====================================================
            HEADER & ROUND CONTROLS
           ===================================================== */}
        <header className="art-deco-panel-mint rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-start">
            <Flip7Logo
              size="sm"
              onClick={() => setShowIntro(true)}
              className="shrink-0"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#232755] text-[#e6d130] font-oswald text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  PPO KI-Ratgeber
                </span>
                {!apiConnected && (
                  <span className="px-2 py-0.5 rounded bg-[#d62c2c] text-white font-oswald text-[10px] font-bold uppercase">
                    API Offline (Port 8000)
                  </span>
                )}
              </div>
              <h1 className="font-cinzel font-black text-lg sm:text-2xl text-[#232755] tracking-wide mt-0.5">
                FLIP 7 LIVE-ASSISTENT
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-oswald text-[#232755]/90">
                <Layers className="w-4 h-4 text-[#232755]" />
                <span>
                  Reststapel:{" "}
                  <strong className="text-base sm:text-lg font-bold text-[#1d204d] underline decoration-[#e6d130] decoration-2">
                    {gameState.remaining_total}
                  </strong>{" "}
                  / 94 Karten
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="px-3 py-2 rounded-xl bg-[#fcf8e3] hover:bg-white text-[#232755] border-2 border-[#232755] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_0_#232755] active:translate-y-0.5 transition cursor-pointer"
              title="Logo-Animation erneut abspielen"
            >
              <Sparkles className="w-4 h-4 text-[#d62c2c]" />
              <span className="hidden sm:inline">Intro</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="px-3 py-2 rounded-xl bg-[#fcf8e3] hover:bg-white text-[#232755] border-2 border-[#232755] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_0_#232755] active:translate-y-0.5 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#232755]" />
              <span>Anleitung</span>
            </button>

            <button
              type="button"
              onClick={() => handlePostAction("/api/undo")}
              className="px-3.5 py-2 rounded-xl bg-[#efe6c2] hover:bg-[#fcf8e3] text-[#232755] border-2 border-[#232755] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_0_#232755] active:translate-y-0.5 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>↩ Rückgängig</span>
            </button>

            <button
              type="button"
              onClick={() => handlePostAction("/api/reset_round")}
              className="px-3.5 py-2 rounded-xl bg-[#232755] hover:bg-[#2f3570] text-[#e6d130] border-2 border-[#232755] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_0_#11132e] active:translate-y-0.5 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Neue Runde</span>
            </button>

            <button
              type="button"
              onClick={() => handlePostAction("/api/reset_deck")}
              className="px-3.5 py-2 rounded-xl bg-[#d62c2c] hover:bg-[#b82323] text-[#fcf8e3] border-2 border-[#232755] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_0_#232755] active:translate-y-0.5 transition cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Neu mischen (94)</span>
            </button>
          </div>
        </header>

        {/* =====================================================
            COCKPIT: KI-EMPFEHLUNG, WAHRSCHEINLICHKEITEN & STATS
            (Inspired by Page 3 & Page 6 of anleitung_flip_7.pdf)
           ===================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 1. KI-Empfehlung Signpost Box */}
          <div
            className={`md:col-span-5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden border-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-colors ${
              gameState.busted
                ? "bg-gradient-to-b from-[#d13a30] to-[#991b1b] border-[#e6d130] text-white"
                : isFlip7
                ? "bg-gradient-to-b from-[#e6d130] to-[#d49b1f] border-[#232755] text-[#232755]"
                : gameState.recommendation === "NOCH EINE"
                ? "art-deco-panel-mint"
                : "art-deco-panel"
            }`}
          >
            <span className="font-cinzel font-black text-[11px] sm:text-xs uppercase tracking-[0.2em] px-3 py-0.5 rounded-full bg-[#232755] text-[#e6d130]">
              KI-Empfehlung
            </span>

            {/* Authentic Arrow Banner from Page 3 of the manual */}
            <div className="my-3 w-full flex flex-col items-center justify-center">
              {gameState.busted ? (
                <div className="px-6 py-2.5 bg-[#fcf8e3] text-[#d62c2c] border-[3px] border-[#232755] shadow-[4px_4px_0_#232755] -rotate-2">
                  <div className="font-oswald font-bold text-3xl sm:text-4xl tracking-wider uppercase">
                    ⚡ VERZOCKT!
                  </div>
                </div>
              ) : isFlip7 ? (
                <div className="px-6 py-2.5 bg-[#232755] text-[#e6d130] border-[3px] border-[#fcf8e3] shadow-[4px_4px_0_#232755] -rotate-2">
                  <div className="font-oswald font-bold text-3xl sm:text-4xl tracking-wider uppercase">
                    ★ FLIP 7! (+15) ★
                  </div>
                </div>
              ) : gameState.recommendation === "NOCH EINE" ? (
                <div
                  className="relative px-7 py-2.5 bg-[#fcf8e3] text-[#232755] border-[3px] border-[#232755] shadow-[5px_5px_0_#2eb85c] -rotate-3 transition-transform"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 6% 100%, 0% 50%)",
                  }}
                >
                  <div className="font-oswald font-bold text-3xl sm:text-4xl tracking-widest text-[#1c7c3c]">
                    NOCH EINE ➔
                  </div>
                </div>
              ) : (
                <div
                  className="relative px-7 py-2.5 bg-[#fcf8e3] text-[#232755] border-[3px] border-[#232755] shadow-[-5px_5px_0_#f59e2d] -rotate-2 transition-transform"
                  style={{
                    clipPath:
                      "polygon(12% 0%, 100% 0%, 94% 50%, 100% 100%, 12% 100%, 0% 50%)",
                  }}
                >
                  <div className="font-oswald font-bold text-3xl sm:text-4xl tracking-widest text-[#b85d10]">
                    ⬅ STOPP
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#232755] text-[#fcf8e3] text-xs sm:text-sm font-oswald">
              <span className="flex items-center gap-1.5 text-[#89d5cd]">
                <TrendingUp className="w-4 h-4" />
                Critic-Erwartung (EV):
              </span>
              <span className="text-base sm:text-lg font-bold text-[#e6d130]">
                {gameState.expected_value} Pkt.
              </span>
            </div>
          </div>

          {/* 2. Wahrscheinlichkeiten (NOCH EINE vs STOPP) */}
          <div className="md:col-span-4 art-deco-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between border-b border-[#232755]/20 pb-1.5">
              <span className="font-cinzel font-black text-xs uppercase tracking-wider text-[#232755]">
                Entscheidungs-Analyse
              </span>
              <span className="font-oswald text-xs font-bold text-[#232755]/70">
                PPO Policy
              </span>
            </div>

            {/* NOCH EINE Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-oswald text-xs sm:text-sm font-bold">
                <span className="text-[#1c7c3c] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2eb85c] inline-block border border-[#232755]" />
                  NOCH EINE (Ziehen)
                </span>
                <span className="text-base font-black text-[#232755]">
                  {gameState.prob_hit}%
                </span>
              </div>
              <div className="w-full h-4 bg-[#232755]/15 rounded-full p-0.5 border-2 border-[#232755] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2eb85c] to-[#48b8b8] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, gameState.prob_hit))}%` }}
                />
              </div>
            </div>

            {/* STOPP Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-oswald text-xs sm:text-sm font-bold">
                <span className="text-[#b85d10] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e2d] inline-block border border-[#232755]" />
                  STOPP (Passen & Sichern)
                </span>
                <span className="text-base font-black text-[#232755]">
                  {gameState.prob_stop}%
                </span>
              </div>
              <div className="w-full h-4 bg-[#232755]/15 rounded-full p-0.5 border-2 border-[#232755] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f59e2d] to-[#e6d130] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, gameState.prob_stop))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Runden-Metriken: Sichere Punkte, Flip-7 Fortschritt, Bust-Risiko */}
          <div className="md:col-span-3 art-deco-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
            {/* Sichere Punkte */}
            <div className="flex justify-between items-center bg-[#232755] text-[#fcf8e3] px-3 py-2 rounded-xl border-2 border-[#e6d130]">
              <span className="font-oswald text-xs uppercase tracking-wider text-[#efe6c2]">
                Sichere Punkte:
              </span>
              <span className="font-oswald text-2xl font-bold text-[#e6d130]">
                {gameState.current_score}
              </span>
            </div>

            {/* Zahlenkarten (X / 7) mit 7 Karten-Slots */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-oswald text-xs sm:text-sm">
                <span className="font-bold text-[#232755]/80">
                  Zahlenkarten (Flip 7):
                </span>
                <span className="font-bold text-[#232755]">
                  {gameState.unique_count} / 7
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 pt-0.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const filled = idx < gameState.unique_count;
                  return (
                    <div
                      key={idx}
                      className={`h-5 rounded border-2 border-[#232755] flex items-center justify-center font-oswald text-[10px] font-bold transition-all ${
                        filled
                          ? "bg-[#48b8b8] text-[#232755] scale-105 shadow-sm"
                          : "bg-[#fcf8e3]/60 text-[#232755]/40"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bust-Risiko */}
            <div className="flex justify-between items-center pt-1 border-t border-[#232755]/20">
              <span className="font-oswald text-xs sm:text-sm font-bold text-[#232755]/80 flex items-center gap-1">
                {gameState.has_second_chance ? (
                  <ShieldCheck className="w-4 h-4 text-[#2eb85c]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#d62c2c]" />
                )}
                Bust-Risiko:
              </span>
              <div className="text-right">
                <span
                  className={`font-oswald text-lg font-bold ${
                    gameState.bust_risk === 0
                      ? "text-[#1c7c3c]"
                      : gameState.bust_risk < 20
                      ? "text-[#b85d10]"
                      : "text-[#d62c2c]"
                  }`}
                >
                  {gameState.bust_risk}%
                </span>
                <span className="block text-[10px] font-oswald text-[#232755]/70 leading-none">
                  {gameState.has_second_chance
                    ? "Durch 2nd Chance 0%"
                    : `${bustCardsRemaining} v. ${gameState.remaining_total} Karten`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DEINE AKTUELLE AUSLAGE (Original Card Tableau & Score Equation)
            (Inspired by Page 5 & Page 6 of anleitung_flip_7.pdf)
           ===================================================== */}
        <section className="art-deco-panel-navy rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6d130]/30 pb-2.5">
            <div className="flex items-center gap-2.5">
              <h2 className="font-cinzel font-black text-sm sm:text-base uppercase tracking-wider text-[#e6d130]">
                Deine aktuelle Auslage
              </h2>
              {gameState.has_second_chance && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#d13a30] text-[#fcf8e3] border border-[#e6d130] font-oswald text-xs font-bold flex items-center gap-1">
                  ♥ Second Chance aktiv
                </span>
              )}
              {gameState.busted && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#d62c2c] text-white font-oswald text-xs font-bold uppercase animate-bounce">
                  ⚡ Verzockt – 0 Punkte
                </span>
              )}
              {isFlip7 && !gameState.busted && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#e6d130] text-[#232755] font-oswald text-xs font-bold uppercase">
                  ★ FLIP 7 BONUS (+15 Pkt.) ★
                </span>
              )}
            </div>

            {/* Step-by-Step Score Ribbon (like Page 6 of the manual) */}
            {hasAnyHandCards && !gameState.busted && (
              <div className="flex flex-wrap items-center gap-1.5 bg-[#151836] px-3 py-1 rounded-lg border border-[#e6d130]/50 font-oswald text-xs sm:text-sm">
                <span className="text-[#89d5cd]">Zahlen:</span>
                <strong className="text-white">{handSum}</strong>
                {gameState.has_x2 && (
                  <>
                    <span className="text-[#eea644] font-bold">× 2 =</span>
                    <strong className="text-[#eea644]">{doubledSum}</strong>
                  </>
                )}
                {gameState.bonus_sum > 0 && (
                  <>
                    <span className="text-[#89d5cd]">
                      + {gameState.bonus_sum} (Bonus)
                    </span>
                  </>
                )}
                {isFlip7 && (
                  <span className="text-[#e6d130] font-bold">
                    + 15 (Flip 7!)
                  </span>
                )}
                <span className="text-[#e6d130] font-bold ml-1">
                  = {gameState.current_score} Pkt.
                </span>
              </div>
            )}
          </div>

          {!hasAnyHandCards ? (
            <div className="py-5 text-center border-2 border-dashed border-[#e6d130]/30 rounded-xl">
              <p className="font-oswald text-sm sm:text-base text-[#efe6c2]/70 tracking-wide">
                Noch keine eigenen Karten in dieser Runde. Tippe unten auf eine gezogene Karte!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              {/* Number Cards in Hand */}
              {gameState.hand_numbers.map((num) => {
                const meta = NUMBER_CARDS[num];
                return (
                  <div
                    key={`hand-num-${num}`}
                    className="w-[68px] sm:w-[84px] md:w-[94px] transition-transform hover:scale-105"
                  >
                    <Flip7Card
                      variant="number"
                      value={meta.value}
                      label={meta.label}
                      accentColor={meta.accentColor}
                      badgeMode="none"
                    />
                  </div>
                );
              })}

              {/* Divider if both number and bonus/special cards exist */}
              {gameState.hand_numbers.length > 0 &&
                (gameState.bonus_cards.length > 0 ||
                  gameState.has_x2 ||
                  gameState.has_second_chance) && (
                  <div className="h-20 w-0.5 bg-[#e6d130]/40 mx-1 hidden sm:block" />
                )}

              {/* x2 Card in Hand */}
              {gameState.has_x2 && (
                <div className="w-[68px] sm:w-[84px] md:w-[94px] transition-transform hover:scale-105">
                  <Flip7Card
                    variant="bonus"
                    value="x2"
                    subtext="DIE SUMME DEINER ZAHLENKARTEN x2"
                    bgMain="#eea644"
                    bgCenter="#f7c97e"
                    accentColor="#d9534f"
                    badgeMode="none"
                  />
                </div>
              )}

              {/* +Bonus Cards in Hand */}
              {gameState.bonus_cards.map((bVal, idx) => (
                <div
                  key={`hand-bonus-${bVal}-${idx}`}
                  className="w-[68px] sm:w-[84px] md:w-[94px] transition-transform hover:scale-105"
                >
                  <Flip7Card
                    variant="bonus"
                    value={`+${bVal}`}
                    subtext={`DIE SUMME DEINER ZAHLENKARTEN +${bVal}`}
                    bgMain="#eea644"
                    bgCenter="#f7c97e"
                    accentColor="#d9534f"
                    badgeMode="none"
                  />
                </div>
              ))}

              {/* Second Chance Card in Hand */}
              {gameState.has_second_chance && (
                <div className="w-[68px] sm:w-[84px] md:w-[94px] transition-transform hover:scale-105">
                  <Flip7Card
                    variant="action-double"
                    icon="heart"
                    line1="SECOND"
                    line2="CHANCE"
                    topText="BEHALTE DIESE KARTE"
                    bottomText="BIS DU SIE BRAUCHST"
                    bgMain="#d13a30"
                    bgCenter="#e66057"
                    accentColor="#a6231b"
                    badgeMode="none"
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            MODUS-UMSCHALTER (Sticky on Mobile/Tablet for fast table play)
           ===================================================== */}
        <section className="sticky top-2 z-30 art-deco-panel rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTargetMode("me")}
              className={`py-2.5 sm:py-3 px-3 rounded-xl font-oswald font-bold text-xs sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                targetMode === "me"
                  ? "bg-[#2eb85c] text-white border-[#232755] shadow-[0_4px_0_#232755] -translate-y-0.5"
                  : "bg-[#efe6c2] text-[#232755]/75 border-[#232755]/40 hover:bg-[#fcf8e3]"
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>👤 Karte für MICH gezogen</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetMode("other")}
              className={`py-2.5 sm:py-3 px-3 rounded-xl font-oswald font-bold text-xs sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                targetMode === "other"
                  ? "bg-[#232755] text-[#e6d130] border-[#232755] shadow-[0_4px_0_#48b8b8] -translate-y-0.5"
                  : "bg-[#efe6c2] text-[#232755]/75 border-[#232755]/40 hover:bg-[#fcf8e3]"
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>👥 Karte von MITSPIELER gezogen</span>
            </button>
          </div>
        </section>

        {/* =====================================================
            KARTEN-EINGABE GRIDS IM ORIGINAL KARTENDESIGN (card.html)
           ===================================================== */}
        <section
          className={`rounded-2xl p-4 sm:p-6 space-y-6 transition-colors border-[3px] shadow-2xl ${
            targetMode === "me"
              ? "bg-[#1f2652]/95 border-[#2eb85c]"
              : "bg-[#1b2042]/95 border-[#48b8b8]"
          }`}
        >
          {/* Mode Banner Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6d130]/25 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg font-oswald font-bold text-xs uppercase tracking-widest border ${
                  targetMode === "me"
                    ? "bg-[#2eb85c] text-white border-white/30"
                    : "bg-[#48b8b8] text-[#232755] border-[#232755]"
                }`}
              >
                {targetMode === "me"
                  ? "Ziel: Meine Auslage + Stapel"
                  : "Ziel: Nur vom Stapel abziehen (Mitspieler)"}
              </span>
              {lastPlayedCard && (
                <span className="text-xs font-oswald text-[#efe6c2]/75">
                  Zuletzt gewählt: <strong className="text-[#e6d130]">{lastPlayedCard}</strong>
                </span>
              )}
            </div>
            <span className="text-xs font-oswald text-[#efe6c2]/70">
              Tippe auf eine Karte, sobald sie am Tisch aufgedeckt wird
            </span>
          </div>

          {/* 1. Zahlenkarten (0 bis 12) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel font-black text-sm sm:text-lg text-[#efe6c2] tracking-wider flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#232755] border border-[#e6d130] text-[#e6d130] font-oswald text-xs">
                  79 KARTEN
                </span>
                ZAHLENKARTEN (0 BIS 12)
              </h3>
              <span className="text-[11px] sm:text-xs font-oswald text-[#d62c2c] bg-[#fcf8e3] px-2.5 py-0.5 rounded-full font-bold border border-[#232755]">
                Roter Rahmen = Schon in deiner Auslage!
              </span>
            </div>

            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2.5 sm:gap-3.5">
              {NUMBER_CARDS.map((card) => {
                const rem = gameState.deck_counts[card.key] ?? 0;
                const inHand = gameState.hand_numbers.includes(card.value);
                return (
                  <Flip7Card
                    key={card.key}
                    variant="number"
                    value={card.value}
                    label={card.label}
                    accentColor={card.accentColor}
                    remainingCount={rem}
                    maxCount={card.maxCount}
                    isInHand={inHand}
                    hasSecondChance={gameState.has_second_chance}
                    disabled={rem <= 0 || isLoading}
                    onClick={() => handleSendCard(card.key)}
                    className="w-full"
                  />
                );
              })}
            </div>
          </div>

          {/* 2. Bonuskarten (+2, +4, +6, +8, +10, x2) & Aktionskarten */}
          <div className="space-y-3 pt-2 border-t border-[#e6d130]/20">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel font-black text-sm sm:text-lg text-[#efe6c2] tracking-wider flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#232755] border border-[#e6d130] text-[#e6d130] font-oswald text-xs">
                  15 KARTEN
                </span>
                BONUS- & AKTIONSKARTEN
              </h3>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5 sm:gap-3">
              {/* Bonus Cards */}
              {BONUS_CARDS.map((bCard) => {
                const rem = gameState.deck_counts[bCard.key] ?? 0;
                return (
                  <Flip7Card
                    key={bCard.key}
                    variant="bonus"
                    value={bCard.value}
                    subtext={bCard.subtext}
                    bgMain={bCard.bgMain}
                    bgCenter={bCard.bgCenter}
                    accentColor={bCard.accentColor}
                    remainingCount={rem}
                    maxCount={bCard.maxCount}
                    disabled={rem <= 0 || isLoading}
                    onClick={() => handleSendCard(bCard.key)}
                    className="w-full"
                  />
                );
              })}

              {/* Action Cards */}
              {ACTION_CARDS.map((aCard) => {
                const rem = gameState.deck_counts[aCard.key] ?? 0;
                return (
                  <Flip7Card
                    key={aCard.key}
                    variant={aCard.type}
                    icon={aCard.icon}
                    line1={aCard.line1}
                    line2={aCard.line2}
                    topText={aCard.topText}
                    bottomText={aCard.bottomText}
                    bgMain={aCard.bgMain}
                    bgCenter={aCard.bgCenter}
                    accentColor={aCard.accentColor}
                    remainingCount={rem}
                    maxCount={aCard.maxCount}
                    disabled={rem <= 0 || isLoading}
                    onClick={() => handleSendCard(aCard.key)}
                    className="w-full"
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
