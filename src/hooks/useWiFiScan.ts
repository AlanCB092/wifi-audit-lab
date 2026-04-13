import { useState, useCallback } from 'react';

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  channel: number;
  signal: number;
  encryption: 'WPA2' | 'WPA3' | 'Open' | 'WEP';
  risk: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
}

export const useWiFiScan = () => {
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const startScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    
    // Por ahora, datos mock. Luego conectaremos con backend real
    setTimeout(() => {
      const mockNetworks: WiFiNetwork[] = [
        { ssid: 'Office_WiFi', bssid: 'AA:BB:CC:DD:EE:FF', channel: 6, signal: -45, encryption: 'WPA3', risk: 'Safe' },
        { ssid: 'Guest_Network', bssid: '11:22:33:44:55:66', channel: 1, signal: -67, encryption: 'Open', risk: 'Critical' },
        { ssid: 'IoT_Devices', bssid: '77:88:99:AA:BB:CC', channel: 11, signal: -52, encryption: 'WPA2', risk: 'Medium' },
      ];
      setNetworks(mockNetworks);
      setScanning(false);
    }, 2000);
  }, []);
  
  return { scanning, networks, error, startScan };
};
