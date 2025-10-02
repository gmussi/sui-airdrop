'use client';

import { useState } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Button } from './ui/Button';
import { Send, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AirdropRecipient {
  address: string;
  amount: string;
  row: number;
}

interface AirdropExecutionProps {
  selectedToken: string | null;
  recipients: AirdropRecipient[];
  tokenInfo: Record<string, { symbol: string; name: string; decimals: number }>;
}

interface TransactionResult {
  recipient: AirdropRecipient;
  success: boolean;
  txId?: string;
  error?: string;
}

export function AirdropExecution({ selectedToken, recipients, tokenInfo }: AirdropExecutionProps) {
  const { account, connected, signAndExecuteTransactionBlock } = useWallet();
  const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');

  const canExecute = selectedToken && recipients.length > 0 && account && connected;

  const executeAirdrop = async () => {
    if (!canExecute) return;

    setIsExecuting(true);
    setResults([]);
    const newResults: TransactionResult[] = [];

    try {
      // Get all coin objects for the selected token
      const coins = await client.getCoins({
        owner: account!.address,
        coinType: selectedToken,
        limit: 50,
      });

      if (coins.data.length === 0) {
        throw new Error('No coins found for the selected token');
      }

      const tokenDecimals = tokenInfo[selectedToken]?.decimals || 9;
      const totalRequired = recipients.reduce((sum, recipient) => {
        return sum + BigInt(Math.floor(parseFloat(recipient.amount) * Math.pow(10, tokenDecimals)));
      }, BigInt(0));

      const totalAvailable = coins.data.reduce((sum, coin) => {
        return sum + BigInt(coin.balance);
      }, BigInt(0));

      if (totalAvailable < totalRequired) {
        throw new Error('Insufficient token balance for airdrop');
      }

      // Execute transfers in batches
      const batchSize = 10; // Process 10 recipients at a time
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        setCurrentStep(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(recipients.length / batchSize)}`);

        const txb = new TransactionBlock();
        
        // Set the sender
        txb.setSender(account!.address);
        
        // Split coins for each recipient in the batch
        const coinObjects: string[] = [];
        for (const recipient of batch) {
          const amount = BigInt(Math.floor(parseFloat(recipient.amount) * Math.pow(10, tokenDecimals)));
          
          // Find a coin with sufficient balance
          const coinToUse = coins.data.find(coin => BigInt(coin.balance) >= amount);
          if (!coinToUse) {
            // If no single coin has enough, we'd need to merge coins first
            // For simplicity, we'll skip this recipient
            newResults.push({
              recipient,
              success: false,
              error: 'Insufficient single coin balance (would need coin merging)',
            });
            continue;
          }

          const [coin] = txb.splitCoins(txb.object(coinToUse.coinObjectId), [amount]);
          coinObjects.push(coin);
        }

        // Transfer coins to recipients
        batch.forEach((recipient, index) => {
          if (coinObjects[index]) {
            txb.transferObjects([coinObjects[index]], recipient.address);
          }
        });

        try {
          // Execute transaction using the correct API for @mysten/sui.js
          const result = await signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          });

          // Mark all recipients in this batch as successful
          batch.forEach((recipient, index) => {
            if (coinObjects[index]) {
              newResults.push({
                recipient,
                success: true,
                txId: result.digest,
              });
            }
          });

        } catch (error) {
          // Mark all recipients in this batch as failed
          batch.forEach((recipient) => {
            newResults.push({
              recipient,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          });
        }

        setResults([...newResults]);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error('Airdrop execution error:', error);
      // Mark all remaining recipients as failed
      const remainingRecipients = recipients.slice(results.length);
      remainingRecipients.forEach((recipient) => {
        newResults.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });
      setResults([...newResults]);
    } finally {
      setIsExecuting(false);
      setCurrentStep('');
    }
  };

  const successfulTransfers = results.filter(r => r.success).length;
  const failedTransfers = results.filter(r => !r.success).length;

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Execute Airdrop
        </h3>

        {!canExecute ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-800">
                Please connect your wallet, select a token, and upload recipients CSV to proceed.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Airdrop Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Token: {tokenInfo[selectedToken]?.symbol || 'Unknown'}</p>
                <p>• Recipients: {recipients.length}</p>
                <p>• Total Amount: {recipients.reduce((sum, r) => sum + parseFloat(r.amount), 0).toLocaleString()}</p>
              </div>
            </div>

            <Button
              onClick={executeAirdrop}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing Airdrop...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Airdrop
                </>
              )}
            </Button>

            {isExecuting && currentStep && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-700">{currentStep}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Execution Results</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-800 font-medium">
                  Successful: {successfulTransfers}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-800 font-medium">
                  Failed: {failedTransfers}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-mono text-xs">
                      {result.recipient.address.slice(0, 8)}...{result.recipient.address.slice(-8)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({result.recipient.amount})
                    </span>
                  </div>
                  {result.success && result.txId && (
                    <a
                      href={`https://suiexplorer.com/txblock/${result.txId}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View TX
                    </a>
                  )}
                </div>
                {!result.success && result.error && (
                  <div className="mt-1 text-xs text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
