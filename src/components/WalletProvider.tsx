'use client';

import { createContext, useContext, ReactNode } from 'react';
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

interface WalletContextType {
  // Add any additional context values here if needed
}

const WalletContext = createContext<WalletContextType>({});

export const useWalletContext = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function AppWalletProvider({ children }: WalletProviderProps) {
  return (
    <WalletProvider 
      autoConnect={false}
      enableUnsafeBurner={false}
    >
      <WalletContext.Provider value={{}}>
        {children}
      </WalletContext.Provider>
    </WalletProvider>
  );
}
