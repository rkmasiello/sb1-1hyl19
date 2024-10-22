"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getPoints, getReferralInfo } from '@/lib/api';
import MatrixBackground from '@/components/MatrixBackground';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real application, you'd get the userId from a session or context
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('/');
          return;
        }

        const [pointsResponse, referralResponse] = await Promise.all([
          getPoints(userId),
          getReferralInfo(userId),
        ]);
        setTotalPoints(pointsResponse.points);
        setReferralLink(`${window.location.origin}/register?ref=${referralResponse.referralCode}`);
        setReferralCount(referralResponse.referralCount);
        setUserData({
          bitcoinAddress: localStorage.getItem('bitcoinAddress'),
          ethereumAddress: localStorage.getItem('ethereumAddress'),
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [router, toast]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  if (!userData) {
    return <div className="container mx-auto px-4 py-8 text-center text-[#FD4C00]">Loading...</div>;
  }

  return (
    <>
      <MatrixBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#FD4C00]">USER DASHBOARD</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black bg-opacity-80 border-[#FD4C00]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#FD4C00]">TOTAL POINTS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#FD4C00]">{totalPoints}</p>
            </CardContent>
          </Card>
          <Card className="bg-black bg-opacity-80 border-[#FD4C00]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#FD4C00]">SUCCESSFUL REFERRALS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#FD4C00]">{referralCount}</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-black bg-opacity-80 border-[#FD4C00] mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FD4C00]">USER INFORMATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#FD4C00]">Bitcoin Address</h3>
                <p className="text-sm text-[#FF6E2E]">{userData.bitcoinAddress}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#FD4C00]">Ethereum Address</h3>
                <p className="text-sm text-[#FF6E2E]">{userData.ethereumAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black bg-opacity-80 border-[#FD4C00]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FD4C00]">REFERRAL LINK</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#FF6E2E] mb-4">{referralLink}</p>
            <Button onClick={copyReferralLink} className="dos-button">
              COPY LINK
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}