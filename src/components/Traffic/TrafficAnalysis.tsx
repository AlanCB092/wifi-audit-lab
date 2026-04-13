import React, { useState, useEffect } from 'react';
import { Activity, ArrowUpDown, Clock, Wifi, Download, Upload, RefreshCw } from 'lucide-react';

interface TrafficStats {
  packets_per_sec: number;
  mbps: number;
  bytes_rx: number;
  bytes_tx: number;
  connected: boolean;
  ssid: string;
}

const TrafficAnalysis: React.FC = () => {
  const [traffic, setTraffic] = useState<TrafficStats>({
    packets_per_sec: 0,
    mbps: 0,
    bytes_rx: 0,
    bytes_tx: 0,
    connected: false,
    ssid: ''
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrafficData = async () => {
    try {
      const [trafficRes, networkRes] = await Promise.all([
        fetch('http://localhost:8000/api/traffic'),
        fetch('http://localhost:8000/api/connected-network')
      ]);
      
      const trafficData = await trafficRes.json();
      const networkData = await networkRes.json();
      
      setTraffic({
        packets_per_sec: trafficData.packets_per_sec || 0,
        mbps: trafficData.mbps || 0,
        bytes_rx: trafficData.bytes_rx || 0,
        bytes_tx: trafficData.bytes_tx || 0,
        connected: networkData.connected || false,
        ssid: networkData.ssid || 'No conectado'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrafficData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-cyber-blue mb-2">Traffic Analysis</h1>
            <p className="text-gray-400">
              Tráfico REAL de tu red: 
              <span className="text-cyber-green font-semibold ml-1">{traffic.ssid}</span>
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="btn-primary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card hover:border-cyber-blue transition-all">
          <Activity className="w-6 h-6 text-cyber-blue mb-2" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : traffic.packets_per_sec}</p>
          <p className="text-sm text-gray-400">Paquetes/segundo</p>
        </div>
        <div className="card hover:border-cyber-green transition-all">
          <ArrowUpDown className="w-6 h-6 text-cyber-green mb-2" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : traffic.mbps}</p>
          <p className="text-sm text-gray-400">Mbps actual</p>
        </div>
        <div className="card hover:border-cyber-purple transition-all">
          <Download className="w-6 h-6 text-cyber-purple mb-2" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : formatBytes(traffic.bytes_rx)}</p>
          <p className="text-sm text-gray-400">Descargado (total)</p>
        </div>
        <div className="card hover:border-cyber-orange transition-all">
          <Upload className="w-6 h-6 text-cyber-orange mb-2" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : formatBytes(traffic.bytes_tx)}</p>
          <p className="text-sm text-gray-400">Subido (total)</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Actividad en Tiempo Real</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Ancho de banda</span>
              <span className="text-white">{traffic.mbps} Mbps</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyber-blue h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (traffic.mbps / 100) * 100)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Paquetes por segundo</span>
              <span className="text-white">{traffic.packets_per_sec} pkt/s</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyber-purple h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (traffic.packets_per_sec / 5000) * 100)}%` }}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 bg-cyber-dark rounded-lg">
              <Download className="w-4 h-4 text-cyber-purple mx-auto mb-1" />
              <p className="text-xs text-gray-400">Descarga total</p>
              <p className="text-sm font-semibold text-white">{formatBytes(traffic.bytes_rx)}</p>
            </div>
            <div className="text-center p-3 bg-cyber-dark rounded-lg">
              <Upload className="w-4 h-4 text-cyber-orange mx-auto mb-1" />
              <p className="text-xs text-gray-400">Subida total</p>
              <p className="text-sm font-semibold text-white">{formatBytes(traffic.bytes_tx)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {!traffic.connected && (
        <div className="card bg-red-500/10 border-red-500/50">
          <p className="text-red-400 text-center">
            ⚠️ No estás conectado a ninguna red WiFi. Conéctate a una red para ver tráfico real.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrafficAnalysis;
