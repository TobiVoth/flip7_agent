import random
from typing import Optional, Tuple, Dict, Any
import gymnasium as gym
from gymnasium import spaces
import numpy as np


class Flip7Env(gym.Env):
    """
    Gymnasium-Umgebung für das Kartenspiel FLIP 7.
    Modelliert die Entscheidung eines Spielers:
    Action 0 = STOPP (Passen & Punkte sichern)
    Action 1 = NOCH EINE (Karte ziehen)
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self, render_mode: Optional[str] = None, persist_deck: bool = True):
        super().__init__()
        self.render_mode = render_mode
        # Wenn True, wird der Stapel wie im echten Spiel über Runden hinweg
        # weitergenutzt, bis er leer ist (ideal für Kartenzählen).
        self.persist_deck = persist_deck

        # Aktionsraum: 0 = STOPP, 1 = NOCH EINE
        self.action_space = spaces.Discrete(2)

        # Zustandsraum (Observation Space) als 33-dimensionaler Vektor (Werte 0.0 bis 1.0):
        # [0..12]  : Eigene Zahlenkarten 0-12 (0 = nicht vorhanden, 1 = liegt aus)
        # [13]     : Second Chance aktiv (0 oder 1)
        # [14]     : x2 Bonus aktiv (0 oder 1)
        # [15]     : Summe der +Bonuskarten (normiert durch 30.0)
        # [16]     : Anzahl eigener Zahlenkarten (normiert durch 7.0)
        # [17..29] : Verbleibende Karten 0-12 im Stapel (normiert durch jeweilige Maximalanzahl)
        # [30]     : Verbleibende Second Chance im Stapel (normiert durch 3.0)
        # [31]     : Verbleibende Flip Three im Stapel (normiert durch 3.0)
        # [32]     : Verbleibende Freeze im Stapel (normiert durch 3.0)
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(35,), dtype=np.float32
        )

        self.deck = []
        self.discard_pile = []
        self._init_full_deck()

    def _init_full_deck(self):
        """Erstellt das originale 94-Karten-Deck laut Anleitung."""
        cards = ["NUM_0"]
        for num in range(1, 13):
            cards.extend([f"NUM_{num}"] * num)

        cards.extend(["BONUS_2", "BONUS_4", "BONUS_6", "BONUS_8", "BONUS_10", "BONUS_X2"])
        cards.extend(["ACT_FREEZE"] * 3)
        cards.extend(["ACT_SECOND_CHANCE"] * 3)
        cards.extend(["ACT_FLIP_THREE"] * 3)

        random.shuffle(cards)
        self.deck = cards
        self.discard_pile = []

    def _draw_card(self) -> str:
        """Zieht die oberste Karte. Ist der Stapel leer, wird der Ablagestapel gemischt."""
        if len(self.deck) == 0:
            self.deck = self.discard_pile
            self.discard_pile = []
            random.shuffle(self.deck)
        return self.deck.pop()

    def calculate_score(self) -> int:
        """Berechnet den aktuellen Runden-Punktestand laut Regelwerk."""
        if self.busted:
            return 0

        # 1. Zahlenwerte zusammenzählen
        num_sum = sum(i for i in range(13) if self.hand_numbers[i] == 1)

        # 2. Verdopplung durch x2-Karte (nur Zahlenwerte!)
        if self.has_x2:
            num_sum *= 2

        # 3. Bonuskarten (+2 bis +10) addieren
        total = num_sum + self.bonus_points

        # 4. Flip 7 Bonus (+15 Extrapunkte bei 7 verschiedenen Zahlenkarten)
        if sum(self.hand_numbers) >= 7:
            total += 15

        return total

    def _resolve_single_card(self, card: str, in_flip_three: bool = False, queued_actions: list = None):
        """Verarbeitet eine gezogene Karte nach den offiziellen Flip-7-Regeln."""
        self.round_cards.append(card)

        if card.startswith("NUM_"):
            num = int(card.split("_")[1])
            if self.hand_numbers[num] == 1:
                # Duplikat gezogen! Prüfe auf Second Chance
                if self.has_second_chance:
                    self.has_second_chance = False
                else:
                    self.busted = True
                    self.terminated = True
            else:
                self.hand_numbers[num] = 1
                # Prüfe auf Flip 7 (7 verschiedene Zahlenkarten)
                if sum(self.hand_numbers) == 7:
                    self.terminated = True

        elif card == "BONUS_X2":
            self.has_x2 = True

        elif card.startswith("BONUS_"):
            val = int(card.split("_")[1])
            self.bonus_points += val

        elif card == "ACT_SECOND_CHANCE":
            if in_flip_three and queued_actions is not None:
                queued_actions.append(card)
            else:
                # Man darf maximal eine Second Chance vor sich liegen haben
                if not self.has_second_chance:
                    self.has_second_chance = True

        elif card == "ACT_FREEZE":
            if in_flip_three and queued_actions is not None:
                queued_actions.append(card)
            else:
                # Freeze beendet den Zug sofort, sichert aber die Punkte
                self.terminated = True

        elif card == "ACT_FLIP_THREE":
            if in_flip_three and queued_actions is not None:
                queued_actions.append(card)
            else:
                self._execute_flip_three()

    def _execute_flip_three(self):
        """Führt die 'Flip Three'-Karte aus (3 Karten nacheinander ziehen)."""
        queued_actions = []
        for _ in range(3):
            if self.terminated:  # Stoppt sofort bei Verzockt oder Flip 7
                break
            c = self._draw_card()
            self._resolve_single_card(c, in_flip_three=True, queued_actions=queued_actions)

        # Laut Anleitung werden gezogene Aktionskarten erst NACH den 3 Karten ausgeführt
        for act in queued_actions:
            if self.terminated:
                break
            if act == "ACT_SECOND_CHANCE":
                if not self.has_second_chance:
                    self.has_second_chance = True
            elif act == "ACT_FREEZE":
                self.terminated = True
            elif act == "ACT_FLIP_THREE":
                self._execute_flip_three()

    def _get_obs(self) -> np.ndarray:
        """Erzeugt den normalisierten Beobachtungsvektor (State) für die KI (35 Dimensionen)."""
        obs = np.zeros(35, dtype=np.float32)

        # 1. Eigene Handkarten (0 bis 12)
        obs[0:13] = self.hand_numbers

        # 2. Sonderkarten & Status
        obs[13] = 1.0 if self.has_second_chance else 0.0
        obs[14] = 1.0 if self.has_x2 else 0.0
        obs[15] = self.bonus_points / 30.0
        obs[16] = sum(self.hand_numbers) / 7.0

        # 3. Kartenzählen im verbleibenden Deck (Zahlen 0-12)
        max_counts = [1 if i == 0 else i for i in range(13)]
        for i in range(13):
            obs[17 + i] = self.deck.count(f"NUM_{i}") / max_counts[i]

        # 4. Aktionskarten im Deck
        obs[30] = self.deck.count("ACT_SECOND_CHANCE") / 3.0
        obs[31] = self.deck.count("ACT_FLIP_THREE") / 3.0
        obs[32] = self.deck.count("ACT_FREEZE") / 3.0

        # --- NEU: Vorkomputierte Shortcuts für das Netz ---
        # 33. Aktueller sicherer Punktestand (normiert durch 150.0 als realistischen Maximalwert)
        obs[33] = min(self.calculate_score() / 150.0, 1.0)

        # 34. Exakte Überkauf-Wahrscheinlichkeit für den nächsten Zug
        total_rem = len(self.deck)
        if total_rem > 0 and not self.has_second_chance:
            bust_cards = sum(
                self.deck.count(f"NUM_{i}") for i in range(13) if self.hand_numbers[i] == 1
            )
            obs[34] = bust_cards / total_rem
        else:
            obs[34] = 0.0

        return obs

    def _get_info(self) -> Dict[str, Any]:
        """Liefert Zusatzinformationen für Debugging und den Live-Ratgeber."""
        total_rem = len(self.deck)
        if total_rem > 0 and not self.has_second_chance:
            bust_cards = sum(
                self.deck.count(f"NUM_{i}") for i in range(13) if self.hand_numbers[i] == 1
            )
            bust_prob = bust_cards / total_rem
        else:
            bust_prob = 0.0

        return {
            "current_score": self.calculate_score(),
            "unique_numbers": int(sum(self.hand_numbers)),
            "busted": self.busted,
            "bust_probability_next_draw": round(bust_prob, 4),
            "remaining_deck_size": total_rem,
        }

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None) -> Tuple[np.ndarray, dict]:
        super().reset(seed=seed)
        if seed is not None:
            random.seed(seed)

        if not self.persist_deck or len(self.deck) == 0:
            self._init_full_deck()

        # Runden-Variablen zurücksetzen
        self.hand_numbers = np.zeros(13, dtype=np.int32)
        self.has_second_chance = False
        self.has_x2 = False
        self.bonus_points = 0
        self.busted = False
        self.terminated = False
        self.round_cards = []

        # Spielablauf laut Anleitung: Zum Rundenstart erhält jeder 1 Startkarte
        first_card = self._draw_card()
        self._resolve_single_card(first_card)
        self.last_score = self.calculate_score()

        if self.render_mode == "human":
            self.render()

        return self._get_obs(), self._get_info()

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, dict]:
        assert self.action_space.contains(action), f"Ungültige Aktion: {action}"

        if self.terminated:
            return self._get_obs(), 0.0, True, False, self._get_info()

        if action == 0:  # STOPP (Aussteigen & Punkte sichern)
            self.terminated = True
            reward = float(self.calculate_score())
        else:  # NOCH EINE (Ziehen)
            card = self._draw_card()
            self._resolve_single_card(card)

            if self.busted:
                reward = 0.0  # Verzockt -> 0 Punkte für diese Runde
            elif self.terminated:
                # Runde endete durch Flip 7 oder Freeze automatisch mit Punktgewinn
                reward = float(self.calculate_score())
            else:
                # Runde läuft noch: Belohnung wird am Ende der Runde ausgeschüttet
                reward = 0.0

        # Wenn die Runde vorbei ist, wandern die benutzten Karten auf den Ablagestapel
        if self.terminated:
            self.discard_pile.extend(self.round_cards)

        if self.render_mode == "human":
            self.render()

        return self._get_obs(), reward, self.terminated, False, self._get_info()

    def render(self):
        nums = [i for i in range(13) if self.hand_numbers[i] == 1]
        status = "VERZOCKT!" if self.busted else ("BEENDET" if self.terminated else "AKTIV")
        print(
            f"[{status}] Zahlen: {nums} | +Bonus: {self.bonus_points} | "
            f"x2: {self.has_x2} | 2ndChance: {self.has_second_chance} | "
            f"Punkte: {self.calculate_score()}"
        )