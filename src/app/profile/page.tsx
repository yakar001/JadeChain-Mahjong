
'use client';

import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Coins, BarChart, Trophy, Gamepad2, ShieldCheck, ArrowRight, Clock, Plus, Minus } from 'lucide-react';
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ownedNfts = [
  { name: '金脉 #1234', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold glowing lines' },
  { name: '金潮 #5678', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold flowing wave' },
  { name: '金砂 #9101', image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
];

const matchHistory = [
    { id: 1, room: "新手场 (Novice)", result: 18.5, date: "2小时前" },
    { id: 2, room: "进阶场 (Adept)", result: -50, date: "5小时前" },
    { id: 3, room: "新手场 (Novice)", result: 25.0, date: "1天前" },
    { id: 4, room: "高手场 (Expert)", result: -200, date: "2天前" },
];


const kycLevel = 1; // Simulated KYC level

export default function ProfilePage() {
    const { toast } = useToast();

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
             <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                    <span className="text-sm text-muted-foreground">KYC 等级 (KYC Level)</span>
                    <p className="font-bold text-lg">Level {kycLevel}</p>
                </div>
                 <Button variant="ghost" size="icon" asChild>
                    <Link href="/kyc">
                        <ArrowRight />
                    </Link>
                 </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-1">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart />
                玩家统计 (Player Stats)
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between text-center">
                    <div>
                        <p className="text-2xl font-bold flex items-center justify-center gap-2"><Gamepad2 className="text-muted-foreground"/> 152</p>
                        <p className="text-sm text-muted-foreground">总场次</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold flex items-center justify-center gap-2"><Trophy className="text-primary"/> 88</p>
                        <p className="text-sm text-muted-foreground">胜利次数</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">57.9%</p>
                        <p className="text-sm text-muted-foreground">胜率</p>
                    </div>
                </div>
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock />
                    牌局历史 (Match History)
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>房间 (Room)</TableHead>
                            <TableHead className="text-right">输赢 ($JIN)</TableHead>
                            <TableHead className="text-right">时间 (Time)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matchHistory.map((match) => (
                            <TableRow key={match.id}>
                                <TableCell className="font-medium">{match.room}</TableCell>
                                <TableCell className={`text-right font-bold ${match.result > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    <div className="flex items-center justify-end gap-1">
                                        {match.result > 0 ? <Plus size={14}/> : <Minus size={14} />}
                                        {Math.abs(match.result).toFixed(2)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{match.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
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
