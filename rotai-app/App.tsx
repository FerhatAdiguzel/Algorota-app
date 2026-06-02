import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import NetworkError from './src/components/NetworkError';
import { ThemeProvider } from './src/context/ThemeContext';
import { TranslationProvider } from './src/services/i18n';

export default function App() {
  const { isConnected, checkConnection } = useNetworkStatus();

  return (
    <TranslationProvider>
      <ThemeProvider>
        <AppNavigator />
        <NetworkError 
          visible={!isConnected} 
          onRetry={checkConnection} 
        />
      </ThemeProvider>
    </TranslationProvider>
  );
}