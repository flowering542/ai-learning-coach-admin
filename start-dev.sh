#!/bin/bash
cd /root/.openclaw/workspace/ai-learning-coach-admin
export DATA_DIR="../ai-learning-coach/data"
export JWT_SECRET="coach-admin-secret-key-2025"
export PORT=3002
export HOST=0.0.0.0

# 使用npx直接启动，绑定所有IP
npx next dev -H 0.0.0.0 -p 3002
