'use client';
import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function AppHeader() {
  const { isMobile } = useSidebar();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnectWallet = () => {
    // This is a simulation. In a real app, you would use a library like ethers.js or web3-react.
    const mockAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setWalletAddress(mockAddress);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };

  const truncatedAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      {walletAddress ? (
        <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground">{truncatedAddress}</span>
            <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
            </Button>
        </div>
      ) : (
        <Button onClick={handleConnectWallet}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </header>
  );
}
