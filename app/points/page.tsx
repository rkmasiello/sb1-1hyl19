"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PointsData = {
  totalPoints: number;
  referrals: number;
};

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);

  useEffect(() => {
    // TODO: Implement actual API call to fetch points data
    const mockFetchPointsData = () => {
      return new Promise<PointsData>((resolve) => {
        setTimeout(() => {
          resolve({
            totalPoints: 150,
            referrals: 3,
          });
        }, 1000);
      });
    };

    mockFetchPointsData().then(setPointsData);
  }, []);

  if (!pointsData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Points Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pointsData.totalPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Successful Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pointsData.referrals}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}