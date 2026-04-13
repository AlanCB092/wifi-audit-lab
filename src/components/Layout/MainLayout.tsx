import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RealDashboard from '../Dashboard/RealDashboard';
import NetworksRecon from '../Networks/NetworksRecon';
import TrafficAnalysis from '../Traffic/TrafficAnalysis';
import DevicesList from '../Devices/DevicesList';
import LabMode from '../Lab/LabMode';
import ReportsView from '../Reports/ReportsView';

type View = 'dashboard' | 'networks' | 'traffic' | 'devices' | 'lab' | 'reports';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [totalNetworks, setTotalNetworks] = useState(0);

  React.useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/networks');
        const data = await response.json();
        setTotalNetworks(data.networks?.length || 0);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchTotal();
    const interval = setInterval(fetchTotal, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <RealDashboard />;
      case 'networks': return <NetworksRecon />;
      case 'traffic': return <TrafficAnalysis />;
      case 'devices': return <DevicesList />;
      case 'lab': return <LabMode />;
      case 'reports': return <ReportsView />;
      default: return <RealDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-cyber-dark">
      <Sidebar onNavigate={setCurrentView} currentView={currentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar totalNetworks={totalNetworks} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
