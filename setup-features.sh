#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "   WiFi Audit Lab - Agregando funcionalidades principales"
echo "════════════════════════════════════════════════════════"

# Instalar dependencias adicionales
echo "📦 Instalando dependencias..."
npm install recharts framer-motion react-router-dom

# ============================================
# 1. COMPONENTE: Security Score (Círculo)
# ============================================
echo "🎯 Creando Security Score..."

cat > src/components/Dashboard/SecurityScore.tsx << 'SCORE'
import React from 'react';
import { Shield } from 'lucide-react';

interface SecurityScoreProps {
  score: number;
  status: 'Secure' | 'Risky' | 'Critical';
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ score, status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'Secure': return 'text-cyber-green';
      case 'Risky': return 'text-cyber-orange';
      case 'Critical': return 'text-cyber-red';
      default: return 'text-cyber-blue';
    }
  };

  const getStrokeColor = () => {
    if (score >= 80) return '#2ECC71';
    if (score >= 50) return '#FFA500';
    return '#FF4D4D';
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card flex flex-col items-center">
      <h3 className="text-lg font-semibold text-white mb-4">Security Score</h3>
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1A1F2E"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-sm text-gray-400">/100</span>
        </div>
      </div>
      <div className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-opacity-20 bg-current`}>
        <Shield className="w-4 h-4 inline mr-1" />
        {status}
      </div>
    </div>
  );
};

export default SecurityScore;
SCORE

# ============================================
# 2. COMPONENTE: Stats Cards
# ============================================
echo "📊 Creando Stats Cards..."

cat > src/components/Dashboard/StatsCards.tsx << 'STATS'
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
STATS

# ============================================
# 3. COMPONENTE: Gráficas del Dashboard
# ============================================
echo "📈 Creando gráficas..."

cat > src/components/Dashboard/DashboardCharts.tsx << 'CHARTS'
import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const signalData = [
  { time: '10:00', signal: -45, networks: 12 },
  { time: '10:30', signal: -52, networks: 15 },
  { time: '11:00', signal: -48, networks: 18 },
  { time: '11:30', signal: -55, networks: 20 },
  { time: '12:00', signal: -42, networks: 22 },
];

const trafficData = [
  { time: '10:00', packets: 1200 },
  { time: '10:30', packets: 3400 },
  { time: '11:00', packets: 2800 },
  { time: '11:30', packets: 4500 },
  { time: '12:00', packets: 3900 },
];

const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Evolución de Señal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={signalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1F2E" />
            <XAxis dataKey="time" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#0F1422', borderColor: '#00D4FF' }} />
            <Line type="monotone" dataKey="signal" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Tráfico en Tiempo Real</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1F2E" />
            <XAxis dataKey="time" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#0F1422', borderColor: '#7B61FF' }} />
            <Area type="monotone" dataKey="packets" stroke="#7B61FF" fill="#7B61FF" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
CHARTS

# ============================================
# 4. COMPONENTE: Tabla de Redes WiFi
# ============================================
echo "📡 Creando tabla de redes WiFi..."

cat > src/components/Networks/NetworksTable.tsx << 'NETWORKS'
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
            </table>
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
NETWORKS

# ============================================
# 5. COMPONENTE: Panel de Vulnerabilidades
# ============================================
echo "⚠️ Creando panel de vulnerabilidades..."

cat > src/components/Dashboard/VulnerabilityPanel.tsx << 'VULN'
import React, { useState } from 'react';
import { AlertTriangle, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface Vulnerability {
  id: number;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

const vulnerabilities: Vulnerability[] = [
  { id: 1, title: 'Red Abierta sin Cifrado', description: 'La red Guest_Network no tiene cifrado WPA2/WPA3', severity: 'Critical', recommendation: 'Configurar WPA2 o WPA3 con contraseña segura' },
  { id: 2, title: 'WPS Habilitado', description: 'El router TP-Link tiene WPS activado', severity: 'High', recommendation: 'Deshabilitar WPS en la configuración del router' },
  { id: 3, title: 'Señal Débil', description: 'La red Cafe_WiFi tiene señal débil (-78 dBm)', severity: 'Medium', recommendation: 'Acercar al punto de acceso o usar repetidor' },
  { id: 4, title: 'Canal Congestionado', description: 'Múltiples redes en el canal 6', severity: 'Low', recommendation: 'Cambiar a canal menos congestionado' },
];

const VulnerabilityPanel: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'border-red-500 bg-red-500/10';
      case 'High': return 'border-orange-500 bg-orange-500/10';
      case 'Medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Critical' || severity === 'High') return <AlertTriangle className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-white mb-4">Vulnerabilidades Detectadas</h2>
      <div className="space-y-3">
        {vulnerabilities.map((vuln) => (
          <div key={vuln.id} className={`border-l-4 rounded-r-lg p-4 ${getSeverityColor(vuln.severity)}`}>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === vuln.id ? null : vuln.id)}
            >
              <div className="flex items-center gap-3">
                {getSeverityIcon(vuln.severity)}
                <div>
                  <h3 className="font-semibold text-white">{vuln.title}</h3>
                  <p className="text-sm text-gray-400">{vuln.description}</p>
                </div>
              </div>
              {expandedId === vuln.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
            {expandedId === vuln.id && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-300 mb-2">
                  <span className="text-cyber-blue">Recomendación:</span> {vuln.recommendation}
                </p>
                <button className="text-xs text-cyber-purple hover:text-cyber-blue transition-colors">
                  <Info className="w-3 h-3 inline mr-1" />
                  Explicar simplemente
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VulnerabilityPanel;
VULN

# ============================================
# 6. ACTUALIZAR MainLayout con todos los componentes
# ============================================
echo "🎨 Actualizando layout principal..."

cat > src/components/Layout/MainLayout.tsx << 'LAYOUT'
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SecurityScore from '../Dashboard/SecurityScore';
import StatsCards from '../Dashboard/StatsCards';
import DashboardCharts from '../Dashboard/DashboardCharts';
import NetworksTable from '../Networks/NetworksTable';
import VulnerabilityPanel from '../Dashboard/VulnerabilityPanel';

type View = 'dashboard' | 'networks' | 'traffic' | 'devices' | 'lab' | 'reports';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const vulnerabilitiesStats = {
    critical: 1,
    high: 1,
    medium: 1,
    low: 1
  };

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SecurityScore score={72} status="Risky" />
              <div className="lg:col-span-2">
                <StatsCards totalNetworks={5} activeDevices={12} vulnerabilities={vulnerabilitiesStats} />
              </div>
            </div>
            <DashboardCharts />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NetworksTable />
              <VulnerabilityPanel />
            </div>
          </div>
        );
      case 'networks':
        return <NetworksTable />;
      default:
        return (
          <div className="card text-center py-12">
            <h2 className="text-2xl font-semibold text-cyber-blue mb-2">Próximamente</h2>
            <p className="text-gray-400">Esta vista está en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-cyber-dark">
      <Sidebar onNavigate={setCurrentView} currentView={currentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar totalNetworks={5} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
LAYOUT

# ============================================
# 7. ACTUALIZAR Sidebar con navegación
# ============================================
echo "🔧 Actualizando Sidebar con navegación..."

cat > src/components/Layout/Sidebar.tsx << 'SIDEBAR'
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
SIDEBAR

# ============================================
# 8. ACTUALIZAR TopBar
# ============================================
echo "📡 Actualizando TopBar..."

cat > src/components/Layout/TopBar.tsx << 'TOPBAR'
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
TOPBAR

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ ¡Funcionalidades agregadas exitosamente!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📋 Componentes creados:"
echo "   • Security Score (círculo interactivo)"
echo "   • Stats Cards (4 tarjetas de estadísticas)"
echo "   • Dashboard Charts (gráficas de señal y tráfico)"
echo "   • Networks Table (tabla de redes WiFi)"
echo "   • Vulnerability Panel (panel de vulnerabilidades)"
echo ""
echo "🚀 Para ver los cambios, reinicia el servidor:"
echo "   npm start"
echo ""
