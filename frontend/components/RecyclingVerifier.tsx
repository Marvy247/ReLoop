'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, XCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecyclingVerifierProps {
  onSuccess: (tokenId: string) => void;
}

export const RecyclingVerifier: React.FC<RecyclingVerifierProps> = ({ onSuccess }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failure' | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Reset states
    setIsAnalyzing(true);
    setVerificationResult(null);
    setError(null);
    setFileName(file.name);

    // Simulate AI analysis
    setTimeout(() => {
      // Simulate a random outcome
      const isSuccess = Math.random() > 0.3; // 70% chance of success
      if (isSuccess) {
        const simulatedTokenId = Math.floor(Math.random() * 1000) + 1;
        onSuccess(simulatedTokenId.toString());
        setVerificationResult('success');
      } else {
        setVerificationResult('failure');
        setError('This item does not match a registered Digital Twin. Please try a different item.');
      }
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setVerificationResult(null);
    setFileName(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl">AI Recycling Verifier</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {!fileName ? (
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={handleDropzoneClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
              accept="image/*"
            />
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">Click or drag to upload an image of your item</p>
              <p className="text-xs text-gray-400">Our AI will verify its Digital Twin.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {isAnalyzing && (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                <p className="text-lg font-semibold">Analyzing...</p>
                <p className="text-sm text-gray-500">Verifying <span className="font-medium text-gray-700 dark:text-gray-300">{fileName}</span> against blockchain records.</p>
              </div>
            )}

            {verificationResult === 'success' && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                <CheckCircle className="w-20 h-20 text-green-500" />
                <p className="text-xl font-bold text-green-600">Verification Successful!</p>
                <p className="text-sm text-gray-500">This product is ready for recycling.</p>
                <Button onClick={handleReset} variant="outline">Verify Another Item</Button>
              </div>
            )}

            {verificationResult === 'failure' && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                <XCircle className="w-20 h-20 text-red-500" />
                <p className="text-xl font-bold text-red-600">Verification Failed</p>
                <p className="text-sm text-gray-500 max-w-sm">{error}</p>
                <Button onClick={handleReset} variant="outline">Try Again</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
