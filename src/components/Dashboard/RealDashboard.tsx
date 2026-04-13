import React, { useState, useEffect } from 'react';
import SecurityScore from './SecurityScore';
import StatsCards from './StatsCards';
import DashboardCharts from './DashboardCharts';
import RealNetworksTable from '../Networks/RealNetworksTable';
import VulnerabilityPanel from './VulnerabilityPanel';

interface NetworkStats {
  totalNetworks: number;
  activeDevices: number;
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
}

const RealDashboard: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    totalNetworks: 0,
    activeDevices: 0,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 }
  });
  const [securityScore, setSecurityScore] = useState(72);
  const [, setNetworks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/networks');
        const data = await response.json();
        setNetworks(data.networks || []);
        
        const total = data.networks?.length || 0;
        const critical = data.networks?.filter((n: any) => n.risk === 'Critical').length || 0;
        const high = data.networks?.filter((n: any) => n.risk === 'High').length || 0;
        const medium = data.networks?.filter((n: any) => n.risk === 'Medium').length || 0;
        const low = data.networks?.filter((n: any) => n.risk === 'Low').length || 0;
        
        setStats({
          totalNetworks: total,
          activeDevices: total * 3,
          vulnerabilities: { critical, high, medium, low }
        });
        
        const score = Math.max(0, 100 - (critical * 20 + high * 10 + medium * 5));
        setSecurityScore(score);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SecurityScore score={securityScore} status={securityScore >= 80 ? 'Secure' : securityScore >= 50 ? 'Risky' : 'Critical'} />
        <div className="lg:col-span-2">
          <StatsCards totalNetworks={stats.totalNetworks} activeDevices={stats.activeDevices} vulnerabilities={stats.vulnerabilities} />
        </div>
      </div>
      <DashboardCharts />
      <RealNetworksTable />
      <VulnerabilityPanel />
    </div>
  );
};

export default RealDashboard;
