'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@vechain/dapp-kit-react';
import { getB3TR_ABI, B3TR_CONTRACT_ADDRESS } from '@/lib/vechain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMounted } from '@/lib/hooks';
import { Connex } from '@vechain/connex';
import { Coins, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { encodeFunctionData } from 'viem';
import { Loader2 } from 'lucide-react';

export const RewardsBalance: React.FC = () => {
  const { account: address, requestTransaction } = useWallet();
  const isMounted = useIsMounted();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const connex = new Connex({ node: 'https://testnet.vechain.org/', network: 'test' });

  const fetchBalance = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const contract = connex.thor.account(B3TR_CONTRACT_ADDRESS);
      const abi = getB3TR_ABI();

      const balanceOfMethod = abi.find(f => f.name === 'balanceOf');
      if (!balanceOfMethod) {
        throw new Error('balanceOf method not found in ABI');
      }

      const balanceResult = await contract.method(balanceOfMethod).call(address);
      const balanceValue = balanceResult.decoded[0];

      // Convert from wei to B3TR (assuming 18 decimals)
      const formattedBalance = (Number(balanceValue) / 10**18).toFixed(2);
      setBalance(formattedBalance);
    } catch (error) {
      console.error('Failed to fetch B3TR balance:', error);
      setBalance('0.00');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !recipientAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (balance && amount > parseFloat(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      const b3trABI = getB3TR_ABI();

      // Convert amount to wei
      const amountInWei = (amount * 10**18).toString();

      const encodedData = encodeFunctionData({
        abi: b3trABI,
        functionName: 'transfer',
        args: [recipientAddress, amountInWei],
      });

      const clause = {
        to: B3TR_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData,
      };

      const response = await requestTransaction([clause]);
      if (response && response.txid) {
        toast.success(`Successfully withdrew ${amount} B3TR!`);
        setWithdrawAmount('');
        setRecipientAddress('');
        setIsWithdrawDialogOpen(false);
        // Refresh balance
        fetchBalance();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: unknown) {
      console.error('Withdraw error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Withdraw failed: ${errorMessage}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isMounted || !address) {
    return null;
  }

  return (
    <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="w-5 h-5 text-green-600" />
          Your B3TR Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {isLoading ? '...' : `${balance} B3TR`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earned through sustainable recycling
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Active
            </Badge>
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                  <ArrowDownToLine className="w-4 h-4 mr-1" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw B3TR Tokens</DialogTitle>
                  <DialogDescription>
                    Transfer your B3TR rewards to another address. Current balance: {balance} B3TR
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (B3TR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleWithdraw} className="w-full" disabled={isWithdrawing}>
                    {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Withdraw Tokens
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
