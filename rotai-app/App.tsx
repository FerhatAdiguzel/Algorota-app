import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import NetworkError from './src/components/NetworkError';

export default function App() {
  const { isConnected, checkConnection } = useNetworkStatus();

  return (
    <>
      <AppNavigator />
      <NetworkError 
        visible={!isConnected} 
        onRetry={checkConnection} 
      />
    </>
  );
}