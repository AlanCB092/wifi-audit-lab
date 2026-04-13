#!/bin/bash
# WiFi Audit Lab - Script de instalación completa
# Autor: AlanCB092

set -e

echo "════════════════════════════════════════════════════════"
echo "   🛡️ WiFi Audit Lab - Instalación Completa"
echo "════════════════════════════════════════════════════════"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Actualizar sistema
echo -e "\n${BLUE}[1/6] Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias del sistema
echo -e "\n${BLUE}[2/6] Instalando dependencias del sistema...${NC}"
sudo apt install -y \
    python3 python3-pip python3-venv \
    nodejs npm \
    redis-server \
    arp-scan nmap \
    net-tools wireless-tools \
    git curl wget \
    build-essential

# 3. Clonar repositorio
echo -e "\n${BLUE}[3/6] Clonando repositorio...${NC}"
cd ~
if [ -d "wifi-audit-lab" ]; then
    echo "⚠️  El directorio ya existe, actualizando..."
    cd wifi-audit-lab && git pull
else
    git clone https://github.com/AlanCB092/wifi-audit-lab.git
    cd wifi-audit-lab
fi

# 4. Configurar backend Python
echo -e "\n${BLUE}[4/6] Configurando backend...${NC}"
cd ~/wifi-audit-lab/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn websockets redis
pip install maxminddb-geolite2 python-dateutil pyyaml
deactivate

# 5. Configurar frontend React
echo -e "\n${BLUE}[5/6] Configurando frontend...${NC}"
cd ~/wifi-audit-lab
npm install
npm install recharts framer-motion lucide-react @tanstack/react-query
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 6. Configurar servicios
echo -e "\n${BLUE}[6/6] Configurando servicios...${NC}"
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Crear script de inicio rápido
cat > ~/wifi-audit-lab/start.sh << 'START'
#!/bin/bash
echo "🚀 Iniciando WiFi Audit Lab..."
echo "📡 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3001"
echo ""

# Iniciar backend
cd ~/wifi-audit-lab/backend
source venv/bin/activate
sudo ./venv/bin/python3 wifi_scanner.py &
BACKEND_PID=$!

sleep 3

# Iniciar frontend
cd ~/wifi-audit-lab
PORT=3001 npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servicios iniciados"
echo "🔴 Para detener: pkill -f 'wifi_scanner.py' && pkill -f 'npm start'"
wait
START

chmod +x ~/wifi-audit-lab/start.sh

# Crear script de detención
cat > ~/wifi-audit-lab/stop.sh << 'STOP'
#!/bin/bash
echo "🛑 Deteniendo WiFi Audit Lab..."
sudo pkill -f "wifi_scanner.py"
pkill -f "npm start"
pkill -f "node.*3001"
echo "✅ Servicios detenidos"
STOP

chmod +x ~/wifi-audit-lab/stop.sh

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Instalación completada exitosamente!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📋 Comandos útiles:"
echo "   ./start.sh  - Iniciar el laboratorio"
echo "   ./stop.sh   - Detener el laboratorio"
echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:8000"
echo ""

chmod +x install.sh
