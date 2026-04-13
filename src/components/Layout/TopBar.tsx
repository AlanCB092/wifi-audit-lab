import React from 'react';
import { Wifi, Signal, User, Bell, Activity } from 'lucide-react';

interface TopBarProps {
  totalNetworks: number;
}

const TopBar: React.FC<TopBarProps> = ({ totalNetworks }) => {
  return (
    <header className="h-14 bg-cyber-card/90 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4 text-cyber-green" />
          <span className="text-gray-300">Modo: <span className="text-cyber-green">Auditoría</span></span>
        </div>
        <div className="h-4 w-px bg-gray-700"></div>
        <div className="flex items-center gap-2 text-sm">
          <Signal className="w-4 h-4 text-cyber-blue" />
          <span className="text-gray-400">Redes detectadas: <span className="text-white">{totalNetworks}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-cyber-purple" />
          <span className="text-gray-400">Estado: <span className="text-cyber-green">Activo</span></span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-300">Auditor</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
