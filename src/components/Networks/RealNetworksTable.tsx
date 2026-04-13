import React, { useState, useEffect, useRef } from 'react';
import { Wifi, RefreshCw, WifiOff } from 'lucide-react';

interface RealWiFiNetwork {
  ssid: string;
  bssid: string;
  channel: number;
  signal: number;
  encryption: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
}

const RealNetworksTable: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<RealWiFiNetwork[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const fetchNetworks = async () => {
    if (!isMounted.current) return;
    
    setScanning(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/networks');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (isMounted.current) {
        console.log('Redes recibidas:', data.networks?.length || 0);
        setNetworks(data.networks || []);
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error conectando al backend:', err);
      if (isMounted.current) {
        setIsConnected(false);
        setError('No se pudo conectar al backend. Asegúrate de que el servidor esté corriendo.');
        setNetworks([]);
      }
    } finally {
      if (isMounted.current) {
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    // Primera carga
    fetchNetworks();
    
    // Escanear cada 45 segundos
    intervalRef.current = setInterval(fetchNetworks, 60000);
    
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Critical': return 'bg-red-500/20 text-red-500';
      case 'High': return 'bg-orange-500/20 text-orange-500';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'Low': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-green-500/20 text-green-500';
    }
  };

  const getSignalStrength = (signal: number) => {
    const percentage = Math.min(100, Math.max(0, ((signal + 100) / 50) * 100));
    const bars = Math.floor(percentage / 20);
    return '█'.repeat(bars) + '░'.repeat(5 - bars);
  };

  const getSignalColor = (signal: number) => {
    if (signal > -50) return 'text-green-500';
    if (signal > -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const connectedNetwork = networks.length > 0 
    ? networks.reduce((best, current) => (current.signal > best.signal ? current : best), networks[0])
    : null;

  return (
    <div className="space-y-6">
      <div className={`card ${isConnected ? 'bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10' : 'bg-red-500/10 border-red-500/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <Wifi className="w-8 h-8 text-cyber-green animate-pulse" />
                <div>
                  <p className="text-sm text-cyber-green font-semibold">✅ Backend conectado</p>
                  <p className="text-lg font-semibold text-white">
                    {connectedNetwork?.ssid || 'Escaneando...'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-8 h-8 text-cyber-red" />
                <div>
                  <p className="text-sm text-red-400 font-semibold">❌ Backend no conectado</p>
                  <p className="text-xs text-gray-500">Ejecuta: cd ~/wifi-audit-lab/backend && sudo ./venv/bin/python3 wifi_scanner.py</p>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={fetchNetworks} 
            disabled={scanning} 
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Escaneando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">
          Redes WiFi Detectadas ({networks.length})
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {scanning && networks.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-cyber-blue animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Escaneando redes WiFi...</p>
            <p className="text-xs text-gray-500 mt-2">Esto puede tomar hasta 10 segundos</p>
          </div>
        ) : networks.length === 0 && !scanning ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron redes WiFi</p>
            <p className="text-xs text-gray-500 mt-2">Verifica que tu tarjeta WiFi esté activa</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-400">SSID</th>
                  <th className="text-left py-3 text-gray-400">BSSID</th>
                  <th className="text-left py-3 text-gray-400">Canal</th>
                  <th className="text-left py-3 text-gray-400">Señal</th>
                  <th className="text-left py-3 text-gray-400">Cifrado</th>
                  <th className="text-left py-3 text-gray-400">Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {networks.map((net, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-cyber-card/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Wifi className={`w-4 h-4 ${getSignalColor(net.signal)}`} />
                        <span className="text-white font-medium">{net.ssid}</span>
                        {net === connectedNetwork && (
                          <span className="text-xs bg-cyber-green/20 text-cyber-green px-2 py-0.5 rounded-full">
                            Conectado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-mono text-sm text-gray-300">{net.bssid}</td>
                    <td className="py-3 text-gray-300">{net.channel}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getSignalColor(net.signal)}`}>{net.signal} dBm</span>
                        <span className="text-xs text-cyber-blue">{getSignalStrength(net.signal)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        net.encryption === 'Open' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {net.encryption}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(net.risk)}`}>
                        {net.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealNetworksTable;
