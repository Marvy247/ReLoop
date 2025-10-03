'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@vechain/dapp-kit-react';
import { getDigitalTwinABI, DIGITAL_TWIN_CONTRACT_ADDRESS } from '@/lib/vechain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { WalletButton } from '@vechain/dapp-kit-react';
import { useIsMounted } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';
import { encodeFunctionData } from 'viem';
import { RewardsBalance } from '@/components/RewardsBalance';

export default function RecyclePage() {
  const [tokenId, setTokenId] = useState('');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { account: address, requestTransaction } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const isMounted = useIsMounted();

  // Monitor wallet connection changes
  useEffect(() => {
    console.log('Wallet connection status changed:', address ? 'connected' : 'disconnected');
  }, [address]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tokenId.trim()) {
      newErrors.tokenId = 'Token ID is required';
    } else if (isNaN(Number(tokenId)) || Number(tokenId) <= 0) {
      newErrors.tokenId = 'Token ID must be a positive number';
    }
    if (sponsorAddress.trim() && !/^0x[a-fA-F0-9]{40}$/.test(sponsorAddress)) {
      newErrors.sponsorAddress = 'Sponsor address must be a valid Ethereum address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setTokenId('');
    setSponsorAddress('');
    setErrors({});
  };

  const handleRetire = async () => {
    if (!validateForm()) return;

    console.log('Checking wallet connection:');
    console.log('Address:', address);

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    console.log('Retiring with the following data:');
    console.log('Token ID:', tokenId);
    console.log('Sponsor Address:', sponsorAddress || 'None');

    setIsPending(true);
    try {
      const digitalTwinABI = getDigitalTwinABI();
      console.log('Digital Twin ABI:', digitalTwinABI);

      const functionName = sponsorAddress.trim() ? 'retireAndSponsor' : 'retire';
      const args = sponsorAddress.trim() ? [tokenId, sponsorAddress] : [tokenId];
      console.log('Function name:', functionName);
      console.log('Function args:', args);

      const encodedData = encodeFunctionData({
        abi: digitalTwinABI,
        functionName,
        args,
      });

      const clause = {
        to: DIGITAL_TWIN_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData,
      };

      console.log('Clause:', clause);

      const response = await requestTransaction([clause]);
      console.log('Transaction response:', response);

      // Check if transaction was successful
      if (response && response.txid) {
        toast.success('Product retired and reward claimed!');
        clearForm();
      } else {
        throw new Error('Transaction failed - no txid returned');
      }
    } catch (error: unknown) {
      console.error('Retire error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      toast.error(`Error: ${errorMessage}`);

      // Check if wallet is still connected after error
      console.log('Wallet address after error:', address);
    } finally {
      setIsPending(false);
    }
  };

  if (!isMounted) return null;

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Recycle Product</CardTitle>
            <CardDescription>Please connect your wallet to retire a product.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <RewardsBalance />
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Recycling your Digital Twin NFT helps promote sustainability by retiring the product and claiming B3TR rewards for your contribution to the circular economy.
          </p>
        </div>
        <Card className="w-full max-w-md lg:max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Recycle Product</CardTitle>
            <CardDescription>
              Retire a Digital Twin NFT to claim B3TR rewards. Enter the token ID of the product you wish to recycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                type="number"
                placeholder="Enter token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className={errors.tokenId ? 'border-red-500' : ''}
              />
              {errors.tokenId && <p className="text-red-500 text-sm">{errors.tokenId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsorAddress">Sponsor Address (Optional)</Label>
              <Input
                id="sponsorAddress"
                placeholder="Enter sponsor address (0x...)"
                value={sponsorAddress}
                onChange={(e) => setSponsorAddress(e.target.value)}
                className={errors.sponsorAddress ? 'border-red-500' : ''}
              />
              {errors.sponsorAddress && <p className="text-red-500 text-sm">{errors.sponsorAddress}</p>}
              <p className="text-xs text-gray-500">If provided, the sponsor must have BRAND_ROLE to cover transaction fees.</p>
            </div>
            <Button onClick={handleRetire} className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Retire & Claim Reward
            </Button>
            <Button
              variant="outline"
              onClick={clearForm}
              className="w-full mt-2"
              disabled={isPending}
            >
              Clear
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Retiring as: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
