"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MatrixBackground from '@/components/MatrixBackground';

export default function Home() {
  const [refCode, setRefCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refCode.length > 0) {
      // TODO: Implement actual referral code validation
      router.push('/mint');
    } else {
      toast({
        title: "Error",
        description: "Invalid referral code. Access denied.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <MatrixBackground />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
        <div className="dos-container text-center bg-black bg-opacity-80 border-[#FD4C00] w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8 text-[#FD4C00]">ACCESS RESTRICTED</h1>
          <p className="dos-text mb-8 text-[#FD4C00]">
            &gt; PROVIDE YOUR CREDENTIALS<br />
          </p>
          <form onSubmit={handleSubmit} className="w-full">
            <Input
              type="text"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              className="dos-input mb-4"
              placeholder="Enter referral code"
            />
            <Button type="submit" className="dos-button w-full bg-[#FD4C00] text-black hover:bg-[#FF6E2E]">
              GO HIGHER
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}