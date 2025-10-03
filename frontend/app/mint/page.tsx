'use client';

import { useState } from 'react';
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
import { RecyclingVerifier } from '@/components/RecyclingVerifier';

export default function MintPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageVerified, setIsImageVerified] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { account: address, requestTransaction } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const isMounted = useIsMounted();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!imageFile) newErrors.image = 'Image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageVerified = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setIsImageVerified(true);
    toast.success('Product image verified! You can now fill in the details.');
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setIsImageVerified(false);
    setErrors({});
  };

  const generateMetadataURI = () => {
    if (!name || !description) return null;

    const metadata = {
      name,
      description,
      image: imagePreview, // Use the verified image preview
    };

    const json = JSON.stringify(metadata);
    return `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
  };

  const handleMint = async () => {
    if (!validateForm()) return;

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const metadataURI = generateMetadataURI();
    if (!metadataURI) {
      toast.error('Failed to generate metadata URI. Please check all fields.');
      return;
    }

    setIsPending(true);
    try {
      const digitalTwinABI = getDigitalTwinABI();
      const encodedData = encodeFunctionData({
        abi: digitalTwinABI,
        functionName: 'safeMint',
        args: [address, metadataURI],
      });

      const clause = {
        to: DIGITAL_TWIN_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData,
      };

      await requestTransaction([clause]);
      toast.success('Digital Twin minted successfully!');
      clearForm();
    } catch (error: unknown) {
      console.error('Minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
            <CardTitle>Mint Digital Twin</CardTitle>
            <CardDescription>Please connect your wallet to mint.</CardDescription>
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
            Minting a Digital Twin NFT creates a unique blockchain-based representation of your physical product. This NFT can be used for tracking, verification, and ownership.
          </p>
        </div>
        {!isImageVerified ? (
          <RecyclingVerifier onFileVerified={handleImageVerified} />
        ) : (
          <Card className="w-full max-w-md lg:max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Mint Digital Twin</CardTitle>
              <CardDescription>
                Create a new Digital Twin NFT for your product. Fill in the details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-md border p-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label>Verified Product Image</Label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded-md object-contain" />
                )}
              </div>

              <Button onClick={handleMint} className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Mint NFT
              </Button>
              <Button
                variant="outline"
                onClick={clearForm}
                className="w-full mt-2"
                disabled={isPending}
              >
                Clear & Start Over
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Minting to: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
