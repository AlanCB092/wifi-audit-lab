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
