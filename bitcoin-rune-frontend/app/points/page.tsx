"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type PointsData = {
  totalPoints: number;
  referrals: number;
  referralCode: string | null;
};

declare global {
  interface Window {
    BitcoinProvider?: any;
  }
}

const mockBitcoinProvider = {
  requestAccounts: () => Promise.resolve(['1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2']),
};

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const mockFetchPointsData = () => {
      return new Promise<PointsData>((resolve) => {
        setTimeout(() => {
          const storedData = localStorage.getItem('pointsData');
          if (storedData) {
            resolve(JSON.parse(storedData));
          } else {
            const initialData = {
              totalPoints: 0,
              referrals: 0,
              referralCode: null,
            };
            localStorage.setItem('pointsData', JSON.stringify(initialData));
            resolve(initialData);
          }
        }, 1000);
      });
    };

    mockFetchPointsData().then(setPointsData);
  }, []);

  const generateReferralCode = async () => {
    try {
      const provider = window.BitcoinProvider || mockBitcoinProvider;
      const accounts = await provider.requestAccounts();
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const referralCode = address.slice(-8);
        
        const updatedData = {
          ...pointsData!,
          referralCode,
        };
        localStorage.setItem('pointsData', JSON.stringify(updatedData));
        setPointsData(updatedData);

        toast({
          title: "Referral Code Generated",
          description: `Your referral code is: ${referralCode}`,
        });
      } else {
        throw new Error("No Bitcoin wallet connected");
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to generate referral code. Using mock data.",
        variant: "destructive",
      });
      generateMockReferralCode();
    }
  };

  const generateMockReferralCode = () => {
    const mockCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const updatedData = {
      ...pointsData!,
      referralCode: mockCode,
    };
    localStorage.setItem('pointsData', JSON.stringify(updatedData));
    setPointsData(updatedData);

    toast({
      title: "Mock Referral Code Generated",
      description: `Your mock referral code is: ${mockCode}`,
    });
  };

  if (!pointsData) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">YOUR POINTS DASHBOARD</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-black bg-opacity-80 border-[#FD4C00]">
          <CardHeader>
            <CardTitle className="text-2xl">TOTAL POINTS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pointsData.totalPoints}</p>
          </CardContent>
        </Card>
        <Card className="bg-black bg-opacity-80 border-[#FD4C00]">
          <CardHeader>
            <CardTitle className="text-2xl">SUCCESSFUL REFERRALS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pointsData.referrals}</p>
          </CardContent>
        </Card>
      </div>
      <div className="text-center">
        <h2 className="text-2xl mb-4">YOUR REFERRAL CODE</h2>
        {pointsData.referralCode ? (
          <p className="text-3xl font-bold mb-4">{pointsData.referralCode}</p>
        ) : (
          <div>
            <Button 
              onClick={generateReferralCode} 
              className="bg-[#FD4C00] text-black hover:bg-[#FF6E2E] mb-4"
            >
              GENERATE REFERRAL CODE
            </Button>
            <p className="text-sm mt-2">Note: If no Bitcoin wallet is detected, a mock code will be generated.</p>
          </div>
        )}
      </div>
    </div>
  );
}