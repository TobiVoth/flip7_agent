"use client";

import React from "react";
import { X } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#fbf7e6] text-[#232755] border-4 border-[#232755] shadow-[0_16px_40px_rgba(0,0,0,0.65)] p-5 sm:p-7 space-y-5"
      >
        {/* Inner Gold Frame Accent */}
        <div className="flex items-center justify-between border-b-2 border-[#48b8b8] pb-3">
          <div>
            <span className="text-[11px] font-oswald uppercase tracking-widest text-[#232755]/70 block">
              Offizielle Kurzübersicht
            </span>
            <h2 className="font-cinzel font-black text-xl sm:text-2xl text-[#232755] tracking-wider">
              SPIELREGELN & PUNKTEWERTUNG
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#232755] text-[#e6d130] hover:bg-[#313773] transition cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spielidee */}
        <div className="p-4 rounded-xl bg-[#d4f2ed] border-2 border-[#232755] space-y-2">
          <h3 className="font-oswald font-bold text-base uppercase tracking-wider text-[#232755]">
            🎯 Spielidee & Flip 7 Bonus
          </h3>
          <p className="text-sm leading-relaxed">
            Sammle in jeder Runde Zahlenkarten, um Punkte in Höhe ihrer Zahlenwerte zu erhalten.
            <strong> Aber Vorsicht:</strong> Deckst du eine Zahlenkarte auf, die bereits vor dir liegt,
            hast du dich <strong>verzockt (0 Punkte)</strong>!
          </p>
          <p className="text-sm leading-relaxed">
            Schaffst du es, <strong>7 verschiedene Zahlenkarten</strong> vor dir auszulegen, gelingt dir ein{" "}
            <span className="px-1.5 py-0.5 rounded bg-[#232755] text-[#e6d130] font-bold">
              FLIP 7 (+15 Extrapunkte)
            </span>{" "}
            und die Runde endet sofort!
          </p>
        </div>

        {/* Kartenzusammensetzung */}
        <div className="space-y-2">
          <h3 className="font-oswald font-bold text-base uppercase tracking-wider bg-[#232755] text-[#fcf8e3] px-3 py-1 rounded inline-block">
            94 Karten im Stapel
          </h3>
          <ul className="text-sm space-y-1.5 list-disc list-inside">
            <li>
              <strong>79 Zahlenkarten (0 bis 12):</strong> 12× die <strong>12</strong>, 11× die <strong>11</strong>, 10× die <strong>10</strong> ... bis zu 1× die <strong>1</strong> sowie 1× die einsame <strong>0</strong>.
            </li>
            <li>
              <strong>6 Bonuskarten (je 1×):</strong> <strong>×2</strong> (verdoppelt nur die Summe deiner Zahlenkarten) sowie <strong>+2, +4, +6, +8, +10</strong>.
            </li>
            <li>
              <strong>9 Aktionskarten (je 3×):</strong>
              <ul className="pl-5 mt-1 space-y-1 text-xs sm:text-sm">
                <li>
                  <strong className="text-[#a6231b]">SECOND CHANCE:</strong> Schützt dich einmalig in dieser Runde vor einer doppelten Zahlenkarte.
                </li>
                <li>
                  <strong className="text-[#2c4a9a]">FREEZE:</strong> Friert eine aktive Person ein (sie steigt sofort mit ihren bisherigen Punkten aus).
                </li>
                <li>
                  <strong className="text-[#b58900]">FLIP THREE:</strong> Eine aktive Person muss 3 weitere Karten nacheinander vom Stapel ziehen.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Punkterechnung */}
        <div className="p-4 rounded-xl bg-[#efe6c2] border-2 border-[#232755] space-y-2">
          <h3 className="font-oswald font-bold text-base uppercase tracking-wider text-[#232755]">
            🧮 Reihenfolge der Punktewertung am Rundenende
          </h3>
          <ol className="text-sm space-y-1 list-decimal list-inside font-medium">
            <li>Summe aller eigenen <strong>Zahlenkarten</strong> addieren.</li>
            <li>Bei einer <strong>×2-Karte</strong> wird diese Zahlensumme verdoppelt.</li>
            <li>Punkte aller <strong>+Bonuskarten</strong> (+2 bis +10) dazurechnen.</li>
            <li>Bei 7 verschiedenen Zahlenkarten: <strong>+15 Extrapunkte</strong> für Flip 7!</li>
          </ol>
        </div>

        {/* Nutzung des KI-Ratgebers */}
        <div className="p-4 rounded-xl bg-[#232755] text-[#fcf8e3] space-y-1.5">
          <h3 className="font-oswald font-bold text-sm uppercase tracking-wider text-[#e6d130]">
            🤖 So nutzt du den KI Live-Assistenten am Spieltisch
          </h3>
          <p className="text-xs sm:text-sm text-[#fcf8e3]/90 leading-relaxed">
            Wähle vor dem Tippen auf eine Karte aus, ob die Karte für <strong>DICH</strong> („Karte für MICH gezogen“)
            oder für einen <strong>MITSPIELER</strong> („Karte von MITSPIELER gezogen“) aufgedeckt wurde.
            Der PPO-Agent zählt den gesamten 94er-Stapel live mit und berechnet dein exaktes Bust-Risiko sowie den
            Erwartungswert (Critic-EV) für <strong>NOCH EINE</strong> vs. <strong>STOPP</strong>!
          </p>
        </div>
      </div>
    </div>
  );
};
