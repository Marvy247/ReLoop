'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@vechain/dapp-kit-react';
import { getDigitalTwinABI, DIGITAL_TWIN_CONTRACT_ADDRESS } from '@/lib/vechain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { WalletButton } from '@vechain/dapp-kit-react';
import { useIsMounted } from '@/lib/hooks';
import { Loader2, ArrowLeft, Inbox } from 'lucide-react';
import { encodeFunctionData } from 'viem';
import { RewardsBalance } from '@/components/RewardsBalance';
import { useMyTokens } from '@/lib/hooks/useMyTokens';

export default function RecyclePage() {
  const { account: address, requestTransaction } = useWallet();
  const isMounted = useIsMounted();

  // Use the custom hook to fetch all tokens
  const { tokens, isLoading: isLoadingTokens } = useMyTokens();

  // Filter for recyclable (non-retired) tokens
  const recyclableTokens = useMemo(() => tokens.filter(token => !token.retired), [tokens]);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, setIsPending] = useState(false);

  const handleSelectToken = (tokenId: string) => {
    setSelectedTokenId(tokenId);
  };

  const handleBackToList = () => {
    setSelectedTokenId(null);
    setSponsorAddress('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (sponsorAddress.trim() && !/^0x[a-fA-F0-9]{40}$/.test(sponsorAddress)) {
      newErrors.sponsorAddress = 'Sponsor address must be a valid Ethereum address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRetire = async () => {
    if (!validateForm() || !selectedTokenId) return;
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    setIsPending(true);
    try {
      const functionName = sponsorAddress.trim() ? 'retireAndSponsor' : 'retire';
      const args = sponsorAddress.trim() ? [selectedTokenId, sponsorAddress] : [selectedTokenId];

      const encodedData = encodeFunctionData({
        abi: getDigitalTwinABI(),
        functionName,
        args,
      });

      const clause = {
        to: DIGITAL_TWIN_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData,
      };

      const response = await requestTransaction([clause]);

      if (response && response.txid) {
        toast.success('Product retired and reward claimed!');
        handleBackToList();
        // Trigger a refetch of tokens in the hook
        setTimeout(() => window.dispatchEvent(new Event('fetchMyTokens')), 2000);
      } else {
        throw new Error('Transaction failed or was cancelled.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
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
            <CardDescription>Please connect your wallet to see your products.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTokenId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <Card className="w-full max-w-md lg:max-w-lg mx-auto animate-in fade-in">
            <CardHeader>
              <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <CardTitle className="pt-8">Retire Digital Twin</CardTitle>
              <CardDescription>
                You are about to retire Digital Twin #{selectedTokenId} and claim your B3TR rewards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Verified Token ID</Label>
                <Input id="tokenId" type="text" value={selectedTokenId} readOnly className="bg-gray-100 dark:bg-gray-800" />
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
              </div>
              <Button onClick={handleRetire} className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Retire & Claim Reward'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <RewardsBalance />
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">My Recyclable Products</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Select one of your active Digital Twins to begin the recycling process and claim your B3TR rewards.
          </p>
        </div>

        {isLoadingTokens ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recyclableTokens.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recyclableTokens.map(token => (
              <Card key={token.tokenId} className="hover:shadow-lg transition-shadow">
                <img src={token.image} alt={token.name} className="w-full h-48 object-cover rounded-t-lg" />
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{token.name}</h3>
                  <p className="text-sm text-gray-500">ID: {token.tokenId}</p>
                  <Button className="w-full mt-4" onClick={() => handleSelectToken(token.tokenId)}>
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Inbox className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="mt-6 text-xl font-semibold">No Recyclable Products Found</h2>
            <p className="mt-2 text-gray-500">It looks like you don&apos;t own any active Digital Twins. Mint one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}