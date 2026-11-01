from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
import os
import numpy as np
import torch
from stable_baselines3 import PPO

app = FastAPI(title="Flip 7 AI Assistant API")

# CORS freigeben
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# PPO-Modell einmalig beim Start in den Speicher laden (wird von allen Geräte-Sessions geteilt)
SHARED_MODEL = PPO.load("flip7_agent")
SESSIONS_FILE = "sessions_data.json"


class CardAction(BaseModel):
    card: str
    target: str  # "me" (Meine Hand) oder "other" (Mitspieler)


class GameState:
    def __init__(self):
        self.model = SHARED_MODEL
        self.history = []
        self.reset_deck()
        self.reset_hand()

    def reset_deck(self):
        """Setzt das komplette 94-Karten-Deck zurück."""
        self.deck_counts = {f"NUM_{i}": (1 if i == 0 else i) for i in range(13)}
        for b in ["2", "4", "6", "8", "10", "X2"]:
            self.deck_counts[f"BONUS_{b}"] = 1
        for a in ["SECOND_CHANCE", "FLIP_THREE", "FREEZE"]:
            self.deck_counts[f"ACT_{a}"] = 3

    def reset_hand(self):
        """Leert nur die eigene Hand für die nächste Runde (Deck bleibt gezählt)."""
        self.hand_numbers = np.zeros(13, dtype=np.int32)
        self.has_second_chance = False
        self.has_x2 = False
        self.bonus_cards = []
        self.busted = False

    def save_snapshot(self):
        """Speichert den Zustand für die 'Rückgängig'-Funktion."""
        self.history.append({
            "deck_counts": self.deck_counts.copy(),
            "hand_numbers": self.hand_numbers.copy(),
            "has_second_chance": self.has_second_chance,
            "has_x2": self.has_x2,
            "bonus_cards": self.bonus_cards.copy(),
            "busted": self.busted,
        })

    def undo(self):
        if self.history:
            last = self.history.pop()
            self.deck_counts = last["deck_counts"]
            self.hand_numbers = last["hand_numbers"]
            self.has_second_chance = last["has_second_chance"]
            self.has_x2 = last["has_x2"]
            self.bonus_cards = last["bonus_cards"]
            self.busted = last["busted"]

    def add_card(self, card: str, is_me: bool):
        if self.deck_counts.get(card, 0) <= 0:
            return
        self.save_snapshot()
        self.deck_counts[card] -= 1

        if is_me:
            if card.startswith("NUM_"):
                num = int(card.split("_")[1])
                if self.hand_numbers[num] == 1:
                    if self.has_second_chance:
                        self.has_second_chance = False
                    else:
                        self.busted = True
                else:
                    self.hand_numbers[num] = 1
            elif card == "BONUS_X2":
                self.has_x2 = True
            elif card.startswith("BONUS_"):
                val = int(card.split("_")[1])
                self.bonus_cards.append(val)
            elif card == "ACT_SECOND_CHANCE":
                self.has_second_chance = True

    def get_obs(self) -> np.ndarray:
        obs = np.zeros(35, dtype=np.float32)
        obs[0:13] = self.hand_numbers
        obs[13] = 1.0 if self.has_second_chance else 0.0
        obs[14] = 1.0 if self.has_x2 else 0.0
        obs[15] = sum(self.bonus_cards) / 30.0
        obs[16] = sum(self.hand_numbers) / 7.0

        max_counts = [1 if i == 0 else i for i in range(13)]
        for i in range(13):
            obs[17 + i] = self.deck_counts[f"NUM_{i}"] / max_counts[i]

        obs[30] = self.deck_counts["ACT_SECOND_CHANCE"] / 3.0
        obs[31] = self.deck_counts["ACT_FLIP_THREE"] / 3.0
        obs[32] = self.deck_counts["ACT_FREEZE"] / 3.0
        return obs

    def get_status(self) -> dict:
        obs = self.get_obs()
        obs_tensor, _ = self.model.policy.obs_to_tensor(obs)
        with torch.no_grad():
            dist = self.model.policy.get_distribution(obs_tensor)
            probs = dist.distribution.probs.cpu().numpy()[0]
            expected_val = float(self.model.policy.predict_values(obs_tensor).cpu().numpy()[0][0])

        # Aktuelle Punkte nach Flip-7-Regelwerk berechnen
        if self.busted:
            score = 0
        else:
            num_sum = sum(i for i in range(13) if self.hand_numbers[i] == 1)
            if self.has_x2:
                num_sum *= 2
            score = num_sum + sum(self.bonus_cards)
            if sum(self.hand_numbers) >= 7:
                score += 15

        # Exaktes mathematisches Überkauf-Risiko berechnen
        total_rem = sum(self.deck_counts.values())
        if total_rem > 0 and not self.has_second_chance and not self.busted:
            bust_cards = sum(self.deck_counts[f"NUM_{i}"] for i in range(13) if self.hand_numbers[i] == 1)
            bust_risk = (bust_cards / total_rem) * 100.0
        else:
            bust_risk = 0.0

        is_flip7 = int(sum(self.hand_numbers)) >= 7
        prob_stop = 100.0 if (self.busted or is_flip7) else float(round(probs[0] * 100, 1))
        prob_hit = 0.0 if (self.busted or is_flip7) else float(round(probs[1] * 100, 1))

        return {
            "hand_numbers": [i for i in range(13) if self.hand_numbers[i] == 1],
            "unique_count": int(sum(self.hand_numbers)),
            "has_second_chance": self.has_second_chance,
            "has_x2": self.has_x2,
            "bonus_cards": self.bonus_cards,
            "bonus_sum": int(sum(self.bonus_cards)),
            "busted": self.busted,
            "flip7": is_flip7,
            "current_score": int(score),
            "remaining_total": int(total_rem),
            "deck_counts": self.deck_counts,
            "bust_risk": float(round(bust_risk, 1)),
            "prob_stop": prob_stop,
            "prob_hit": prob_hit,
            "expected_value": float(round(expected_val, 1)),
            "recommendation": "VERZOCKT!" if self.busted else ("FLIP 7!" if is_flip7 else ("NOCH EINE" if prob_hit >= prob_stop else "STOPP")),
        }

    def to_dict(self) -> dict:
        return {
            "deck_counts": self.deck_counts,
            "hand_numbers": self.hand_numbers.tolist(),
            "has_second_chance": self.has_second_chance,
            "has_x2": self.has_x2,
            "bonus_cards": self.bonus_cards,
            "busted": self.busted,
            "history": [
                {
                    "deck_counts": snap["deck_counts"],
                    "hand_numbers": snap["hand_numbers"].tolist(),
                    "has_second_chance": snap["has_second_chance"],
                    "has_x2": snap["has_x2"],
                    "bonus_cards": snap["bonus_cards"],
                    "busted": snap["busted"],
                }
                for snap in self.history[-40:]  # Letzte 40 Schritte pro Gerät behalten
            ],
        }

    @classmethod
    def from_dict(cls, data: dict) -> "GameState":
        gs = cls()
        gs.deck_counts = data.get("deck_counts", gs.deck_counts)
        gs.hand_numbers = np.array(data.get("hand_numbers", [0] * 13), dtype=np.int32)
        gs.has_second_chance = bool(data.get("has_second_chance", False))
        gs.has_x2 = bool(data.get("has_x2", False))
        gs.bonus_cards = list(data.get("bonus_cards", []))
        gs.busted = bool(data.get("busted", False))
        gs.history = [
            {
                "deck_counts": snap["deck_counts"],
                "hand_numbers": np.array(snap["hand_numbers"], dtype=np.int32),
                "has_second_chance": bool(snap["has_second_chance"]),
                "has_x2": bool(snap["has_x2"]),
                "bonus_cards": list(snap["bonus_cards"]),
                "busted": bool(snap["busted"]),
            }
            for snap in data.get("history", [])
        ]
        return gs


# Verwaltet für jedes Gerät (anhand der X-Session-ID) einen eigenen Spielstand
sessions: dict[str, GameState] = {}


def load_sessions_from_disk():
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
            for sid, sdata in raw.items():
                sessions[sid] = GameState.from_dict(sdata)
        except Exception as e:
            print(f"[Flip 7] Konnte gespeicherte Sessions nicht laden: {e}")


def save_sessions_to_disk():
    try:
        # Maximal die letzten 200 Geräte-Sessions speichern
        recent_keys = list(sessions.keys())[-200:]
        raw = {sid: sessions[sid].to_dict() for sid in recent_keys}
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(raw, f)
    except Exception as e:
        print(f"[Flip 7] Konnte Sessions nicht speichern: {e}")


def get_session(session_id: str) -> GameState:
    sid = (session_id or "default").strip()[:64]
    if sid not in sessions:
        sessions[sid] = GameState()
        save_sessions_to_disk()
    return sessions[sid]


load_sessions_from_disk()


@app.get("/")
def serve_frontend():
    return FileResponse("index.html")


@app.get("/api/state")
def get_state(x_session_id: str = Header(default="default")):
    state = get_session(x_session_id)
    return state.get_status()


@app.post("/api/card")
def play_card(action: CardAction, x_session_id: str = Header(default="default")):
    state = get_session(x_session_id)
    state.add_card(action.card, is_me=(action.target == "me"))
    save_sessions_to_disk()
    return state.get_status()


@app.post("/api/undo")
def undo_last(x_session_id: str = Header(default="default")):
    state = get_session(x_session_id)
    state.undo()
    save_sessions_to_disk()
    return state.get_status()


@app.post("/api/reset_round")
def reset_round(x_session_id: str = Header(default="default")):
    state = get_session(x_session_id)
    state.save_snapshot()
    state.reset_hand()
    save_sessions_to_disk()
    return state.get_status()


@app.post("/api/reset_deck")
def reset_deck(x_session_id: str = Header(default="default")):
    state = get_session(x_session_id)
    state.save_snapshot()
    state.reset_deck()
    state.reset_hand()
    save_sessions_to_disk()
    return state.get_status()
