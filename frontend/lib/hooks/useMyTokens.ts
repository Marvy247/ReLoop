'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@vechain/dapp-kit-react';
import { getDigitalTwinABI, DIGITAL_TWIN_CONTRACT_ADDRESS } from '@/lib/vechain';
import { Connex } from '@vechain/connex';
import { toast } from 'sonner';

export interface TokenData {
  tokenId: string;
  name: string;
  image: string;
  retired: boolean;
}

export const useMyTokens = () => {
  const { account: address } = useWallet();
  const connex = useMemo(() => new Connex({ node: 'https://testnet.vechain.org/', network: 'test' }), []);

  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyTokens = async () => {
      if (!address) {
        setTokens([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const contract = connex.thor.account(DIGITAL_TWIN_CONTRACT_ADDRESS);
        const abi = getDigitalTwinABI();

        const balanceOfMethod = abi.find(f => f.name === 'balanceOf');
        const tokenOfOwnerByIndexMethod = abi.find(f => f.name === 'tokenOfOwnerByIndex');
        const tokenURIMethod = abi.find(f => f.name === 'tokenURI');
        const isRetiredMethod = abi.find(f => f.name === 'isRetired');

        if (!balanceOfMethod || !tokenOfOwnerByIndexMethod || !tokenURIMethod || !isRetiredMethod) {
          throw new Error('A required contract method was not found in the ABI.');
        }

        const balanceResult = await contract.method(balanceOfMethod).call(address);
        const balance = Number(balanceResult.decoded[0]);

        if (balance === 0) {
          setTokens([]);
          setIsLoading(false);
          return;
        }

        const tokenPromises = Array.from({ length: balance }, async (_, index) => {
          const tokenIdResult = await contract.method(tokenOfOwnerByIndexMethod).call(address, index);
          const tokenId = tokenIdResult.decoded[0].toString();

          const isRetiredResult = await contract.method(isRetiredMethod).call(tokenId);
          const retired = isRetiredResult.decoded[0];

          const uriResult = await contract.method(tokenURIMethod).call(tokenId);
          const metadataUri = uriResult.decoded[0];

          const metadata = { name: `Token #${tokenId}`, image: '/placeholder.svg' };
          try {
            const metadataResponse = await fetch(metadataUri);
            if (metadataResponse.ok) {
              const fetchedMetadata = await metadataResponse.json();
              metadata.name = fetchedMetadata.name || metadata.name;
              metadata.image = fetchedMetadata.image || metadata.image;
            }
          } catch (e) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, e);
          }

          return {
            tokenId,
            name: metadata.name,
            image: metadata.image,
            retired,
          };
        });

        const fetchedTokens = await Promise.all(tokenPromises);
        setTokens(fetchedTokens);
      } catch (e) {
        console.error('Failed to fetch tokens:', e);
        toast.error('There was an error fetching your Digital Twins.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTokens();

    // Custom event listener to allow other components to trigger a refetch
    const handleRefetch = () => fetchMyTokens();
    window.addEventListener('fetchMyTokens', handleRefetch);
    return () => {
      window.removeEventListener('fetchMyTokens', handleRefetch);
    };

  }, [address, connex]);

  return { tokens, isLoading };
};
