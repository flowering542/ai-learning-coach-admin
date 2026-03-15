#!/bin/bash
cd /root/.openclaw/workspace/ai-learning-coach-admin
npm run dev > /tmp/admin-dev.log 2>&1 &
echo $! > /tmp/admin-dev.pid
