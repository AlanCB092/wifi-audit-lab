import React from 'react';
import RealNetworksTable from './RealNetworksTable';

const NetworksRecon: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-cyber-blue mb-2">Networks Recon</h1>
        <p className="text-gray-400 mb-6">Escaneo y análisis de redes WiFi cercanas</p>
      </div>
      <RealNetworksTable />
    </div>
  );
};

export default NetworksRecon;
