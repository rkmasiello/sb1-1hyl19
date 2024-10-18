"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Wallet from 'sats-connect';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Navbar() {
  const [xverseConnected, setXverseConnected] = useState(false);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleXverseConnect = async () => {
    try {
      const data = await Wallet.request('getAccounts', null);
      console.log('XVerse connected:', data);
      setXverseConnected(true);
      toast({
        title: "XVerse Connected",
        description: "Your XVerse wallet has been successfully connected.",
      });
    } catch (error) {
      console.error('XVerse connection error:', error);
      toast({
        title: "XVerse Connection Failed",
        description: "There was an error connecting to your XVerse wallet.",
        variant: "destructive",
      });
    }
  };

  const handleMetamaskConnect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log('MetaMask connected:', address);
        setMetamaskConnected(true);
        toast({
          title: "MetaMask Connected",
          description: "Your MetaMask wallet has been successfully connected.",
        });
      } catch (error) {
        console.error('MetaMask connection error:', error);
        toast({
          title: "MetaMask Connection Failed",
          description: "There was an error connecting to your MetaMask wallet.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your Ethereum wallet.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-black bg-opacity-80 p-4 text-[#FD4C00] text-xl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/mint" className={`hover:text-[#FF6E2E] ${pathname === '/mint' ? 'font-bold' : ''}`}>
            Mint
          </Link>
          <Link href="/points" className={`hover:text-[#FF6E2E] ${pathname === '/points' ? 'font-bold' : ''}`}>
            Points
          </Link>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleXverseConnect}
            className={`${xverseConnected ? 'bg-green-500' : 'bg-gray-500'} text-black text-lg`}
            disabled={xverseConnected}
          >
            {xverseConnected ? 'XVerse Connected' : 'Connect XVerse'}
          </Button>
          <Button
            onClick={handleMetamaskConnect}
            className={`${metamaskConnected ? 'bg-green-500' : 'bg-gray-500'} text-black text-lg`}
            disabled={metamaskConnected}
          >
            {metamaskConnected ? 'MetaMask Connected' : 'Connect MetaMask'}
          </Button>
        </div>
      </div>
    </nav>
  );
}