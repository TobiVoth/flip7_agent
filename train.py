from stable_baselines3 import PPO
from flip7_env import Flip7Env

# Umgebung ohne Konsolen-Ausgabe für schnelles Training starten
train_env = Flip7Env(render_mode=None)

# PPO-Agent initialisieren und für 300.000 Schritte trainieren


model = PPO("MlpPolicy", train_env, verbose=1, tensorboard_log="./flip7_tensorboard/")
model.learn(total_timesteps=100_000)
model.save("flip7_agent")