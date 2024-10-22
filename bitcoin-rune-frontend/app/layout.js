import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from '@/components/Navbar';
import { MetaMaskProvider } from "@metamask/sdk-react";

export const metadata = {
  title: 'Bitcoin Runes Minting Site',
  description: 'Mint Bitcoin Runes and earn points through referrals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MetaMaskProvider
          debug={false}
          sdkOptions={{
            dappMetadata: {
              name: "Bitcoin Rune Airdrop",
              url: typeof window !== 'undefined' ? window.location.href : '',
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
          </ThemeProvider>
        </MetaMaskProvider>
      </body>
    </html>
  );
}