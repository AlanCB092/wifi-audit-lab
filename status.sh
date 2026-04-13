#!/bin/bash
# WiFi Audit Lab - Ver estado de servicios

echo "════════════════════════════════════════════════════════"
echo "   🛡️ WiFi Audit Lab - Estado de servicios"
echo "════════════════════════════════════════════════════════"

# Verificar backend
if pgrep -f "wifi_scanner.py" > /dev/null; then
    echo "✅ Backend:   ACTIVO (puerto 8000)"
else
    echo "❌ Backend:   DETENIDO"
fi

# Verificar frontend
if pgrep -f "npm start" > /dev/null || pgrep -f "node.*3001" > /dev/null; then
    echo "✅ Frontend:  ACTIVO (puerto 3001)"
else
    echo "❌ Frontend:  DETENIDO"
fi

# Verificar Redis
if systemctl is-active --quiet redis-server; then
    echo "✅ Redis:     ACTIVO"
else
    echo "❌ Redis:     DETENIDO"
fi

echo ""
echo "📋 Puertos en uso:"
sudo lsof -i :8000 -i :3001 2>/dev/null | grep LISTEN || echo "   Ningún servicio corriendo"
