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
import { Loader2 } from 'lucide-react'; // For loading spinner
import { encodeFunctionData } from 'viem';
import { RewardsBalance } from '@/components/RewardsBalance';

export default function MintPage() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataURI, setImageDataURI] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { account: address, requestTransaction } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const isMounted = useIsMounted();

  const validateForm = () => {
    console.log('Validating form...');
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!imageFile) newErrors.image = 'Image is required';
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageDataURI(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setImageDataURI(null);
    setErrors({});
  };

  const generateMetadataURI = () => {
    if (!name || !description) return null;

    const metadata = {
      name,
      description,
      image: "https://via.placeholder.com/150", // Placeholder image to reduce transaction size
    };

    const json = JSON.stringify(metadata);
    return `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
  };

  const handleMint = async () => {
    if (!validateForm()) return;

    console.log('Checking wallet connection:');
    console.log('Address:', address);

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const metadataURI = generateMetadataURI();
    console.log('Generated Metadata URI:', metadataURI);
    if (!metadataURI) {
      toast.error('Failed to generate metadata URI. Please check all fields.');
      return;
    }

    console.log('Minting with the following data:');
    console.log('Address:', address);
    console.log('Metadata URI:', metadataURI);

    setIsPending(true);
    try {
      const digitalTwinABI = getDigitalTwinABI();
      console.log('Digital Twin ABI:', digitalTwinABI);
      console.log('Function args:', [address, metadataURI]);

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

      console.log('Clause:', clause);

      const response = await requestTransaction([clause]);
      console.log('Transaction response:', response);
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
              <Label htmlFor="image">Product Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`rounded-md p-1 border ${errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
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
              Clear
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Minting to: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </CardContent>
        </Card>
        {(name || description || imagePreview) && (
          <Card className="w-full max-w-md lg:max-w-lg mx-auto mt-8">
            <CardHeader>
              <CardTitle>NFT Preview</CardTitle>
              <CardDescription>Preview of your Digital Twin NFT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview && (
                <img src={imagePreview} alt="NFT Preview" className="w-full max-h-64 rounded-md object-contain" />
              )}
              {name && (
                <div>
                  <h3 className="font-semibold">{name}</h3>
                </div>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
