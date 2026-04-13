#!/bin/bash
# WiFi Audit Lab - Iniciar servicios

echo "════════════════════════════════════════════════════════"
echo "   🛡️ WiFi Audit Lab - Iniciando servicios"
echo "════════════════════════════════════════════════════════"

cd ~/wifi-audit-lab

# Verificar Redis
if ! systemctl is-active --quiet redis-server; then
    echo "📡 Iniciando Redis..."
    sudo systemctl start redis-server
fi

# Iniciar backend
echo "🚀 Iniciando backend (puerto 8000)..."
cd ~/wifi-audit-lab/backend
source venv/bin/activate
sudo ./venv/bin/python3 wifi_scanner.py &
BACKEND_PID=$!
echo "   ✅ Backend PID: $BACKEND_PID"

sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend (puerto 3001)..."
cd ~/wifi-audit-lab
PORT=3001 npm start &
FRONTEND_PID=$!
echo "   ✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Servicios iniciados"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:8000"
echo ""
echo "📋 Para detener: ./stop.sh"
echo ""

# Guardar PIDs
echo $BACKEND_PID > /tmp/wifi-backend.pid
echo $FRONTEND_PID > /tmp/wifi-frontend.pid

wait
