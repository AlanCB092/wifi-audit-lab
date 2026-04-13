export interface SecurityScore {
  score: number;
  status: 'Secure' | 'Risky' | 'Critical';
}

export interface NetworkStats {
  totalNetworks: number;
  activeDevices: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface TrafficData {
  timestamp: string;
  packets: number;
  protocol: 'DNS' | 'HTTP' | 'HTTPS' | 'ARP';
}
