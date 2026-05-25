import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    checkConnection();
    // 5 saniyede bir kontrol et (simülasyon listener)
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const status = await Network.getNetworkStateAsync();
      setIsConnected(!!status.isConnected && !!status.isInternetReachable);
    } catch (error) {
      console.error(error);
      setIsConnected(false);
    }
  };

  return { isConnected, checkConnection };
};
