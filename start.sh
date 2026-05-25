#!/bin/bash
echo "🐾 Pawstagram başlatılıyor..."

# Server
cd "$(dirname "$0")/server"
node index.js &
SERVER_PID=$!
echo "✅ Server başlatıldı (PID: $SERVER_PID) → http://localhost:3001"

# Client
cd "$(dirname "$0")/client"
npx vite &
CLIENT_PID=$!
echo "✅ Client başlatıldı (PID: $CLIENT_PID) → http://localhost:5173"

echo ""
echo "🌐 Uygulamayı aç: http://localhost:5173"
echo "🎭 Demo giriş: whisker_mom / demo1234"
echo ""
echo "Durdurmak için Ctrl+C"

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo 'Durduruldu.'" EXIT
wait
