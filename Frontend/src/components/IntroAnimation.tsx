"use client";

import React, { useEffect, useState } from "react";
import { Flip7Logo } from "./Flip7Logo";

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
}) => {
  const [phase, setPhase] = useState<"enter" | "zoom-dissolve" | "done">(
    "enter"
  );

  useEffect(() => {
    // Phase 1: Show & fan out the HTML Flip 7 logo (0ms -> 1300ms)
    // Phase 2: Zoom in deeply onto the logo & dissolve into particles/blur (1300ms -> 2850ms)
    const zoomTimer = setTimeout(() => {
      setPhase("zoom-dissolve");
    }, 1300);

    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2850);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      onClick={() => {
        setPhase("done");
        onComplete();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-opacity duration-700 ${
        phase === "zoom-dissolve" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at center, #2b3270 0%, #1d204d 60%, #11132e 100%)",
      }}
    >
      {/* Decorative Art-Deco background rays */}
      <div
        className={`absolute inset-0 opacity-20 transition-transform duration-[1600ms] ease-in-out ${
          phase === "zoom-dissolve" ? "scale-[3.5] rotate-12" : "scale-100 rotate-0"
        }`}
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg, #e6d130 0deg 6deg, transparent 6deg 18deg)",
        }}
      />

      {/* Floating decorative particles during zoom/dissolve */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-[1550ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          phase === "enter"
            ? "scale-100 opacity-100 blur-0 animate-[introPop_0.75s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            : "scale-[9] sm:scale-[12] opacity-0 blur-xl"
        }`}
      >
        <Flip7Logo size="hero" animated={true} />

        <div
          className={`mt-6 px-5 py-1.5 rounded-full bg-[#fcf8e3] border-2 border-[#1d204d] shadow-lg transition-all duration-500 ${
            phase === "zoom-dissolve"
              ? "opacity-0 translate-y-6"
              : "opacity-100 translate-y-0"
          }`}
        >
          <span className="font-cinzel font-black text-xs sm:text-sm tracking-[0.2em] text-[#1d204d]">
            KI LIVE-ASSISTENT & KARTENZÄHLER
          </span>
        </div>
      </div>

      {/* Skip Hint */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPhase("done");
          onComplete();
        }}
        className="absolute bottom-6 right-6 z-20 px-3 py-1.5 rounded-lg bg-[#1d204d]/80 hover:bg-[#1d204d] text-[#efe6c2] border border-[#e6d130]/40 text-xs font-oswald tracking-wider uppercase transition"
      >
        Überspringen ✕
      </button>
    </div>
  );
};
