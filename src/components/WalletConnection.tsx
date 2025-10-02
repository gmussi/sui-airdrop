'use client';

import { useState, useEffect } from 'react';
import { useWallet, ConnectButton } from '@suiet/wallet-kit';
import { Button } from './ui/Button';
import { Wallet } from 'lucide-react';

export function WalletConnection() {
  const { 
    connected, 
    connecting, 
    select, 
    disconnect, 
    wallets, 
    currentWallet,
    account
  } = useWallet();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  console.log('WalletConnection Debug:', {
    wallets: wallets,
    walletsLength: wallets?.length,
    connected,
    connecting,
    currentWallet,
    account,
    accountAddress: account?.address,
    mounted
  });

  if (!mounted) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Loading wallet detection...</span>
        </div>
      </div>
    );
  }

  if (connected && currentWallet) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Connected: {currentWallet.name}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  const handleConnect = (walletName: string) => {
    select(walletName);
  };

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5" />
        Connect Your Wallet
      </h3>
      <p className="text-gray-600 mb-6">
        Connect your wallet to start distributing tokens on the SUI network.
      </p>
      
      <div className="space-y-4">
        {/* Primary Connect Button */}
        <div className="text-center">
          <ConnectButton />
        </div>
        
        {/* Debug Information (Collapsible) */}
        <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <summary className="text-xs text-gray-600 cursor-pointer font-medium">
            Debug Information (Click to expand)
          </summary>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">
              Wallets array length: {wallets?.length || 'undefined'}
            </p>
            <p className="text-xs text-gray-600">
              Connected: {connected ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Connecting: {connecting ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Window.suiet: {typeof window !== 'undefined' && (window as any).suiet ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Window.sui: {typeof window !== 'undefined' && (window as any).sui ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Mounted: {mounted ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Has Account: {account ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">
              Account Address: {account?.address || 'None'}
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
