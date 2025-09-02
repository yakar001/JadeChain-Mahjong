
'use client';

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Coins, Zap, Clock, PackagePlus, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// In production, this data will be fetched from the user's wallet and smart contracts.
const initialStakedKeys: any[] = [];
const initialUnstakedKeys: any[] = [];
const leaderboardData = [
    { rank: 1, address: "0x1234...abcd", power: 12500.5, 'data-ai-hint': 'gold medal' },
    { rank: 2, address: "0x5678...efgh", power: 11800.2, 'data-ai-hint': 'silver medal' },
    { rank: 3, address: "0x90ab...cdef", power: 10500.8, 'data-ai-hint': 'bronze medal' },
    { rank: 4, address: "0x4567...hijk", power: 9800.0, 'data-ai-hint': 'trophy' },
    { rank: 5, address: "0x890a...lmno", power: 9500.5, 'data-ai-hint': 'trophy' },
];

export default function StakingPage() {
    const [stakedKeys, setStakedKeys] = useState(initialStakedKeys);
    const [unstakedKeys, setUnstakedKeys] = useState(initialUnstakedKeys);
    const { toast } = useToast();

    const handleStake = (keyToStake: typeof unstakedKeys[0]) => {
        // This is a placeholder. Real logic would involve a smart contract transaction.
        setUnstakedKeys(unstakedKeys.filter(k => k.id !== keyToStake.id));
        setStakedKeys([...stakedKeys, { ...keyToStake, pendingGMD: 0 }]);
        toast({ title: "质押成功", description: `${keyToStake.name} 已成功质押。` });
    };

    const handleUnstake = (keyToUnstake: typeof stakedKeys[0]) => {
         // This is a placeholder. Real logic would involve a smart contract transaction.
        setStakedKeys(stakedKeys.filter(k => k.id !== keyToUnstake.id));
        const { pendingGMD, ...unstakedVersion } = keyToUnstake;
        setUnstakedKeys([...unstakedKeys, unstakedVersion]);
        toast({ title: "取消质押成功", description: `${keyToUnstake.name} 已成功取消质押。` });
    };

    const handleClaim = (keyToClaim: typeof stakedKeys[0]) => {
         // This is a placeholder. Real logic would involve a smart contract transaction.
        setStakedKeys(stakedKeys.map(k => k.id === keyToClaim.id ? { ...k, pendingGMD: 0 } : k));
        toast({ title: "奖励已领取", description: `您已从 ${keyToClaim.name} 领取了 ${keyToClaim.pendingGMD.toFixed(2)} $GMD。` });
    };

    const EmptyState = ({ title, description, buttonText, buttonLink }: { title: string, description: string, buttonText: string, buttonLink: string }) => (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <div className="p-3 bg-accent rounded-full mb-4">
                    <PackagePlus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                <p>{description}</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href={buttonLink}>{buttonText}</Link>
                </Button>
            </CardContent>
        </Card>
    );

  return (
    <div>
        <h1 className="text-3xl font-bold font-headline text-primary mb-2 flex items-center gap-2"><Shield /> 质押分红金库</h1>
        <p className="text-muted-foreground mb-8">质押您的 NFT 密钥以在每个周期赚取 $GMD 奖励，并分享来自金库的 $JIN 分红。</p>
        
        <div className="grid lg:grid-cols-5 gap-8 mb-8 items-start">
            <Card className="lg:col-span-3 bg-gradient-to-r from-primary/20 to-secondary/20">
                <CardHeader>
                    <CardTitle className="font-headline">周期状态 (Epoch Status)</CardTitle>
                    <CardDescription>当前周期的奖励池与剩余时间。</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-background/50 p-4 rounded-lg">
                        <p className="text-4xl font-bold font-headline">#0</p>
                        <p className="text-sm text-muted-foreground mt-1">当前周期 (Current Epoch)</p>
                    </div>
                     <div className="bg-background/50 p-4 rounded-lg">
                        <p className="text-4xl font-bold font-headline flex items-center justify-center gap-2"><Clock /> 0h</p>
                        <p className="text-sm text-muted-foreground mt-1">剩余时间 (Time Left)</p>
                    </div>
                     <div className="bg-background/50 p-4 rounded-lg">
                        <p className="text-4xl font-bold text-yellow-300 font-headline flex items-center justify-center gap-2"><Coins size={32}/> 0</p>
                        <p className="text-sm text-muted-foreground mt-1">本周期 $GMD 奖励</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Trophy /> 全服质押算力榜</CardTitle>
                    <CardDescription>Top 5 Staking Power Leaderboard</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead>玩家 (Player)</TableHead>
                                <TableHead className="text-right">算力 (Power)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {leaderboardData.map(player => (
                                <TableRow key={player.rank}>
                                    <TableCell className="text-center font-bold">{player.rank}</TableCell>
                                    <TableCell className="font-mono text-xs">{player.address}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-primary">{player.power.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>


        <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4">已质押密钥 ({stakedKeys.length})</h2>
            {stakedKeys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stakedKeys.map(key => (
                        <Card key={key.id} className="bg-card/80 backdrop-blur-sm border-primary/20">
                            <CardContent className="p-4 flex gap-4">
                                <Image src={key.image} alt={key.name} width={100} height={125} className="rounded-md border border-primary/20" data-ai-hint={key['data-ai-hint']} />
                                <div className="flex-grow space-y-2">
                                    <h3 className="font-bold font-headline">{key.name}</h3>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>等级 (Level): {key.level}</p>
                                        <p className="flex items-center gap-1"><Zap size={12}/> 能量 (Energy): {key.energy}/{key.energyMax} ({((key.energy/key.energyMax)*100).toFixed(0)}%)</p>
                                        <p>权重 (Weight): {key.weight.toFixed(1)}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-300 flex items-center gap-1 font-mono"><Coins size={14}/> {key.pendingGMD.toFixed(2)} $GMD</p>
                                        <p className="text-xs text-muted-foreground">待领取奖励</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <Button size="sm" onClick={() => handleClaim(key)} disabled={key.pendingGMD <= 0}>领取</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleUnstake(key)}>取消质押</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState 
                    title="您还没有质押任何密钥"
                    description="质押密钥以赚取被动收益"
                    buttonText="查看我未质押的密钥"
                    buttonLink="#unstaked-keys"
                />
            )}
        </div>

         <div id="unstaked-keys">
            <h2 className="text-2xl font-bold font-headline mb-4">未质押密钥 ({unstakedKeys.length})</h2>
            {unstakedKeys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unstakedKeys.map(key => (
                        <Card key={key.id} className="bg-card/80 backdrop-blur-sm border-primary/20">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <Image src={key.image} alt={key.name} width={80} height={100} className="rounded-md border border-primary/20" data-ai-hint={key['data-ai-hint']} />
                                <div className="flex-grow space-y-2">
                                    <h3 className="font-bold font-headline">{key.name}</h3>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>等级 (Level): {key.level}</p>
                                        <p className="flex items-center gap-1"><Zap size={12}/> 能量 (Energy): {key.energy}/{key.energyMax}</p>
                                        <p>基础权重 (Base Weight): {key.weight.toFixed(1)}</p>
                                    </div>
                                </div>
                                <Button onClick={() => handleStake(key)}>质押</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             ) : (
                <EmptyState 
                    title="您所有的密钥都已质押"
                    description="或者您还没有任何密钥"
                    buttonText="前往市场获取密钥"
                    buttonLink="/marketplace"
                />
            )}
        </div>

    </div>
  );
}
