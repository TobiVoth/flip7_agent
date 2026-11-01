# ==============================================================================
# Stage 1: Next.js Frontend bauen (Standalone Build)
# ==============================================================================
FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
RUN npm run build


# ==============================================================================
# Stage 2: Kombinierter Runtime-Container (Python FastAPI + Next.js Server)
# ==============================================================================
FROM python:3.12-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    INTERNAL_API_URL=http://127.0.0.1:8000 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# Node.js für den Next.js-Server installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get purge -y --auto-remove gnupg \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten installieren (PyTorch CPU-Version für schlankes Image)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch \
    && pip install --no-cache-dir -r /app/requirements.txt

# Python-API und trainiertes PPO-Modell kopieren
COPY api.py /app/api.py
COPY flip7_agent.zip /app/flip7_agent.zip

# Gebautes Next.js Standalone-Frontend aus Stage 1 kopieren
COPY --from=frontend-builder /frontend/.next/standalone /app/frontend
COPY --from=frontend-builder /frontend/.next/static /app/frontend/.next/static

# Start-Skript erzeugen:
# 1. Startet die Python-API strikt auf 127.0.0.1:8000 (nur container-intern erreichbar!)
# 2. Wartet kurz, bis die API bereit ist
# 3. Startet den Next.js-Server öffentlich auf 0.0.0.0:3000
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
echo "[Flip 7] Starte interne Python FastAPI auf 127.0.0.1:8000 (nicht von außen erreichbar)..."\n\
python -m uvicorn api:app --host 127.0.0.1 --port 8000 &\n\
API_PID=$!\n\
\n\
echo "[Flip 7] Warte auf Initialisierung des PPO-Modells..."\n\
for i in $(seq 1 30); do\n\
  if curl -sf http://127.0.0.1:8000/api/state > /dev/null 2>&1; then\n\
    echo "[Flip 7] Python-API ist bereit!"\n\
    break\n\
  fi\n\
  sleep 1\n\
done\n\
\n\
echo "[Flip 7] Starte Next.js Webseite auf 0.0.0.0:3000..."\n\
cd /app/frontend\n\
HOSTNAME=0.0.0.0 PORT=3000 node server.js &\n\
WEB_PID=$!\n\
\n\
# Beende Container sauber, falls einer der beiden Prozesse abstürzt\n\
wait -n $API_PID $WEB_PID\n\
exit $?\n' > /app/start.sh && chmod +x /app/start.sh

# NUR Port 3000 (Next.js Webseite) wird nach außen geöffnet!
# Port 8000 (Python API) bleibt geschützt auf 127.0.0.1 im Container.
EXPOSE 3000

CMD ["/app/start.sh"]
