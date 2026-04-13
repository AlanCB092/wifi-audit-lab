import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Monitor, Server, Wifi, Shield, AlertTriangle, RefreshCw, Users, Router } from 'lucide-react';

interface Device {
  ip: string;
  mac: string;
  vendor: string;
  type: 'laptop' | 'mobile' | 'iot' | 'desktop' | 'router';
  name: string;
  risk: string;
  last_seen?: number;
  is_router?: boolean;
}

const DevicesList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedSSID, setConnectedSSID] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [interface_name, setInterfaceName] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const fetchDevices = async () => {
    setScanning(true);
    try {
      const [networkRes, devicesRes] = await Promise.all([
        fetch('http://localhost:8000/api/connected-network'),
        fetch('http://localhost:8000/api/devices')
      ]);
      
      const networkData = await networkRes.json();
      const devicesData = await devicesRes.json();
      
      setConnectedSSID(networkData.ssid || 'No conectado');
      setInterfaceName(networkData.interface || '');
      setDevices(devicesData.devices || []);
      setLastScanTime(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (type: string, isRouter?: boolean) => {
    if (isRouter) return <Router className="w-5 h-5" />;
    switch(type) {
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'iot': return <Monitor className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      Safe: 'bg-green-500/20 text-green-500 border-green-500/30',
      Low: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      Medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      High: 'bg-red-500/20 text-red-500 border-red-500/30'
    };
    return colors[risk as keyof typeof colors] || colors.Safe;
  };

  const getDeviceTypeText = (type: string, isRouter?: boolean) => {
    if (isRouter) return 'Puerta de enlace / Router';
    switch(type) {
      case 'laptop': return 'Laptop / PC Portátil';
      case 'mobile': return 'Móvil / Tablet';
      case 'iot': return 'IoT / Smart Device';
      default: return 'Desktop / Equipo de escritorio';
    }
  };

  const isDevicePossiblyOffline = (name: string) => {
    return name.includes('(?)');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-cyber-blue mb-2">Device Analysis</h1>
            <p className="text-gray-400">Dispositivos REALES conectados a tu red local</p>
            {lastScanTime && (
              <p className="text-xs text-gray-500 mt-1">Último escaneo: {lastScanTime.toLocaleTimeString()}</p>
            )}
          </div>
          <button onClick={fetchDevices} disabled={scanning} className="btn-primary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Escaneando...' : 'Escanear Red'}
          </button>
        </div>
      </div>
      
      <div className="card bg-gradient-to-r from-cyber-green/10 to-cyber-blue/10">
        <div className="flex items-center gap-3">
          <Wifi className="w-8 h-8 text-cyber-green animate-pulse" />
          <div>
            <p className="text-sm text-gray-400">Tu red actual</p>
            <p className="text-lg font-semibold text-white">{connectedSSID}</p>
            <p className="text-xs text-gray-500 mt-1">Interfaz: {interface_name}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Dispositivos en tu Red ({devices.length})
          </h2>
          <Users className="w-5 h-5 text-cyber-blue" />
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue mx-auto"></div>
            <p className="text-gray-400 mt-4">Escaneando dispositivos en tu red...</p>
            <p className="text-xs text-gray-500 mt-2">Esto puede tomar hasta 15 segundos</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron dispositivos</p>
            <p className="text-xs text-gray-500 mt-2">Asegúrate de tener arp-scan instalado: sudo apt install arp-scan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {devices.map((device, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 bg-cyber-dark rounded-lg border transition-all duration-300 ${
                  device.is_router 
                    ? 'border-cyber-blue/50 hover:border-cyber-blue bg-cyber-blue/5' 
                    : isDevicePossiblyOffline(device.name) 
                      ? 'border-yellow-500/50 hover:border-yellow-500' 
                      : 'border-gray-800 hover:border-cyber-blue'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${device.is_router ? 'bg-cyber-blue/20' : 'bg-cyber-card'}`}>
                    {getDeviceIcon(device.type, device.is_router)}
                  </div>
                  <div>
                    <p className={`font-semibold ${device.is_router ? 'text-cyber-blue' : isDevicePossiblyOffline(device.name) ? 'text-yellow-400' : 'text-white'}`}>
                      {device.name}
                      {device.is_router && <span className="text-xs ml-2 text-cyber-blue">(Router)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{device.ip} • {device.mac}</p>
                    <p className="text-xs text-cyber-blue mt-1">
                      {getDeviceTypeText(device.type, device.is_router)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadge(device.risk)}`}>
                    {device.risk === 'High' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {device.risk === 'Safe' && <Shield className="w-3 h-3 inline mr-1" />}
                    {device.risk}
                  </span>
                  <span className="text-xs text-gray-500">{device.vendor}</span>
                  {isDevicePossiblyOffline(device.name) && !device.is_router && (
                    <span className="text-xs text-yellow-500">Posiblemente inactivo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesList;
