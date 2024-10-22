"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function MintPage() {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleMint = () => {
    // TODO: Implement actual minting logic
    toast({
      title: "Minting Successful",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">MINT BITCOIN RUNES</h1>
      <div className="max-w-md mx-auto">
        <Input
          type="number"
          placeholder="Enter amount to mint"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleMint} className="w-full">MINT RUNES</Button>
      </div>
    </div>
  );
}