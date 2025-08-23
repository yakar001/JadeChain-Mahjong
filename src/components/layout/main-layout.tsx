'use client';
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { AppHeader } from './header';
import { useWallet } from '@/context/wallet-context';
import { Button } from '../ui/button';
import { Wallet } from 'lucide-react';

function WalletGuard({ children }: { children: ReactNode }) {
    const { walletAddress, connectWallet } = useWallet();

    if (!walletAddress) {
        return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center p-8 border rounded-lg bg-card text-card-foreground">
                    <h2 className="text-2xl font-bold mb-2 font-headline text-primary">请连接您的钱包</h2>
                    <p className="text-muted-foreground mb-6">连接钱包以访问应用功能。</p>
                    <Button onClick={connectWallet} size="lg">
                        <Wallet className="mr-2" />
                        Connect Wallet
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>;
}


export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative">
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-8 relative">
            <WalletGuard>
                {children}
            </WalletGuard>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
