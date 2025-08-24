'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@/context/wallet-context';

export function AppHeader() {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();

  const truncatedAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div>
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      {walletAddress ? (
        <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-muted-foreground">{truncatedAddress}</span>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
            </Button>
        </div>
      ) : (
        <Button onClick={connectWallet}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </header>
  );
}
