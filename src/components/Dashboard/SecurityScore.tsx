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
