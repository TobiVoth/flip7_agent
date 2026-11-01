"use client";

import React from "react";

export type CardVariant =
  | "number"
  | "bonus"
  | "action-double"
  | "action-single"
  | "back";

export interface Flip7CardProps {
  variant: CardVariant;
  value?: string | number;
  label?: string;
  subtext?: string;
  icon?: "heart" | "lock" | "cards";
  line1?: string;
  line2?: string;
  topText?: string;
  bottomText?: string;
  accentColor?: string;
  bgMain?: string;
  bgCenter?: string;
  remainingCount?: number;
  maxCount?: number;
  isInHand?: boolean;
  hasSecondChance?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  badgeMode?: "interactive" | "none" | "hand";
}

export const Flip7Card: React.FC<Flip7CardProps> = ({
  variant,
  value = "0",
  label = "",
  subtext = "",
  icon,
  line1 = "",
  line2 = "",
  topText = "",
  bottomText = "",
  accentColor = "#48b8b8",
  bgMain = "#efe6c2",
  bgCenter = "#fbf7e6",
  remainingCount,
  isInHand = false,
  hasSecondChance = false,
  onClick,
  disabled = false,
  className = "",
  badgeMode = "interactive",
}) => {
  const valStr = String(value);
  const isDoubleDigit = valStr.length > 1;
  const isBonusDouble = valStr.length > 2;

  const styleVars = {
    "--accent-color": accentColor,
    "--frame-gold": "#e6d130",
    "--outline-dark": "#232755",
    "--bg-main": bgMain,
    "--bg-center": bgCenter,
    "--banner-bg": "#fcf8e3",
  } as React.CSSProperties;

  const renderBaseFrame = () => (
    <>
      <path
        className="fill-accent stroke-dark"
        d="M 55,0 A 35,32 0 0,0 125,0 L 116,0 A 26,23 0 0,1 64,0 Z"
      />
      <path
        className="fill-accent stroke-dark"
        d="M 55,250 A 35,32 0 0,1 125,250 L 116,250 A 26,23 0 0,0 64,250 Z"
      />
      <path
        className="fill-gold stroke-dark"
        d="M 26,12 H 76 V 19 H 30 V 26 H 21 V 34 H 14 V 216 H 21 V 224 H 30 V 231 H 76 V 238 H 26 V 230 H 17 V 222 H 8 V 28 H 17 V 20 H 26 Z M 154,12 H 104 V 19 H 150 V 26 H 159 V 34 H 166 V 216 H 159 V 224 H 150 V 231 H 104 V 238 H 154 V 230 H 163 V 222 H 172 V 28 H 163 V 20 H 154 Z"
      />
    </>
  );

  const renderMiniShell = () => (
    <>
      <path
        d="M -22,0 Q -18,-12 0,-2 L 0,0 Z"
        fill="#d9534f"
        className="stroke-dark"
      />
      <path
        d="M -14,0 Q -9,-17 0,-3 L 0,0 Z"
        fill="#fcf8e3"
        className="stroke-dark"
      />
      <path
        d="M -5,0 Q 0,-20 5,0 Z"
        fill="#d9534f"
        className="stroke-dark"
      />
      <path
        d="M 14,0 Q 9,-17 0,-3 L 0,0 Z"
        fill="#fcf8e3"
        className="stroke-dark"
      />
      <path
        d="M 22,0 Q 18,-12 0,-2 L 0,0 Z"
        fill="#d9534f"
        className="stroke-dark"
      />
      <rect
        x="-24"
        y="0"
        width="48"
        height="4.5"
        rx="2"
        className="fill-gold stroke-dark"
      />
    </>
  );

  const renderActionIcons = () => {
    if (icon === "heart") {
      const heart = (
        <>
          <path
            d="M 0,10 C 0,-8 -25,-8 -25,8 C -25,22 0,32 0,40 C 0,32 25,22 25,8 C 25,-8 0,-8 0,10 Z"
            fill="#d96b70"
            stroke="var(--outline-dark)"
            strokeWidth="2.2"
          />
          <path
            d="M 0,13 C 0,-3 -20,-3 -20,8 C -20,19 0,27 0,34 C 0,27 20,19 20,8 C 20,-3 0,-3 0,13 Z"
            fill="none"
            stroke="var(--outline-dark)"
            strokeWidth="1.2"
          />
        </>
      );
      return (
        <>
          <g transform="translate(42, 34)">{heart}</g>
          <g transform="translate(138, 180)">{heart}</g>
        </>
      );
    }

    if (icon === "lock") {
      const lock = (
        <>
          <path
            d="M -11,0 V -10 A 11,11 0 0,1 11,-10 V 0"
            fill="none"
            stroke="var(--outline-dark)"
            strokeWidth="4.5"
          />
          <path
            d="M -11,0 V -10 A 11,11 0 0,1 11,-10 V 0"
            fill="none"
            stroke="#9daab6"
            strokeWidth="2"
          />
          <rect
            x="-17"
            y="0"
            width="34"
            height="30"
            rx="10"
            fill="#8b97a5"
            stroke="var(--outline-dark)"
            strokeWidth="2.2"
          />
          <circle cx="0" cy="12" r="3.5" fill="var(--outline-dark)" />
          <polygon points="-2,13 2,13 4,23 -4,23" fill="var(--outline-dark)" />
        </>
      );
      const bolt = (
        <g transform="rotate(-15)">
          <text x="0" y="-11" className="sub-text" style={{ fontSize: "6px" }}>
            SOFORT-
          </text>
          <polygon
            points="-18,-7 6,-7 -2,2 18,2 -14,13 -4,4 -18,4"
            fill="#2c4a9a"
            stroke="var(--outline-dark)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <text x="2" y="21" className="sub-text" style={{ fontSize: "6px" }}>
            AKTION
          </text>
        </g>
      );
      return (
        <>
          <g transform="translate(44, 52)">{lock}</g>
          <g transform="translate(136, 174)">{lock}</g>
          <g transform="translate(128, 56)">{bolt}</g>
          <g transform="translate(52, 192)">{bolt}</g>
        </>
      );
    }

    if (icon === "cards") {
      const cards = (
        <>
          <rect
            x="-14"
            y="-15"
            width="18"
            height="28"
            rx="2"
            transform="rotate(-15)"
            fill="#d9534f"
            stroke="var(--outline-dark)"
            strokeWidth="2"
          />
          <rect
            x="-6"
            y="-16"
            width="18"
            height="28"
            rx="2"
            transform="rotate(4)"
            fill="#fcf8e3"
            stroke="var(--outline-dark)"
            strokeWidth="2"
          />
          <rect
            x="2"
            y="-14"
            width="18"
            height="28"
            rx="2"
            transform="rotate(22)"
            fill="#9daab6"
            stroke="var(--outline-dark)"
            strokeWidth="2"
          />
        </>
      );
      const bolt = (
        <g transform="rotate(-15)">
          <text x="0" y="-11" className="sub-text" style={{ fontSize: "6px" }}>
            SOFORT-
          </text>
          <polygon
            points="-18,-7 6,-7 -2,2 18,2 -14,13 -4,4 -18,4"
            fill="#f08c2b"
            stroke="var(--outline-dark)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <text x="2" y="21" className="sub-text" style={{ fontSize: "6px" }}>
            AKTION
          </text>
        </g>
      );
      return (
        <>
          <g transform="translate(46, 56)">{cards}</g>
          <g transform="translate(134, 188)">{cards}</g>
          <g transform="translate(128, 56)">{bolt}</g>
          <g transform="translate(52, 192)">{bolt}</g>
        </>
      );
    }

    return null;
  };

  const renderInnerContent = () => {
    if (variant === "number") {
      const numClass = isDoubleDigit
        ? "card-number is-double-digit"
        : "card-number";
      return (
        <>
          <g className="fill-accent stroke-dark">
            <path d="M 0,55 Q 16,60 12,72 L 0,95 Z" />
            <path d="M 0,68 Q 22,74 17,86 L 0,105 Z" />
            <path d="M 0,82 Q 26,88 20,101 L 0,115 Z" />
            <path d="M 0,98 Q 26,104 20,117 L 0,126 Z" />
            <path d="M 0,115 Q 23,120 17,132 L 0,138 Z" />
            <path d="M 0,130 Q 17,135 12,146 L 0,149 Z" />
          </g>
          <g
            className="fill-accent stroke-dark"
            transform="translate(180, 0) scale(-1, 1)"
          >
            <path d="M 0,55 Q 16,60 12,72 L 0,95 Z" />
            <path d="M 0,68 Q 22,74 17,86 L 0,105 Z" />
            <path d="M 0,82 Q 26,88 20,101 L 0,115 Z" />
            <path d="M 0,98 Q 26,104 20,117 L 0,126 Z" />
            <path d="M 0,115 Q 23,120 17,132 L 0,138 Z" />
            <path d="M 0,130 Q 17,135 12,146 L 0,149 Z" />
          </g>
          <g className="fill-banner stroke-dark">
            <polygon points="7,162 17,166 17,174 7,170" />
            <polygon points="6,176 18,180 18,189 6,185" />
            <polygon points="173,162 163,166 163,174 173,170" />
            <polygon points="174,176 162,180 162,189 174,185" />
          </g>
          <g transform="translate(90, 102) skewX(-6)">
            <text className={`${numClass} number-outline-outer`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${numClass} number-outline-gold`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${numClass} number-outline-inner`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${numClass} number-fill`} dy="0.36em">
              {valStr}
            </text>
          </g>
          <rect
            className="fill-banner stroke-dark"
            x="7"
            y="193"
            width="166"
            height="30"
          />
          <line
            stroke="#e6d130"
            strokeWidth="2"
            x1="9"
            y1="196"
            x2="171"
            y2="196"
          />
          <line
            stroke="#e6d130"
            strokeWidth="2"
            x1="9"
            y1="220"
            x2="171"
            y2="220"
          />
          <text className="card-label" x="90" y="214">
            {label}
          </text>
        </>
      );
    }

    if (variant === "bonus") {
      const bonusClass = isBonusDouble
        ? "card-number is-bonus-double"
        : "card-number is-bonus";
      return (
        <>
          <g transform="translate(90, 48)">{renderMiniShell()}</g>
          <text className="sub-text" x="90" y="64">
            {subtext}
          </text>
          <g transform="translate(88, 125) skewX(-6)">
            <text className={`${bonusClass} number-outline-outer`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${bonusClass} number-outline-gold`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${bonusClass} number-outline-inner`} dy="0.36em">
              {valStr}
            </text>
            <text className={`${bonusClass} number-fill`} dy="0.36em">
              {valStr}
            </text>
          </g>
          <text className="sub-text" x="90" y="191">
            {subtext}
          </text>
          <g transform="translate(90, 202) scale(1, -1)">
            {renderMiniShell()}
          </g>
        </>
      );
    }

    if (variant === "action-double") {
      return (
        <>
          {renderActionIcons()}
          <polygon
            points="8,136 172,94 172,114 8,156"
            fill="#9daab6"
            className="stroke-dark"
          />
          <g transform="translate(90, 96) rotate(-14)">
            <text className="sub-text" x="0" y="-23">
              {topText}
            </text>
            <rect
              x="-85"
              y="-17"
              width="170"
              height="34"
              className="fill-banner stroke-dark"
            />
            <text className="action-title" x="0" y="9">
              {line1}
            </text>
          </g>
          <g transform="translate(90, 154) rotate(-14)">
            <rect
              x="-85"
              y="-17"
              width="170"
              height="34"
              className="fill-banner stroke-dark"
            />
            <text className="action-title" x="0" y="9">
              {line2}
            </text>
            <text className="sub-text" x="0" y="28">
              {bottomText}
            </text>
          </g>
          <g className="fill-banner stroke-dark">
            <polygon points="161,55 173,51 173,59 161,63" />
            <polygon points="161,66 173,62 173,70 161,74" />
            <polygon points="7,178 19,174 19,182 7,186" />
            <polygon points="7,189 19,185 19,193 7,197" />
          </g>
        </>
      );
    }

    if (variant === "action-single") {
      return (
        <>
          {renderActionIcons()}
          <g transform="translate(90, 125) rotate(-14)">
            <text className="sub-text" x="0" y="-25">
              {topText}
            </text>
            <rect
              x="-85"
              y="-19"
              width="170"
              height="38"
              className="fill-banner stroke-dark"
            />
            <text className="action-title" x="0" y="10">
              {line1}
            </text>
            <text className="sub-text" x="0" y="30">
              {bottomText}
            </text>
          </g>
          <g className="fill-banner stroke-dark">
            <polygon points="161,80 173,76 173,84 161,88" />
            <polygon points="161,91 173,87 173,95 161,99" />
            <polygon points="7,151 19,147 19,155 7,159" />
            <polygon points="7,162 19,158 19,166 7,170" />
          </g>
        </>
      );
    }

    if (variant === "back") {
      return (
        <>
          <g transform="translate(72, 92) rotate(-14) scale(1.25)">
            {renderMiniShell()}
          </g>
          <g transform="translate(90, 130) rotate(-14)">
            <rect
              x="-85"
              y="-24"
              width="170"
              height="42"
              className="fill-banner stroke-dark"
            />
            <text
              className="action-title"
              style={{ fill: "#e6d130", fontSize: "32px" }}
              x="-16"
              y="9"
            >
              FLIP
            </text>
            <g transform="translate(52, -2)">
              <text
                className="card-number is-bonus number-outline-outer"
                style={{ fontSize: "72px" }}
                dy="0.32em"
              >
                7
              </text>
              <text
                className="card-number is-bonus number-outline-gold"
                style={{ fontSize: "72px" }}
                dy="0.32em"
              >
                7
              </text>
              <text
                className="card-number is-bonus number-fill"
                style={{ fontSize: "72px" }}
                dy="0.32em"
              >
                7
              </text>
            </g>
          </g>
        </>
      );
    }

    return null;
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      disabled={disabled}
      onClick={onClick}
      style={styleVars}
      className={`flip7-svg-card group relative select-none overflow-hidden rounded-[10px] transition-all duration-150 ${
        onClick && !disabled
          ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_10px_22px_rgba(35,39,85,0.55)] active:translate-y-0.5 active:scale-[0.97]"
          : ""
      } ${
        disabled
          ? "opacity-35 grayscale-[45%] cursor-not-allowed"
          : "shadow-[0_5px_12px_rgba(35,39,85,0.4)]"
      } ${
        isInHand
          ? hasSecondChance
            ? "ring-4 ring-[#e6d130] ring-offset-2 ring-offset-[#1d2149]"
            : "ring-4 ring-[#d62c2c] ring-offset-2 ring-offset-[#1d2149]"
          : ""
      } ${className}`}
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 180 250"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderBaseFrame()}
        {renderInnerContent()}
      </svg>

      {/* Remaining Count Badge */}
      {badgeMode === "interactive" && remainingCount !== undefined && (
        <div
          className={`absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-md border-2 border-[#232755] font-oswald text-[11px] sm:text-xs font-bold leading-none shadow-md transition-transform group-hover:scale-105 ${
            remainingCount === 0
              ? "bg-slate-700 text-slate-300"
              : "bg-[#232755] text-[#e6d130]"
          }`}
        >
          {remainingCount}×
        </div>
      )}

      {/* In-Hand Bust Warning Badge */}
      {badgeMode === "interactive" && isInHand && (
        <div
          className={`absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md border-2 border-[#232755] font-oswald text-[9px] sm:text-[10px] uppercase tracking-wider font-bold leading-none shadow-md ${
            hasSecondChance
              ? "bg-[#e6d130] text-[#232755]"
              : "bg-[#d62c2c] text-white animate-pulse"
          }`}
        >
          {hasSecondChance ? "♥ Schutz" : "⚡ Gefahr"}
        </div>
      )}
    </Component>
  );
};
