#!/usr/bin/env python3
"""
Escáner WiFi REAL para Debian Linux
"""

import subprocess
import re
import asyncio
import signal
import threading
from functools import lru_cache
from time import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://192.168.0.104:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales para caché de redes
last_scan_time = 0
cached_networks = []
CACHE_DURATION = 30  # segundos
scan_in_progress = False

# Variables globales para caché de dispositivos
last_devices_scan_time = 0
cached_devices = []
DEVICES_CACHE_DURATION = 120  # 2 minutos

def scan_wifi_networks() -> List[Dict[str, Any]]:
    """Escanea redes WiFi reales con caché y agrupa por SSID"""
    global last_scan_time, cached_networks, scan_in_progress
    
    # Si ya hay un escaneo en curso, devolver caché
    if scan_in_progress:
        print("Escaneo ya en curso, devolviendo caché")
        return cached_networks if cached_networks else []
    
    # Si el caché aún es válido, devolverlo
    current_time = time()
    if current_time - last_scan_time < CACHE_DURATION and cached_networks:
        print(f"Usando caché de redes (último escaneo hace {current_time - last_scan_time:.1f} segundos)")
        return cached_networks
    
    scan_in_progress = True
    networks = []
    
    try:
        print("Iniciando escaneo WiFi real...")
        
        # Detectar interfaz WiFi
        result = subprocess.run(['iwconfig'], capture_output=True, text=True)
        interface = None
        for line in result.stdout.split('\n'):
            if 'IEEE 802.11' in line:
                interface = line.split()[0]
                break
        
        if not interface:
            print("No se encontró interfaz WiFi")
            return cached_networks if cached_networks else []
        
        print(f"Usando interfaz: {interface}")
        
        # Escanear redes con timeout de 15 segundos
        scan_result = subprocess.run(
            ['sudo', 'iwlist', interface, 'scan'],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if scan_result.returncode != 0:
            print(f"Error en escaneo: código {scan_result.returncode}")
            return cached_networks if cached_networks else []
        
        print("Escaneo completado, parseando resultados...")
        
        current_network = {}
        raw_networks = []
        
        for line in scan_result.stdout.split('\n'):
            line = line.strip()
            
            if 'Cell' in line and 'Address' in line:
                if current_network and 'ssid' in current_network:
                    raw_networks.append(current_network)
                current_network = {}
                bssid_match = re.search(r'Address: ([0-9A-F:]+)', line)
                if bssid_match:
                    current_network['bssid'] = bssid_match.group(1)
            
            elif 'ESSID:' in line:
                ssid = re.search(r'ESSID:"(.+)"', line)
                if ssid:
                    current_network['ssid'] = ssid.group(1) if ssid.group(1) else "(Red Oculta)"
            
            elif 'Channel:' in line:
                channel_match = re.search(r'Channel:(\d+)', line)
                if channel_match:
                    current_network['channel'] = int(channel_match.group(1))
            
            elif 'Quality=' in line:
                signal_match = re.search(r'Signal level=(-?\d+) dBm', line)
                if signal_match:
                    current_network['signal'] = int(signal_match.group(1))
            
            elif 'Encryption key:on' in line:
                current_network['encryption'] = 'WPA2'
            elif 'Encryption key:off' in line:
                current_network['encryption'] = 'Open'
        
        if current_network and 'ssid' in current_network:
            raw_networks.append(current_network)
        
        # === AGRUPAR REDES POR SSID ===
        networks_dict = {}
        
        for net in raw_networks:
            ssid = net.get('ssid', 'Unknown')
            
            if ssid not in networks_dict:
                # Primera vez que vemos este SSID
                networks_dict[ssid] = {
                    'ssid': ssid,
                    'bssid': net.get('bssid', 'Desconocido'),
                    'channels': [net.get('channel', 0)],
                    'signal': net.get('signal', -100),
                    'encryption': net.get('encryption', 'Desconocido'),
                    'bssids': [net.get('bssid', 'Desconocido')]
                }
            else:
                # Ya existe, actualizar con la mejor señal
                existing = networks_dict[ssid]
                existing['channels'].append(net.get('channel', 0))
                existing['bssids'].append(net.get('bssid', 'Desconocido'))
                
                # Quedarse con la mejor señal (la más alta, menos negativa)
                current_signal = net.get('signal', -100)
                if current_signal > existing['signal']:
                    existing['signal'] = current_signal
                    existing['bssid'] = net.get('bssid', 'Desconocido')
        
        # Convertir diccionario a lista
        for ssid, net in networks_dict.items():
            # Determinar el canal principal (el de mejor señal o el más común)
            if len(net['channels']) > 1:
                channels_uniq = sorted(set(net['channels']))
                if len(channels_uniq) > 1:
                    net['channel'] = f"{min(channels_uniq)}/{max(channels_uniq)}"
                else:
                    net['channel'] = channels_uniq[0]
            else:
                net['channel'] = net['channels'][0]
            
            # Eliminar campos auxiliares
            del net['channels']
            del net['bssids']
            
            networks.append(net)
        
        # Calcular riesgo para cada red agrupada
        for net in networks:
            encryption = net.get('encryption', 'Desconocido')
            signal = net.get('signal', -100)
            
            if encryption == 'Open':
                net['risk'] = 'Critical'
            elif encryption == 'WEP':
                net['risk'] = 'High'
            elif signal < -80:
                net['risk'] = 'Medium'
            elif signal < -70:
                net['risk'] = 'Low'
            else:
                net['risk'] = 'Safe'
            
            net.setdefault('channel', 0)
            net.setdefault('signal', -100)
            net.setdefault('bssid', 'Desconocido')
            net.setdefault('encryption', 'Desconocido')
        
        # Ordenar por señal (mejor primero)
        networks.sort(key=lambda x: x.get('signal', -100), reverse=True)
        
        # Guardar en caché
        last_scan_time = current_time
        cached_networks = networks
        
        print(f"Escaneo completado: {len(raw_networks)} interfaces, {len(networks)} redes únicas")
        return networks
    
    except subprocess.TimeoutExpired:
        print("Error: Timeout escaneando redes (más de 15 segundos), usando caché")
        return cached_networks if cached_networks else []
    except Exception as e:
        print(f"Error en escaneo: {e}")
        return cached_networks if cached_networks else []
    finally:
        scan_in_progress = False

def get_wifi_interface() -> str:
    try:
        result = subprocess.run(['iwconfig'], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if 'IEEE 802.11' in line:
                return line.split()[0]
        return 'wlan0'
    except:
        return 'wlan0'

def get_connected_network_info() -> Dict[str, Any]:
    """Obtiene información de la red a la que estamos conectados"""
    try:
        # Obtener interfaz WiFi activa
        result = subprocess.run(['iwconfig'], capture_output=True, text=True)
        interface = None
        for line in result.stdout.split('\n'):
            if 'IEEE 802.11' in line:
                interface = line.split()[0]
                break
        
        if not interface:
            return {"connected": False, "ssid": "No conectado", "bssid": "Ninguno", "interface": ""}
        
        # Obtener SSID de la red conectada
        result = subprocess.run(['iwgetid', interface, '-r'], capture_output=True, text=True)
        ssid = result.stdout.strip()
        
        # Obtener BSSID (MAC del router)
        result = subprocess.run(['iwgetid', interface, '-a'], capture_output=True, text=True)
        bssid = result.stdout.strip()
        
        return {
            "connected": True if ssid else False,
            "ssid": ssid if ssid else "No conectado",
            "bssid": bssid if bssid else "Desconocido",
            "interface": interface
        }
    except Exception as e:
        print(f"Error obteniendo red conectada: {e}")
        return {"connected": False, "ssid": "Error", "bssid": "Error", "interface": ""}

def get_traffic_stats() -> Dict[str, Any]:
    """Obtiene estadísticas de tráfico REAL de la interfaz WiFi"""
    try:
        # Obtener interfaz activa
        result = subprocess.run(['iwconfig'], capture_output=True, text=True)
        interface = None
        for line in result.stdout.split('\n'):
            if 'IEEE 802.11' in line:
                interface = line.split()[0]
                break
        
        if not interface:
            return {"packets_per_sec": 0, "mbps": 0, "bytes_rx": 0, "bytes_tx": 0}
        
        # Leer estadísticas de /proc/net/dev
        with open('/proc/net/dev', 'r') as f:
            lines = f.readlines()
        
        for line in lines:
            if interface in line:
                parts = line.split()
                bytes_rx = int(parts[1])
                bytes_tx = int(parts[9])
                packets_rx = int(parts[2])
                packets_tx = int(parts[10])
                
                # Calcular Mbps aproximado
                mbps = round((bytes_rx + bytes_tx) * 8 / 1000000 / 10, 1)
                packets_per_sec = int((packets_rx + packets_tx) / 10)
                
                return {
                    "packets_per_sec": min(packets_per_sec, 5000),
                    "mbps": min(mbps, 100),
                    "bytes_rx": bytes_rx,
                    "bytes_tx": bytes_tx
                }
        
        return {"packets_per_sec": 0, "mbps": 0, "bytes_rx": 0, "bytes_tx": 0}
    except Exception as e:
        print(f"Error obteniendo tráfico: {e}")
        return {"packets_per_sec": 0, "mbps": 0, "bytes_rx": 0, "bytes_tx": 0}

def get_devices_on_network() -> List[Dict[str, Any]]:
    """Escanea dispositivos usando ARP + ip neigh + caché persistente (Solución 3)"""
    global last_devices_scan_time, cached_devices
    
    current_time = time()
    
    # Si el caché aún es válido (2 minutos), devolverlo
    if current_time - last_devices_scan_time < DEVICES_CACHE_DURATION and cached_devices:
        print(f"✅ Usando caché: {len(cached_devices)} dispositivos")
        return cached_devices
    
    # Base de datos de fabricantes por MAC (primeros 8 caracteres)
    mac_vendors = {
        "28:ee:52": "TP-Link Technologies",
        "70:9e:29": "TP-Link Technologies",
        "fc:01:7c": "Espressif Inc (ESP8266/ESP32)",
        "d6:45:0c": "Raspberry Pi Foundation",
        "c0:a9:38": "TP-Link Technologies",
        "e4:82:10": "TP-Link Technologies",
        "ac:60:6f": "TP-Link Technologies",
        "50:88:c7": "TP-Link Technologies",
        "ac:15:a2": "TP-Link Technologies",
        "98:22:ef": "Realtek Semiconductor",
        "00:00:00": "Desconocido",
        "ff:ff:ff": "Broadcast",
    }
    
    # Mapa de tipos de dispositivo por vendor
    device_types = {
        "apple": "mobile",
        "samsung": "mobile",
        "xiaomi": "mobile",
        "motorola": "mobile",
        "huawei": "mobile",
        "intel": "laptop",
        "dell": "laptop",
        "hp": "laptop",
        "lenovo": "laptop",
        "asus": "laptop",
        "acer": "laptop",
        "raspberry": "iot",
        "esp": "iot",
        "arduino": "iot",
        "sony": "iot",
        "lg": "iot",
        "tp-link": "router",
        "netgear": "router",
        "cisco": "router",
    }
    
    devices_by_mac = {}
    
    # PRIMERO: Preservar dispositivos anteriores (caché)
    if cached_devices:
        print(f"📦 Preservando {len(cached_devices)} dispositivos de caché anterior")
        for device in cached_devices:
            devices_by_mac[device['mac']] = device.copy()
            devices_by_mac[device['mac']]['confirmed'] = False
            devices_by_mac[device['mac']]['last_seen'] = current_time
    
    try:
        print("🔍 Escaneando dispositivos con múltiples métodos...")
        
        # === MÉTODO 1: ip neigh show (más actualizado) ===
        result = subprocess.run(['ip', 'neigh', 'show'], capture_output=True, text=True, timeout=5)
        count = 0
        for line in result.stdout.split('\n'):
            parts = line.split()
            if len(parts) >= 3 and '.' in parts[0]:
                ip = parts[0]
                state = parts[2] if len(parts) > 2 else "unknown"
                mac = parts[3] if len(parts) > 3 else None
                
                if mac and mac != "FAILED" and ':' in mac:
                    mac = mac.upper()
                    mac_prefix = mac[:8]
                    vendor = mac_vendors.get(mac_prefix, "Desconocido")
                    is_router = (ip.endswith('.1') or ip.endswith('.254'))
                    
                    # Determinar tipo por vendor
                    device_type = "desktop"
                    vendor_lower = vendor.lower()
                    for key, dtype in device_types.items():
                        if key in vendor_lower:
                            device_type = dtype
                            break
                    
                    if is_router:
                        device_type = "router"
                    
                    # Determinar riesgo
                    risk = "Safe" if is_router else "Low"
                    if vendor == "Desconocido":
                        risk = "Medium"
                    
                    # Nombre amigable
                    if is_router:
                        name = f"Router {vendor.split()[0] if vendor != 'Desconocido' else 'Principal'}"
                    elif device_type == "mobile":
                        name = f"Móvil {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    elif device_type == "laptop":
                        name = f"Laptop {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    elif device_type == "iot":
                        name = f"IoT {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    else:
                        name = f"Equipo {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    
                    if not name.strip() or name.endswith(' '):
                        name = "Dispositivo"
                    
                    devices_by_mac[mac] = {
                        "ip": ip,
                        "mac": mac,
                        "vendor": vendor,
                        "type": device_type,
                        "name": name.strip(),
                        "risk": risk,
                        "last_seen": current_time,
                        "is_router": is_router,
                        "state": state,
                        "confirmed": True
                    }
                    count += 1
        print(f"  📡 ip neigh: {count} dispositivos")
        
        # === MÉTODO 2: arp -n (historial completo) ===
        result = subprocess.run(['arp', '-n'], capture_output=True, text=True, timeout=5)
        count = 0
        for line in result.stdout.split('\n'):
            parts = line.split()
            if len(parts) >= 3 and '.' in parts[0] and ':' in parts[2]:
                ip = parts[0]
                mac = parts[2].upper()
                
                if mac not in devices_by_mac:
                    mac_prefix = mac[:8]
                    vendor = mac_vendors.get(mac_prefix, "Desconocido")
                    is_router = (ip.endswith('.1') or ip.endswith('.254'))
                    
                    device_type = "desktop"
                    vendor_lower = vendor.lower()
                    for key, dtype in device_types.items():
                        if key in vendor_lower:
                            device_type = dtype
                            break
                    
                    if is_router:
                        device_type = "router"
                    
                    risk = "Safe" if is_router else "Low"
                    if vendor == "Desconocido":
                        risk = "Medium"
                    
                    if is_router:
                        name = f"Router {vendor.split()[0] if vendor != 'Desconocido' else 'Principal'}"
                    elif device_type == "mobile":
                        name = f"Móvil {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    elif device_type == "laptop":
                        name = f"Laptop {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    elif device_type == "iot":
                        name = f"IoT {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    else:
                        name = f"Equipo {vendor.split()[0] if vendor != 'Desconocido' else ''}"
                    
                    if not name.strip() or name.endswith(' '):
                        name = "Dispositivo"
                    
                    devices_by_mac[mac] = {
                        "ip": ip,
                        "mac": mac,
                        "vendor": vendor,
                        "type": device_type,
                        "name": name.strip(),
                        "risk": risk,
                        "last_seen": current_time,
                        "is_router": is_router,
                        "confirmed": True
                    }
                    count += 1
        print(f"  📡 arp -n: {count} dispositivos")
        
        # === MÉTODO 3: ping al router para refrescar ARP ===
        print("  🔄 Refrescando caché ARP...")
        subprocess.run(['ping', '-c', '1', '-W', '1', '192.168.0.1'], capture_output=True, timeout=2)
        
        # === ACTUALIZAR dispositivos existentes ===
        for mac, device in devices_by_mac.items():
            if 'confirmed' not in device or not device['confirmed']:
                device['confirmed'] = True
        
        # Convertir a lista y ordenar
        devices = list(devices_by_mac.values())
        devices.sort(key=lambda x: (not x.get('is_router', False), x['ip']))
        
        # Contar por tipo
        router_count = sum(1 for d in devices if d.get('is_router', False))
        other_count = len(devices) - router_count
        
        # Guardar en caché
        last_devices_scan_time = current_time
        cached_devices = devices
        
        print(f"✅ Escaneo completado: {len(devices)} dispositivos totales")
        print(f"   🌐 Router: {router_count}")
        print(f"   💻 Otros dispositivos: {other_count}")
        
        for d in devices:
            print(f"     - {d['ip']:15} | {d['name']:25} | {d['vendor'][:20]}")
        
        return devices[:50]
        
    except Exception as e:
        print(f"❌ Error en escaneo: {e}")
        return cached_devices if cached_devices else []

@app.get("/")
async def root():
    return {"message": "WiFi Audit Lab API", "status": "running"}

@app.get("/api/status")
async def get_status():
    return {
        "status": "active",
        "interface": get_wifi_interface(),
        "scan_available": True
    }

@app.get("/api/networks")
async def get_networks():
    networks = scan_wifi_networks()
    return {
        "networks": networks,
        "total": len(networks),
        "interface": get_wifi_interface()
    }

@app.get("/api/connected-network")
async def get_connected_network():
    """Endpoint para obtener la red a la que estamos conectados"""
    return get_connected_network_info()

@app.get("/api/traffic")
async def get_traffic():
    """Endpoint para obtener tráfico REAL de la red"""
    return get_traffic_stats()

@app.get("/api/devices")
async def get_devices():
    """Endpoint para obtener dispositivos REALES en la red"""
    devices = get_devices_on_network()
    return {
        "devices": devices,
        "total": len(devices),
        "timestamp": asyncio.get_event_loop().time()
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("   WiFi Audit Lab - Backend")
    print("=" * 50)
    print(f"🔍 Interfaz WiFi: {get_wifi_interface()}")
    print("🚀 Servidor en http://localhost:8000")
    print("📡 Escaneo de redes WiFi disponible (caché 30s)")
    print("🖧 Tráfico de red en tiempo real")
    print("📱 Escaneo de dispositivos (ARP + ip neigh + caché 120s)")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
