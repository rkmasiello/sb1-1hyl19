"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSDK } from "@metamask/sdk-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { registerUser } from '@/lib/api';
import MatrixBackground from '@/components/MatrixBackground';
import Wallet from 'sats-connect';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sdk } = useSDK();

  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    // Get referral code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  useEffect(() => {
    calculatePoints();
  }, [bitcoinAddress, ethereumAddress, twitter, telegram, email]);

  const calculatePoints = () => {
    let totalPoints = 0;
    if (bitcoinAddress) totalPoints += 50;
    if (ethereumAddress) totalPoints += 50;
    if (twitter) totalPoints += 1000;
    if (telegram) totalPoints += 500;
    if (email) totalPoints += 1000;
    setPoints(totalPoints);
  };

  const connectMetaMask = async () => {
    try {
      const accounts = await sdk?.connect();
      setEthereumAddress(accounts?.[0] || '');
    } catch (err) {
      console.warn("Failed to connect to MetaMask", err);
      toast({
        title: "MetaMask Connection Failed",
        description: "There was an error connecting to your MetaMask wallet.",
        variant: "destructive",
      });
    }
  };

  const connectBitcoinWallet = async () => {
    try {
      const response = await Wallet.request('getAccounts', {
        purposes: ['payment', 'ordinals'],
        message: 'Connect to Bitcoin Rune Airdrop'
      });

      if (response.status === 'success') {
        const paymentAddress = response.result.find(
          (address) => address.purpose === 'payment'
        );
        setBitcoinAddress(paymentAddress?.address || '');
      } else {
        console.warn("Failed to connect Bitcoin wallet", response.error);
        toast({
          title: "Bitcoin Wallet Connection Failed",
          description: "There was an error connecting your Bitcoin wallet.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.warn("Failed to connect Bitcoin wallet", err);
      toast({
        title: "Bitcoin Wallet Connection Failed",
        description: "There was an error connecting your Bitcoin wallet.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        bitcoinAddress,
        ethereumAddress,
        twitter,
        telegram,
        email,
        referralCode,
      };
      console.log('Submitting user data:', userData);
      const response = await registerUser(userData);
      console.log('Registration response:', response);
      if (response.userId) {
        // Store user data in localStorage
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('bitcoinAddress', bitcoinAddress);
        localStorage.setItem('ethereumAddress', ethereumAddress);
        
        // Navigate to dashboard
        router.push('/dashboard');
      } else {
        console.error('Registration failed:', response);
        toast({
          title: "Registration Failed",
          description: "There was an error during registration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <MatrixBackground />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
        <div className="dos-container bg-black bg-opacity-80 border-[#FD4C00] w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-[#FD4C00] text-center">REGISTER FOR AIRDROP</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bitcoin-address" className="block text-sm font-medium text-[#FD4C00]">
                Bitcoin Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input
                  id="bitcoin-address"
                  value={bitcoinAddress}
                  readOnly
                  className="flex-1 dos-input"
                />
                <Button
                  type="button"
                  onClick={connectBitcoinWallet}
                  className="ml-2 dos-button"
                >
                  Connect
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="ethereum-address" className="block text-sm font-medium text-[#FD4C00]">
                Ethereum Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input
                  id="ethereum-address"
                  value={ethereumAddress}
                  readOnly
                  className="flex-1 dos-input"
                />
                <Button
                  type="button"
                  onClick={connectMetaMask}
                  className="ml-2 dos-button"
                >
                  Connect
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-[#FD4C00]">
                Twitter (optional)
              </label>
              <Input
                id="twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="dos-input"
              />
            </div>

            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-[#FD4C00]">
                Telegram (optional)
              </label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="dos-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#FD4C00]">
                Email (optional)
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dos-input"
              />
            </div>

            <div className="bg-black bg-opacity-50 px-4 py-3 rounded-md">
              <p className="text-sm font-medium text-[#FD4C00]">Current Points: {points}</p>
            </div>

            <Button type="submit" className="w-full dos-button">
              REGISTER
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}