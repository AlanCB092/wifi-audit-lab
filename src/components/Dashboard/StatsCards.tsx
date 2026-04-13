import React from 'react';
import { Wifi, Smartphone, AlertTriangle, Activity } from 'lucide-react';

interface StatsCardsProps {
  totalNetworks: number;
  activeDevices: number;
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalNetworks, activeDevices, vulnerabilities }) => {
  const cards = [
    { icon: Wifi, label: 'Redes Detectadas', value: totalNetworks, color: 'text-cyber-blue' },
    { icon: Smartphone, label: 'Dispositivos Activos', value: activeDevices, color: 'text-cyber-purple' },
    { icon: AlertTriangle, label: 'Vulnerabilidades', value: vulnerabilities.critical + vulnerabilities.high + vulnerabilities.medium + vulnerabilities.low, color: 'text-cyber-red' },
    { icon: Activity, label: 'Tráfico (pkt/s)', value: 1248, color: 'text-cyber-green' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="card">
          <div className="flex items-center justify-between mb-2">
            <card.icon className={`w-5 h-5 ${card.color}`} />
            <span className="text-2xl font-bold text-white">{card.value}</span>
          </div>
          <p className="text-sm text-gray-400">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
