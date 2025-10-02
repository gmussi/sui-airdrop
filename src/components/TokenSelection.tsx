'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Button } from './ui/Button';
import { Coins, Wallet } from 'lucide-react';
import Image from 'next/image';

interface TokenBalance {
  coinType: string;
  coinObjectId: string;
  version: string;
  digest: string;
  balance: string;
  previousTransaction: string;
}

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string;
}

interface TokenSelectionProps {
  onTokenSelect: (tokenType: string, tokenInfo: Record<string, TokenInfo>) => void;
}

// Whitelisted tokens
const WHITELISTED_TOKENS = [
  '0x7262fb2f7a3a14c888c438a3cd9b912469a58cf60f367352c46584262e8299aa::ika::IKA',
  '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  '0xb2f40a50fec54e308e69c71271b04a30fc470b1db683dff9e64c752bc1f6384d::coin::COIN'
];

export function TokenSelection({ onTokenSelect }: TokenSelectionProps) {
  const { account, connected } = useWallet();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<Record<string, TokenInfo>>({});

  // Debug logging
  console.log('TokenSelection Debug:', {
    account,
    connected,
    hasAccount: !!account,
    accountAddress: account?.address
  });

  useEffect(() => {
    if (account && connected) {
      fetchTokens();
    }
  }, [account, connected, fetchTokens]);

  const fetchTokens = useCallback(async () => {
    if (!account) return;
    
    const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
    setLoading(true);
    try {
      console.log('Fetching tokens for address:', account.address);
      
      // Get coins for each whitelisted token
      console.log('Getting coins for whitelisted tokens:', WHITELISTED_TOKENS);
      const allCoins: TokenBalance[] = [];
      
      for (const tokenType of WHITELISTED_TOKENS) {
        try {
          console.log(`Fetching coins for ${tokenType}...`);
          const coins = await client.getCoins({
            owner: account.address,
            coinType: tokenType,
            limit: 50,
          });
          
          console.log(`Found ${coins.data.length} coins for ${tokenType}`);
          allCoins.push(...coins.data);
        } catch (error) {
          console.warn(`Failed to fetch coins for ${tokenType}:`, error);
        }
      }
      
      console.log('All whitelisted coins:', allCoins);
      console.log('Total coins count:', allCoins.length);
      
      // Merge coins of the same type
      const mergedCoins = allCoins.reduce((acc, coin) => {
        const existingCoin = acc.find(c => c.coinType === coin.coinType);
        if (existingCoin) {
          // Merge balances
          existingCoin.balance = (BigInt(existingCoin.balance) + BigInt(coin.balance)).toString();
          // Keep the first coin object ID for simplicity
        } else {
          acc.push({ ...coin });
        }
        return acc;
      }, [] as TokenBalance[]);
      
      console.log('Merged coins:', mergedCoins);
      console.log('Merged coins count:', mergedCoins.length);
      
      setTokens(mergedCoins);
      
      // Fetch token metadata for each unique coin type
      const uniqueCoinTypes = [...new Set(mergedCoins.map(coin => coin.coinType))];
      const metadataPromises = uniqueCoinTypes.map(async (coinType) => {
        try {
          const metadata = await client.getCoinMetadata({ coinType });
          return {
            coinType,
            metadata: {
              symbol: metadata.symbol,
              name: metadata.name,
              decimals: metadata.decimals,
              iconUrl: metadata.iconUrl,
            }
          };
        } catch (error) {
          console.warn(`Failed to fetch metadata for ${coinType}:`, error);
          return {
            coinType,
            metadata: {
              symbol: coinType.split('::').pop() || 'Unknown',
              name: coinType,
              decimals: 9,
            }
          };
        }
      });
      
      const metadataResults = await Promise.all(metadataPromises);
      const metadataMap = metadataResults.reduce((acc, { coinType, metadata }) => {
        acc[coinType] = metadata;
        return acc;
      }, {} as Record<string, TokenInfo>);
      
      setTokenInfo(metadataMap);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  const formatBalance = (balance: string, decimals: number) => {
    const num = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const whole = num / divisor;
    const remainder = num % divisor;
    
    if (remainder === BigInt(0)) {
      return whole.toString();
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmed = remainderStr.replace(/0+$/, '');
    return trimmed ? `${whole}.${trimmed}` : whole.toString();
  };

  if (!account || !connected) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <Wallet className="w-5 h-5" />
          <span>Please connect your wallet first</span>
        </div>
        
        {/* Debug Information */}
        <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <summary className="text-xs text-gray-600 cursor-pointer font-medium">
            Debug Information (Click to expand)
          </summary>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">
              Connected: {connected ? 'Yes' : 'No'}
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
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Loading your tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Select Token to Distribute
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTokens}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {tokens.length === 0 ? (
          <div className="space-y-2">
            <p className="text-gray-500">No tokens found in your wallet</p>
            <details className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <summary className="text-xs text-gray-600 cursor-pointer font-medium">
                Debug Token Fetching (Click to expand)
              </summary>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  Account Address: {account?.address || 'None'}
                </p>
                <p className="text-xs text-gray-600">
                  Connected: {connected ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-gray-600">
                  Loading: {loading ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-gray-600">
                  Tokens Array Length: {tokens.length}
                </p>
                <p className="text-xs text-gray-600">
                  Network: mainnet
                </p>
                <p className="text-xs text-gray-600">
                  Whitelisted Tokens: {WHITELISTED_TOKENS.length}
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer">Show Whitelisted Tokens</summary>
                  <div className="mt-1 space-y-1">
                    {WHITELISTED_TOKENS.map((token, index) => (
                      <p key={index} className="text-xs text-gray-500 font-mono">
                        {token.split('::').pop()}
                      </p>
                    ))}
                  </div>
                </details>
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token) => {
              const info = tokenInfo[token.coinType];
              const balance = formatBalance(token.balance, info?.decimals || 9);
              
              return (
                <div
                  key={token.coinObjectId}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedToken === token.coinType
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedToken(token.coinType);
                    onTokenSelect(token.coinType, tokenInfo);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {info?.iconUrl ? (
                        <Image
                          src={info.iconUrl}
                          alt={info.symbol}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Coins className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {info?.symbol || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info?.name || token.coinType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{balance}</div>
                      <div className="text-sm text-gray-500">
                        {selectedToken === token.coinType ? 'Selected' : 'Click to select'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
