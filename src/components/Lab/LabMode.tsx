import React, { useState } from 'react';
import { FlaskConical, AlertTriangle, Play, StopCircle } from 'lucide-react';

const LabMode: React.FC = () => {
  const [labActive, setLabActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const startLab = () => {
    setShowWarning(true);
  };

  const confirmStart = () => {
    setLabActive(true);
    setShowWarning(false);
    setEvents(['🟢 Modo Laboratorio activado', '📡 Iniciando simulación de red', '🔍 Escaneando dispositivos...']);
    
    setTimeout(() => {
      setEvents(prev => [...prev, '⚠️ Vulnerabilidad detectada en red WiFi']);
    }, 3000);
    
    setTimeout(() => {
      setEvents(prev => [...prev, '🛡️ Ejecutando contramedidas...']);
    }, 6000);
  };

  const stopLab = () => {
    setLabActive(false);
    setEvents(prev => [...prev, '🔴 Modo Laboratorio desactivado']);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-cyber-blue mb-2">Lab Mode</h1>
        <p className="text-gray-400">Simulación de auditoría WiFi en entorno controlado</p>
      </div>
      
      <div className="card bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className={`w-8 h-8 ${labActive ? 'text-cyber-green animate-pulse' : 'text-cyber-blue'}`} />
            <div>
              <p className="text-lg font-semibold text-white">
                Modo: {labActive ? 'LAB ACTIVO' : 'SAFE MODE'}
              </p>
              <p className="text-sm text-gray-400">
                {labActive ? 'Simulación en curso' : 'Entorno seguro'}
              </p>
            </div>
          </div>
          {!labActive ? (
            <button onClick={startLab} className="btn-primary flex items-center gap-2">
              <Play className="w-4 h-4" />
              Activar Lab Mode
            </button>
          ) : (
            <button onClick={stopLab} className="btn-secondary flex items-center gap-2">
              <StopCircle className="w-4 h-4" />
              Desactivar
            </button>
          )}
        </div>
      </div>
      
      {labActive && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Eventos en Tiempo Real</h2>
          <div className="space-y-2 font-mono text-sm">
            {events.map((event, idx) => (
              <div key={idx} className="text-gray-300 border-l-2 border-cyber-blue pl-3 py-1">
                {event}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="card max-w-md mx-4">
            <AlertTriangle className="w-12 h-12 text-cyber-orange mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white text-center mb-2">Advertencia</h2>
            <p className="text-gray-400 text-center mb-4">
              El modo laboratorio simula ataques y vulnerabilidades. 
              Asegúrate de tener autorización para realizar pruebas.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmStart} className="btn-primary flex-1">Aceptar</button>
              <button onClick={() => setShowWarning(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabMode;
