#!/bin/bash
# WiFi Audit Lab - Detener servicios

echo "════════════════════════════════════════════════════════"
echo "   🛡️ WiFi Audit Lab - Deteniendo servicios"
echo "════════════════════════════════════════════════════════"

# Detener backend
echo "🛑 Deteniendo backend..."
sudo pkill -f "wifi_scanner.py"
echo "   ✅ Backend detenido"

# Detener frontend
echo "🛑 Deteniendo frontend..."
pkill -f "npm start"
pkill -f "node.*3001"
echo "   ✅ Frontend detenido"

# Limpiar PIDs
rm -f /tmp/wifi-backend.pid /tmp/wifi-frontend.pid

echo ""
echo "✅ Todos los servicios detenidos"
