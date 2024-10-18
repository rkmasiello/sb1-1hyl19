import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Bitcoin Runes Minting Site',
  description: 'Mint Bitcoin Runes and earn points through referrals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}