'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@vechain/dapp-kit-react';
import { getDigitalTwinABI, DIGITAL_TWIN_CONTRACT_ADDRESS } from '@/lib/vechain';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@vechain/dapp-kit-react';
import { useIsMounted } from '@/lib/hooks';
import { Connex } from '@vechain/connex';
import { AIInsights } from '@/components/AIInsights';
import { RewardsBalance } from '@/components/RewardsBalance';
import { useMyTokens } from '@/lib/hooks/useMyTokens';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProductHistory {
  timestamp: bigint;
  eventDescription: string;
  actor: string;
}

interface Metadata extends Record<string, unknown> {
  name?: string;
  description?: string;
  image?: string;
  materials?: string;
  attributes?: { trait_type: string; value: string }[];
}

const ProductPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="container mx-auto px-4">
      <Skeleton className="h-8 w-48 mb-12" />
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params.id as string;

  const { account: address } = useWallet();
  const isMounted = useIsMounted();
  const connex = useMemo(() => new Connex({ node: 'https://testnet.vechain.org/', network: 'test' }), []);

  const { tokens: myTokens } = useMyTokens(); // Fetch all user tokens for navigation

  const [history, setHistory] = useState<ProductHistory[] | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [retired, setRetired] = useState<boolean | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenId) return;
      setIsLoading(true);
      try {
        const contract = connex.thor.account(DIGITAL_TWIN_CONTRACT_ADDRESS);
        const abi = getDigitalTwinABI();

        const [historyRes, uriRes, ownerRes, retiredRes] = await Promise.all([
          contract.method(abi.find(f => f.name === 'getHistory')!).call(tokenId),
          contract.method(abi.find(f => f.name === 'tokenURI')!).call(tokenId),
          contract.method(abi.find(f => f.name === 'ownerOf')!).call(tokenId),
          contract.method(abi.find(f => f.name === 'isRetired')!).call(tokenId),
        ]);

        setHistory(historyRes.decoded[0]);
        setUri(uriRes.decoded[0]);
        setOwner(ownerRes.decoded[0]);
        setRetired(retiredRes.decoded[0]);

        if (uriRes.decoded[0]) {
          const metaResponse = await fetch(uriRes.decoded[0]);
          if (metaResponse.ok) {
            setMetadata(await metaResponse.json());
          }
        }
      } catch (error) {
        console.error('Failed to fetch product data:', error);
        toast.error('Failed to load product data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [connex, tokenId]);

  const { prevTokenId, nextTokenId } = useMemo(() => {
    if (myTokens.length === 0) return { prevTokenId: null, nextTokenId: null };
    const currentIndex = myTokens.findIndex(t => t.tokenId === tokenId);
    if (currentIndex === -1) return { prevTokenId: null, nextTokenId: null };

    const prevIndex = (currentIndex - 1 + myTokens.length) % myTokens.length;
    const nextIndex = (currentIndex + 1) % myTokens.length;

    return {
      prevTokenId: myTokens[prevIndex].tokenId,
      nextTokenId: myTokens[nextIndex].tokenId,
    };
  }, [myTokens, tokenId]);

  if (!isMounted) return <ProductPageSkeleton />;

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
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
    return <ProductPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Products
          </Button>
          <div className="flex gap-2">
            {prevTokenId && (
              <Link href={`/product/${prevTokenId}`} passHref>
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
              </Link>
            )}
            {nextTokenId && (
              <Link href={`/product/${nextTokenId}`} passHref>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4" /></Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden shadow-lg">
              {metadata?.image ? (
                <img
                  src={metadata.image}
                  alt={metadata.name || 'Product Image'}
                  className="w-full h-full max-h-[600px] object-contain rounded-md"
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-500">No Image Available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Info & AI */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{metadata?.name || `Digital Twin #${tokenId}`}</CardTitle>
                <div className="flex gap-2 pt-2">
                  <Badge variant={retired ? 'destructive' : 'default'}>
                    {retired ? 'Retired' : 'Active'}
                  </Badge>
                  <Badge variant="secondary">Owner: {owner?.slice(0, 6)}...{owner?.slice(-4)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">{metadata?.description || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Materials</h4>
                  <p className="text-sm text-muted-foreground">{metadata?.materials || 'N/A'}</p>
                </div>
                {metadata?.attributes && metadata.attributes.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Attributes</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {metadata.attributes.map((attr, idx) => (
                        <Badge key={idx} variant="outline">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <AIInsights history={history} retired={retired} metadata={metadata} />
          </div>
        </div>
      </div>
    </div>
  );
}