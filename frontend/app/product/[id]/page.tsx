'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@vechain/dapp-kit-react';
import { getDigitalTwinABI, DIGITAL_TWIN_CONTRACT_ADDRESS } from '@/lib/vechain';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { WalletButton } from '@vechain/dapp-kit-react';
import { useIsMounted } from '@/lib/hooks';
import { Connex } from '@vechain/connex';
import { AIInsights } from '@/components/AIInsights';
import { RewardsBalance } from '@/components/RewardsBalance';

interface ProductHistory {
  timestamp: bigint;
  eventDescription: string;
  actor: string;
}

interface Metadata {
  name?: string;
  description?: string;
  image?: string;
  materials?: string;
  attributes?: { trait_type: string; value: string }[];
}

export default function ProductPage() {
  const params = useParams();
  const tokenId = params.id as string;
  const router = useRouter();

  const { account: address } = useWallet();
  const isMounted = useIsMounted();
  const mountedRef = useRef(true);

  const connex = useMemo(() => new Connex({ node: 'https://testnet.vechain.org/', network: 'test' }), []);

  const [history, setHistory] = useState<ProductHistory[] | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [retired, setRetired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      if (!tokenId) return;

      setIsLoading(true);
      try {
        const contract = connex.thor.account(DIGITAL_TWIN_CONTRACT_ADDRESS);
        const abi = getDigitalTwinABI();

        const getHistoryMethod = abi.find(f => f.name === 'getHistory');
        const tokenURIMethod = abi.find(f => f.name === 'tokenURI');
        const ownerOfMethod = abi.find(f => f.name === 'ownerOf');
        const isRetiredMethod = abi.find(f => f.name === 'isRetired');

        if (!getHistoryMethod || !tokenURIMethod || !ownerOfMethod || !isRetiredMethod) {
          throw new Error('One or more contract methods not found in ABI');
        }

        const [history, uri, owner, retired] = await Promise.all([
          contract.method(getHistoryMethod).call(tokenId),
          contract.method(tokenURIMethod).call(tokenId),
          contract.method(ownerOfMethod).call(tokenId),
          contract.method(isRetiredMethod).call(tokenId),
        ]);

        if (mountedRef.current) {
          setHistory(history.decoded[0]);
          setUri(uri.decoded[0]);
          setOwner(owner.decoded[0]);
          setRetired(retired.decoded[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product data:', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [connex, tokenId]);

  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    const fetchMetadata = async (abortController: AbortController) => {
      if (!uri) return;
      setIsLoadingMetadata(true);
      try {
        const response = await fetch(uri, { signal: abortController.signal });
        if (!response.ok) throw new Error('Failed to fetch metadata');
        const data = await response.json();
        if (mountedRef.current) {
          setMetadata(data);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError' && mountedRef.current) {
          setMetadata(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoadingMetadata(false);
        }
      }
    };

    const abortController = new AbortController();
    fetchMetadata(abortController);

    return () => {
      abortController.abort();
    };
  }, [uri]);

  if (!isMounted) return null;

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>View Product</CardTitle>
            <CardDescription>Please connect your wallet to view product details.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <RewardsBalance />
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          Back
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Digital Twin #{tokenId}</h1>
          <div className="flex gap-2">
            <Badge variant={retired ? 'destructive' : 'default'}>
              {retired ? 'Retired' : 'Active'}
            </Badge>
            <Badge variant="outline">
              Owner: {owner?.slice(0, 6)}...{owner?.slice(-4)}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Metadata URI:</p>
                <p className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">{uri}</p>
              </div>
              {metadata ? (
                <div className="space-y-4">
                  {metadata.image && (
                    <div>
                      <img
                        src={metadata.image}
                        alt={metadata.name || 'Product Image'}
                        className="w-full max-h-64 rounded-md object-contain"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm">Name</p>
                      <p>{metadata.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Materials</p>
                      <p>{metadata.materials || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Description</p>
                    <p className="text-sm">{metadata.description || 'N/A'}</p>
                  </div>
                  {metadata.attributes && metadata.attributes.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Attributes</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {metadata.attributes.map((attr: { trait_type: string; value: string }, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {attr.trait_type}: {attr.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Metadata not available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle History</CardTitle>
              <CardDescription>Complete timeline of product events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {history && history.length > 0 ? (
                  <div className="space-y-6">
                    {history.map((event: ProductHistory, index: number) => (
                      <div key={index} className="flex gap-4 relative">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-green-200 dark:bg-green-800 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-medium">{event.eventDescription}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(Number(event.timestamp) * 1000).toLocaleDateString()} at{' '}
                            {new Date(Number(event.timestamp) * 1000).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Actor: {event.actor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AIInsights />
    </div>
  );
}
