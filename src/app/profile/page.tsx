
'use client';

import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Coins, BarChart, Trophy, Gamepad2, ShieldCheck, ArrowRight, Clock, Plus, Minus, Maximize } from 'lucide-react';
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// In production, this data will be fetched from a backend service.
const ownedNfts: { name: string, image: string, 'data-ai-hint': string }[] = [];
const matchHistory: { id: number, room: string, result: number, date: string }[] = [];
const kycLevel = 1;

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
    <Card className="bg-card/50 backdrop-blur-sm text-center p-4 border-primary/20">
        <div className="text-primary mb-2">{icon}</div>
        <p className="text-2xl font-bold font-headline">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
)

export default function ProfilePage() {
    const { toast } = useToast();

  return (
    <div>
      <Card className="mb-8 overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
          <Avatar className="h-28 w-28 border-4 border-background ring-2 ring-primary/50">
            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="wise master" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl font-bold font-headline">PlayerOne</h1>
            <p className="text-muted-foreground font-mono text-sm break-all">0x1234567890abcdef1234567890abcdef12345678</p>
          </div>
           <div className="sm:ml-auto flex flex-col items-center gap-4">
             <div className="flex items-center gap-4 text-xl font-bold">
              <div className="flex items-center gap-2 text-primary">
                <Coins /> 1,234 <span className="text-sm font-light">$JIN</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-300">
                <Coins /> 567 <span className="text-sm font-light">$GMD</span>
              </div>
            </div>
             <div className="flex items-center gap-2 p-2 pr-4 bg-accent/50 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-green-500" />
                <div>
                    <span className="text-sm text-muted-foreground">KYC 等级</span>
                    <p className="font-bold">Level {kycLevel}</p>
                </div>
                 <Button variant="ghost" size="icon" asChild className="-mr-2">
                    <Link href="/kyc">
                        <ArrowRight />
                    </Link>
                 </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard icon={<Gamepad2 size={28} />} value={0} label="总场次 (Matches)" />
            <StatCard icon={<Trophy size={28} />} value="0%" label="胜率 (Win Rate)" />
            <StatCard icon={<Plus size={28} />} value={0} label="总胡牌 (Total Wins)" />
            <StatCard icon={<Maximize size={28} />} value="N/A" label="最大番型 (Max Fan)" />
        </div>
         <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Clock />
                    牌局历史 (Match History)
                </CardTitle>
                <CardDescription>最近10场对局记录</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>房间 (Room)</TableHead>
                            <TableHead className="text-right">输赢 (PnL) ($JIN)</TableHead>
                            <TableHead className="text-right">时间 (Date)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matchHistory.length > 0 ? (
                            matchHistory.map((match) => (
                                <TableRow key={match.id}>
                                    <TableCell className="font-medium">{match.room}</TableCell>
                                    <TableCell className={`text-right font-bold ${match.result > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <div className="flex items-center justify-end gap-1 font-mono">
                                            {match.result > 0 ? <Plus size={14}/> : <Minus size={14} />}
                                            {Math.abs(match.result).toFixed(2)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{match.date}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    暂无牌局历史
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">NFT Key 收藏馆</h2>
        {ownedNfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ownedNfts.map((nft, index) => (
                <div key={index} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-primary/20">
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
        ) : (
            <Card className="bg-card/50">
                <CardContent className="p-8 text-center text-muted-foreground">
                    <p>您的收藏馆还是空的。</p>
                    <Button variant="link" asChild className="mt-2"><Link href="/marketplace">前往市场探索</Link></Button>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
