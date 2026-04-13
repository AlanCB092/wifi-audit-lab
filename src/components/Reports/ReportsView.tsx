import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';

const ReportsView: React.FC = () => {
  const [networks, setNetworks] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/networks');
        const data = await response.json();
        setNetworks(data.networks || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchNetworks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-cyber-blue mb-2">Reports</h1>
        <p className="text-gray-400">Genera reportes profesionales de auditoría</p>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Resumen de Auditoría</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-cyber-dark rounded-lg">
            <p className="text-2xl font-bold text-cyber-blue">{networks.length}</p>
            <p className="text-sm text-gray-400">Redes Detectadas</p>
          </div>
          <div className="text-center p-4 bg-cyber-dark rounded-lg">
            <p className="text-2xl font-bold text-cyber-green">{networks.filter(n => n.risk === 'Safe').length}</p>
            <p className="text-sm text-gray-400">Redes Seguras</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exportar Markdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
