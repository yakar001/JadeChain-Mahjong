
'use client';

import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Coins, BarChart, Trophy, Gamepad2, ShieldCheck, Camera } from 'lucide-react';

const ownedNfts = [
  { name: '金脉 #1234', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold glowing lines' },
  { name: '金潮 #5678', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold flowing wave' },
  { name: '金砂 #9101', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
];

const kycLevel = 1; // Simulated KYC level

export default function ProfilePage() {
    const { toast } = useToast();

    const handleKyc = () => {
        toast({
            title: "认证流程启动 (Verification Process Started)",
            description: "即将跳转至认证服务页面。(You will be redirected to the verification service.)"
        });
    }

  return (
    <div>
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="wise master" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold font-headline">PlayerOne</h1>
            <p className="text-muted-foreground">0x1234...abcd</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xl font-bold">
              <div className="flex items-center gap-2 text-primary">
                <Coins /> 1,234 $JIN
              </div>
              <div className="flex items-center gap-2 text-yellow-300">
                <Coins /> 567 $GMD
              </div>
            </div>
          </div>
          <div className="sm:ml-auto flex flex-col items-center gap-2">
             <ShieldCheck className="w-8 h-8 text-green-500" />
             <span className="text-sm text-muted-foreground">KYC Level: 1 (KYC 等级)</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart />
                Player Statistics (玩家统计)
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <Gamepad2 className="text-accent" />
                    <span>152</span>
                </div>
                <p className="text-muted-foreground">Matches Played (比赛场次)</p>
                </div>
                <div>
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <Trophy className="text-primary" />
                    <span>88</span>
                </div>
                <p className="text-muted-foreground">Wins (胜利次数)</p>
                </div>
                <div>
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <span className="text-foreground">57.9%</span>
                </div>
                <p className="text-muted-foreground">Win Rate (胜率)</p>
                </div>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck /> KYC 认证中心 (KYC Center)</CardTitle>
                <CardDescription>提升您的KYC等级以解锁更高级别的游戏房间和功能。(Increase your KYC level to unlock higher-tier rooms and features.)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                    <div>
                        <p className="text-sm text-muted-foreground">当前等级 (Current Level)</p>
                        <p className="text-lg font-bold text-green-400">KYC Level {kycLevel}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">下一等级 (Next Level)</p>
                        <p className="text-lg font-bold">KYC Level {kycLevel + 1}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleKyc}>
                    <Camera className="mr-2" />
                    开始 Level {kycLevel + 1} 认证 (Start Level {kycLevel + 1} Verification)
                </Button>
            </CardFooter>
        </Card>

      </div>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">NFT Key Collection (NFT 密钥收藏)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ownedNfts.map((nft, index) => (
            <div key={index} className="group relative aspect-[4/5] overflow-hidden rounded-lg border">
              <Image
                src={nft.image}
                alt={nft.name}
                width={400}
                height={500}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                data-ai-hint={nft['data-ai-hint']}
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-sm font-semibold">{nft.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
