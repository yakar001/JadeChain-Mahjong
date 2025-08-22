'use client';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Gem, Home, Store, User, Bot, Vote, Shield, Hammer, Banknote } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Gem className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">泉金量化麻将</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <Home />
                Lobby
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/workshop'}>
              <Link href="/workshop">
                <Hammer />
                NFT Workshop
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/staking'}>
              <Link href="/staking">
                <Shield />
                Staking Center
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/vault'}>
              <Link href="/vault">
                <Banknote />
                Vault & PnL
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/marketplace'}>
              <Link href="/marketplace">
                <Store />
                Marketplace
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/dao'}>
              <Link href="/dao">
                <Vote />
                DAO
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/profile'}>
              <Link href="/profile">
                <User />
                Profile
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
          <Bot /> <span>AI Tutor Active</span>
        </div>
      </SidebarFooter>
    </>
  );
}
