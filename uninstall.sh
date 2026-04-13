#!/bin/bash
# WiFi Audit Lab - Desinstalación completa

echo "════════════════════════════════════════════════════════"
echo "   🛡️ WiFi Audit Lab - Desinstalación"
echo "════════════════════════════════════════════════════════"

read -p "⚠️  ¿Estás seguro? Esto eliminará todo el proyecto. (y/N): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "❌ Desinstalación cancelada"
    exit 0
fi

# Detener servicios
echo "🛑 Deteniendo servicios..."
./stop.sh 2>/dev/null

# Eliminar directorio
echo "🗑️  Eliminando archivos..."
cd ~
rm -rf wifi-audit-lab

# Opcional: desinstalar dependencias del sistema
read -p "¿Eliminar también dependencias del sistema? (y/N): " deps
if [[ $deps == "y" || $deps == "Y" ]]; then
    echo "📦 Eliminando dependencias del sistema..."
    sudo apt remove -y arp-scan nmap redis-server
    sudo apt autoremove -y
fi

echo ""
echo "✅ Desinstalación completada"
