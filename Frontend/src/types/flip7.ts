export interface GameStateData {
  hand_numbers: number[];
  unique_count: number;
  has_second_chance: boolean;
  has_x2: boolean;
  bonus_cards: number[];
  bonus_sum: number;
  busted: boolean;
  flip7: boolean | number;
  current_score: number;
  remaining_total: number;
  deck_counts: Record<string, number>;
  bust_risk: number;
  prob_stop: number;
  prob_hit: number;
  expected_value: number;
  recommendation: "VERZOCKT!" | "FLIP 7!" | "NOCH EINE" | "STOPP" | string;
}

export type TargetMode = "me" | "other";

export interface NumberCardMeta {
  key: string;
  value: number;
  label: string;
  accentColor: string;
  maxCount: number;
}

export interface BonusCardMeta {
  key: string;
  value: string;
  numericValue?: number;
  subtext: string;
  bgMain: string;
  bgCenter: string;
  accentColor: string;
  maxCount: number;
}

export interface ActionCardMeta {
  key: string;
  type: "action-double" | "action-single";
  icon: "cards" | "lock" | "heart";
  line1: string;
  line2?: string;
  topText: string;
  bottomText: string;
  bgMain: string;
  bgCenter: string;
  accentColor: string;
  maxCount: number;
  shortLabel: string;
}

export const NUMBER_CARDS: NumberCardMeta[] = [
  { key: "NUM_0", value: 0, label: "NULL", accentColor: "#d83b7c", maxCount: 1 },
  { key: "NUM_1", value: 1, label: "EINS", accentColor: "#9e8fb2", maxCount: 1 },
  { key: "NUM_2", value: 2, label: "ZWEI", accentColor: "#cddc39", maxCount: 2 },
  { key: "NUM_3", value: 3, label: "DREI", accentColor: "#e9596c", maxCount: 3 },
  { key: "NUM_4", value: 4, label: "VIER", accentColor: "#48b8b8", maxCount: 4 },
  { key: "NUM_5", value: 5, label: "FÜNF", accentColor: "#2eb85c", maxCount: 5 },
  { key: "NUM_6", value: 6, label: "SECHS", accentColor: "#9c4cad", maxCount: 6 },
  { key: "NUM_7", value: 7, label: "SIEBEN", accentColor: "#c97a7e", maxCount: 7 },
  { key: "NUM_8", value: 8, label: "ACHT", accentColor: "#8ac97a", maxCount: 8 },
  { key: "NUM_9", value: 9, label: "NEUN", accentColor: "#f59e2d", maxCount: 9 },
  { key: "NUM_10", value: 10, label: "ZEHN", accentColor: "#d62c2c", maxCount: 10 },
  { key: "NUM_11", value: 11, label: "ELF", accentColor: "#5c7ec9", maxCount: 11 },
  { key: "NUM_12", value: 12, label: "ZWÖLF", accentColor: "#8c7b99", maxCount: 12 },
];

export const BONUS_CARDS: BonusCardMeta[] = [
  {
    key: "BONUS_X2",
    value: "x2",
    subtext: "DIE SUMME DEINER ZAHLENKARTEN x2",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
  {
    key: "BONUS_2",
    value: "+2",
    numericValue: 2,
    subtext: "DIE SUMME DEINER ZAHLENKARTEN +2",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
  {
    key: "BONUS_4",
    value: "+4",
    numericValue: 4,
    subtext: "DIE SUMME DEINER ZAHLENKARTEN +4",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
  {
    key: "BONUS_6",
    value: "+6",
    numericValue: 6,
    subtext: "DIE SUMME DEINER ZAHLENKARTEN +6",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
  {
    key: "BONUS_8",
    value: "+8",
    numericValue: 8,
    subtext: "DIE SUMME DEINER ZAHLENKARTEN +8",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
  {
    key: "BONUS_10",
    value: "+10",
    numericValue: 10,
    subtext: "DIE SUMME DEINER ZAHLENKARTEN +10",
    bgMain: "#eea644",
    bgCenter: "#f7c97e",
    accentColor: "#d9534f",
    maxCount: 1,
  },
];

export const ACTION_CARDS: ActionCardMeta[] = [
  {
    key: "ACT_SECOND_CHANCE",
    type: "action-double",
    icon: "heart",
    line1: "SECOND",
    line2: "CHANCE",
    topText: "BEHALTE DIESE KARTE",
    bottomText: "BIS DU SIE BRAUCHST",
    bgMain: "#d13a30",
    bgCenter: "#e66057",
    accentColor: "#a6231b",
    maxCount: 3,
    shortLabel: "2nd Chance",
  },
  {
    key: "ACT_FLIP_THREE",
    type: "action-double",
    icon: "cards",
    line1: "FLIP",
    line2: "THREE",
    topText: "SPIELE DIESE KARTE",
    bottomText: "AUF EINE AKTIVE PERSON",
    bgMain: "#e6d117",
    bgCenter: "#f7ea72",
    accentColor: "#d9534f",
    maxCount: 3,
    shortLabel: "Flip Three",
  },
  {
    key: "ACT_FREEZE",
    type: "action-single",
    icon: "lock",
    line1: "FREEZE",
    topText: "SPIELE DIESE KARTE",
    bottomText: "AUF EINE AKTIVE PERSON",
    bgMain: "#72c4ec",
    bgCenter: "#a9def7",
    accentColor: "#2c4a9a",
    maxCount: 3,
    shortLabel: "Freeze",
  },
];
