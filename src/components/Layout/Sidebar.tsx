import React from 'react';
import { 
  LayoutDashboard, 
  Wifi, 
  Activity, 
  Smartphone, 
  FileText,
  FlaskConical,
  Shield
} from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  id: 'dashboard' | 'networks' | 'traffic' | 'devices' | 'lab' | 'reports';
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Wifi, label: 'Networks (Recon)', id: 'networks' },
  { icon: Activity, label: 'Traffic', id: 'traffic' },
  { icon: Smartphone, label: 'Devices', id: 'devices' },
  { icon: FlaskConical, label: 'Lab Mode', id: 'lab' },
  { icon: FileText, label: 'Reports', id: 'reports' },
];

interface SidebarProps {
  onNavigate: (view: 'dashboard' | 'networks' | 'traffic' | 'devices' | 'lab' | 'reports') => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView }) => {
  return (
    <aside className="w-64 bg-cyber-card/90 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-cyber-blue" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            WiFi Audit Lab
          </span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
              currentView === item.id
                ? 'bg-cyber-blue/20 text-cyber-blue border-l-2 border-cyber-blue'
                : 'text-gray-400 hover:bg-cyber-blue/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
