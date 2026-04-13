#!/bin/bash
cd "$(dirname "$0")"
echo "🔐 Se necesita permisos sudo para escanear redes WiFi"
sudo python3 wifi_scanner.py
