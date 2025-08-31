import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/main-layout';
import { WalletProvider } from '@/context/wallet-context';
import { Noto_Serif_SC } from 'next/font/google';

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-serif',
});

export const metadata: Metadata = {
  title: 'QuanJin Mahjong',
  description: '麻将娱乐 × 黄金期货 5m 策略分红 × 挖矿算力映射',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${notoSerif.variable} font-body antialiased`}>
        <WalletProvider>
          <MainLayout>{children}</MainLayout>
        </WalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
