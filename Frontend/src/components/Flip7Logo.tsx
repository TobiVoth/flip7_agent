"use client";

import React from "react";

interface Flip7LogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const FAN_CARDS = [
  { color: "#48b8b8", rotate: -46, x: -78, y: 26, delay: "0.05s" },
  { color: "#d14328", rotate: -34, x: -56, y: 12, delay: "0.10s" },
  { color: "#7982c9", rotate: -22, x: -32, y: 1, delay: "0.15s" },
  { color: "#f2df24", rotate: -9, x: -6, y: -6, delay: "0.20s" },
  { color: "#c92a2a", rotate: 5, x: 20, y: -6, delay: "0.25s" },
  { color: "#fcf8e3", rotate: 19, x: 46, y: 0, delay: "0.30s" },
  { color: "#b5dc24", rotate: 33, x: 70, y: 10, delay: "0.35s" },
];

export const Flip7Logo: React.FC<Flip7LogoProps> = ({
  size = "md",
  animated = false,
  className = "",
  onClick,
}) => {
  const sizeClasses = {
    sm: "w-[150px] h-[92px]",
    md: "w-[240px] h-[148px]",
    lg: "w-[360px] h-[225px] sm:w-[440px] sm:h-[275px]",
    hero: "w-[330px] h-[240px] sm:w-[480px] sm:h-[340px] md:w-[560px] md:h-[390px]",
  }[size];

  return (
    <div
      onClick={onClick}
      title={onClick ? "Klicken, um die Intro-Animation abzuspielen" : undefined}
      className={`relative select-none overflow-hidden rounded-2xl border-[3px] border-[#1d204d] shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
        onClick ? "cursor-pointer group hover:scale-[1.02] transition-transform" : ""
      } ${sizeClasses} ${className}`}
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #bcebe4 10%, #86cfd6 60%, #6abbc4 100%)",
      }}
    >
      {/* Subtle vintage halftone pattern overlay */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#1d204d 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />

      {/* Full SVG recreation of logo_flip_7.png */}
      <svg
        viewBox="0 0 500 340"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="3"
              floodColor="#1d204d"
              floodOpacity="0.38"
            />
          </filter>
        </defs>

        {/* Art-Deco Gold Stepped Outer Frame (matching card.html & manual cover) */}
        <path
          fill="#e6d130"
          stroke="#1d204d"
          strokeWidth="3.5"
          strokeLinejoin="round"
          d="
            M 38,14 H 462 V 24 H 474 V 36 H 486 V 304 H 474 V 316 H 462 V 326 H 38 V 316 H 26 V 304 H 14 V 36 H 26 V 24 H 38 Z
            M 46,24 V 32 H 34 V 44 H 24 V 296 H 34 V 308 H 46 V 316 H 454 V 308 H 466 V 296 H 476 V 44 H 466 V 32 H 454 V 24 Z
          "
        />

        {/* Rotated Logo Group (-16 deg, matching logo_flip_7.png) */}
        <g transform="translate(250, 175) rotate(-16)">
          {/* 7 Fanned Cards peeking out above the banner */}
          <g transform="translate(-38, -50)">
            {FAN_CARDS.map((card, idx) => (
              <g
                key={idx}
                className={animated ? "logo-fan-card" : ""}
                style={
                  animated
                    ? ({
                        "--target-rot": `${card.rotate}deg`,
                        animationDelay: card.delay,
                      } as React.CSSProperties)
                    : undefined
                }
                transform={`translate(${card.x}, ${card.y}) rotate(${card.rotate})`}
              >
                <rect
                  x="-26"
                  y="-54"
                  width="52"
                  height="80"
                  rx="8"
                  fill={card.color}
                  stroke="#1d204d"
                  strokeWidth="4"
                />
                {/* Inner subtle card highlight */}
                <rect
                  x="-20"
                  y="-48"
                  width="40"
                  height="68"
                  rx="4"
                  fill="none"
                  stroke="#1d204d"
                  strokeOpacity="0.2"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </g>

          {/* Diagonal Cream Banner Strip */}
          <g filter="url(#logoShadow)">
            <rect
              x="-340"
              y="-56"
              width="680"
              height="122"
              fill="#fcf8e3"
              stroke="#1d204d"
              strokeWidth="5"
            />
            {/* Inner Turquoise Pinstripes (top and bottom of banner) */}
            <line
              x1="-340"
              y1="-47"
              x2="340"
              y2="-47"
              stroke="#48b8b8"
              strokeWidth="3"
            />
            <line
              x1="-340"
              y1="57"
              x2="340"
              y2="57"
              stroke="#48b8b8"
              strokeWidth="3"
            />
          </g>

          {/* Multi-layered "FLIP" lettering */}
          <g transform="translate(-52, 16) skewX(-8)">
            {/* Layer 1: Outer Dark Navy Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "92px",
                letterSpacing: "4px",
                fill: "none",
                stroke: "#1d204d",
                strokeWidth: "20px",
                strokeLinejoin: "round",
              }}
            >
              FLIP
            </text>
            {/* Layer 2: Middle Crimson Red Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "92px",
                letterSpacing: "4px",
                fill: "none",
                stroke: "#c9382b",
                strokeWidth: "12px",
                strokeLinejoin: "round",
              }}
            >
              FLIP
            </text>
            {/* Layer 3: Inner Dark Navy Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "92px",
                letterSpacing: "4px",
                fill: "none",
                stroke: "#1d204d",
                strokeWidth: "5px",
                strokeLinejoin: "round",
              }}
            >
              FLIP
            </text>
            {/* Layer 4: Golden Yellow Fill */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "92px",
                letterSpacing: "4px",
                fill: "#f5e226",
              }}
            >
              FLIP
            </text>
          </g>

          {/* Giant "7" breaking out above the top of the banner */}
          <g transform="translate(106, 26) skewX(-8)">
            {/* Layer 1: Outer Dark Navy Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "152px",
                fill: "none",
                stroke: "#1d204d",
                strokeWidth: "24px",
                strokeLinejoin: "round",
              }}
            >
              7
            </text>
            {/* Layer 2: Middle Crimson Red Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "152px",
                fill: "none",
                stroke: "#c9382b",
                strokeWidth: "15px",
                strokeLinejoin: "round",
              }}
            >
              7
            </text>
            {/* Layer 3: Inner Dark Navy Stroke */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "152px",
                fill: "none",
                stroke: "#1d204d",
                strokeWidth: "6px",
                strokeLinejoin: "round",
              }}
            >
              7
            </text>
            {/* Layer 4: Golden Yellow Fill */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-oswald font-bold"
              style={{
                fontSize: "152px",
                fill: "#f5e226",
              }}
            >
              7
            </text>
          </g>

          {/* Subtitle: „DAS BESTE KARTENSPIEL ALLER ZEITEN!“* */}
          <text
            x="-45"
            y="43"
            textAnchor="middle"
            className="font-oswald font-bold"
            style={{
              fontSize: "13.5px",
              letterSpacing: "1.4px",
              fill: "#1d204d",
            }}
          >
            „DAS BESTE KARTENSPIEL ALLER ZEITEN!“*
          </text>
        </g>
      </svg>
    </div>
  );
};
