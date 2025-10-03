'use client';

import { useMyTokens, TokenData } from '@/lib/hooks/useMyTokens';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@vechain/dapp-kit-react';
import { WalletButton } from '@vechain/dapp-kit-react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';

const TokenCard = ({ token }: { token: TokenData }) => (
  <Link href={`/product/${token.tokenId}`} passHref>
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div className="relative">
        <img
          src={token.image}
          alt={token.name}
          className="w-full h-56 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
        />
        <Badge
          className="absolute top-2 right-2"
          variant={token.retired ? 'destructive' : 'default'}
        >
          {token.retired ? 'Retired' : 'Active'}
        </Badge>
        {token.retired && <div className="absolute inset-0 bg-black/40 rounded-t-lg"></div>}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">{token.name}</h3>
        <p className="text-sm text-gray-500">ID: {token.tokenId}</p>
      </CardContent>
    </Card>
  </Link>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
        <CardContent className="p-4 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function DashboardPage() {
  const { account } = useWallet();
  const { tokens, isLoading } = useMyTokens();

  if (!account) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-500 mb-6">Please connect your wallet to view your Digital Twin dashboard.</p>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">My Digital Twins</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          This is your personal collection of products. Click on any item to view its lifecycle, history, and AI-powered sustainability insights.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : tokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokens.map(token => (
            <TokenCard key={token.tokenId} token={token} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Inbox className="w-20 h-20 mx-auto text-gray-400" />
          <h2 className="mt-8 text-2xl font-semibold">Your Collection is Empty</h2>
          <p className="mt-3 text-gray-500">It looks like you don&apos;t own any Digital Twins yet.</p>
          <Link href="/mint" passHref>
            <Button className="mt-8">Mint Your First Product</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
