import React, { useState } from 'react';
import { Search, Wifi, Shield, AlertTriangle, Signal } from 'lucide-react';

interface WiFiNetwork {
  ssid: string;
  bssid: string;
  channel: number;
  signal: number;
  encryption: string;
  risk: string;
}

const mockNetworks: WiFiNetwork[] = [
  { ssid: 'Office_WiFi', bssid: 'AA:BB:CC:DD:EE:FF', channel: 6, signal: -45, encryption: 'WPA3', risk: 'Safe' },
  { ssid: 'Guest_Network', bssid: '11:22:33:44:55:66', channel: 1, signal: -67, encryption: 'Open', risk: 'Critical' },
  { ssid: 'IoT_Devices', bssid: '77:88:99:AA:BB:CC', channel: 11, signal: -52, encryption: 'WPA2', risk: 'Medium' },
  { ssid: 'Cafe_WiFi', bssid: 'DD:EE:FF:00:11:22', channel: 6, signal: -78, encryption: 'WPA2', risk: 'High' },
  { ssid: 'Router_TP-Link', bssid: '33:44:55:66:77:88', channel: 1, signal: -38, encryption: 'WPA3', risk: 'Low' },
];

const NetworksTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [networks] = useState(mockNetworks);

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

  const filteredNetworks = networks.filter(net => 
    net.ssid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Redes Detectadas</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar SSID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-cyber-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 text-gray-400 font-medium">SSID</th>
              <th className="text-left py-3 text-gray-400 font-medium">BSSID</th>
              <th className="text-left py-3 text-gray-400 font-medium">Canal</th>
              <th className="text-left py-3 text-gray-400 font-medium">Señal</th>
              <th className="text-left py-3 text-gray-400 font-medium">Cifrado</th>
              <th className="text-left py-3 text-gray-400 font-medium">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {filteredNetworks.map((net, idx) => (
              <tr key={idx} className="border-b border-gray-800/50 hover:bg-cyber-card/50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyber-blue" />
                    <span className="text-white">{net.ssid}</span>
                  </div>
                </td>
                <td className="py-3 font-mono text-sm text-gray-300">{net.bssid}</td>
                <td className="py-3 text-gray-300">{net.channel}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{net.signal} dBm</span>
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
                    {net.risk === 'Critical' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {net.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NetworksTable;
