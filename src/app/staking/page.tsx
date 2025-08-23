
'use client';

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Coins, Zap, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';

const initialStakedKeys = [
    { id: 1, name: '金脉 #1234', level: 3, energy: 110, energyMax: 120, weight: 8.7, pendingGMD: 125.3, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold glowing lines' },
    { id: 2, name: '金潮 #5678', level: 2, energy: 25, energyMax: 80, weight: 4.3, pendingGMD: 62.1, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold flowing wave' },
];

const initialUnstakedKeys = [
    { id: 3, name: '金砂 #9101', level: 1, energy: 45, energyMax: 50, weight: 2.0, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
]

export default function StakingPage() {
    const [stakedKeys, setStakedKeys] = useState(initialStakedKeys);
    const [unstakedKeys, setUnstakedKeys] = useState(initialUnstakedKeys);
    const { toast } = useToast();

    const handleStake = (keyToStake: typeof unstakedKeys[0]) => {
        setUnstakedKeys(unstakedKeys.filter(k => k.id !== keyToStake.id));
        setStakedKeys([...stakedKeys, { ...keyToStake, pendingGMD: 0 }]);
        toast({ title: "质押成功 (NFT Staked)", description: `${keyToStake.name} 已成功质押。` });
    };

    const handleUnstake = (keyToUnstake: typeof stakedKeys[0]) => {
        setStakedKeys(stakedKeys.filter(k => k.id !== keyToUnstake.id));
        const { pendingGMD, ...unstakedVersion } = keyToUnstake;
        setUnstakedKeys([...unstakedKeys, unstakedVersion]);
        toast({ title: "取消质押成功 (NFT Unstaked)", description: `${keyToUnstake.name} 已成功取消质押。` });
    };

    const handleClaim = (keyToClaim: typeof stakedKeys[0]) => {
        setStakedKeys(stakedKeys.map(k => k.id === keyToClaim.id ? { ...k, pendingGMD: 0 } : k));
        toast({ title: "奖励已领取 (Rewards Claimed)", description: `您已从 ${keyToClaim.name} 领取了 ${keyToClaim.pendingGMD.toFixed(2)} $GMD。` });
    };


  return (
    <div>
        <h1 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-2"><Shield /> 质押中心 (Staking Center)</h1>
        
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>周期状态 (Epoch Status)</CardTitle>
                <CardDescription>质押您的 NFT 密钥以在每个周期赚取 $GMD 奖励。(Stake your NFT Keys to earn $GMD rewards every epoch.)</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold">#1337</p>
                    <p className="text-sm text-muted-foreground">当前周期 (Current Epoch)</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold flex items-center justify-center gap-1"><Clock /> 1h 25m</p>
                    <p className="text-sm text-muted-foreground">剩余时间 (Time Remaining)</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold text-yellow-300 flex items-center justify-center gap-1"><Coins size={24}/> 1,234.56</p>
                    <p className="text-sm text-muted-foreground">本周期 $GMD 总奖励 (Total $GMD Rewards This Epoch)</p>
                </div>
            </CardContent>
        </Card>

        <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4">已质押密钥 (Staked Keys) ({stakedKeys.length})</h2>
            {stakedKeys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stakedKeys.map(key => (
                        <Card key={key.id}>
                            <CardContent className="p-4 flex gap-4">
                                <Image src={key.image} alt={key.name} width={100} height={125} className="rounded-md border" data-ai-hint={key['data-ai-hint']} />
                                <div className="flex-grow space-y-2">
                                    <h3 className="font-bold">{key.name}</h3>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>Level: {key.level}</p>
                                        <p className="flex items-center gap-1"><Zap size={12}/> Energy: {key.energy}/{key.energyMax} ({((key.energy/key.energyMax)*100).toFixed(0)}%)</p>
                                        <p>Weight: {key.weight.toFixed(1)}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-300 flex items-center gap-1"><Coins size={14}/> {key.pendingGMD.toFixed(2)} $GMD</p>
                                        <p className="text-xs text-muted-foreground">待领取奖励 (Pending Rewards)</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <Button size="sm" onClick={() => handleClaim(key)} disabled={key.pendingGMD <= 0}>领取 (Claim)</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleUnstake(key)}>取消质押 (Unstake)</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4">您还没有质押任何密钥。(You have no staked keys.)</p>
            )}
        </div>

         <div>
            <h2 className="text-2xl font-bold font-headline mb-4">未质押密钥 (Unstaked Keys) ({unstakedKeys.length})</h2>
            {unstakedKeys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unstakedKeys.map(key => (
                        <Card key={key.id}>
                            <CardContent className="p-4 flex gap-4 items-center">
                                <Image src={key.image} alt={key.name} width={80} height={100} className="rounded-md border" data-ai-hint={key['data-ai-hint']} />
                                <div className="flex-grow space-y-2">
                                    <h3 className="font-bold">{key.name}</h3>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>Level: {key.level}</p>
                                        <p className="flex items-center gap-1"><Zap size={12}/> Energy: {key.energy}/{key.energyMax}</p>
                                        <p>Base Weight: {key.weight.toFixed(1)}</p>
                                    </div>
                                </div>
                                <Button onClick={() => handleStake(key)}>质押 (Stake)</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             ) : (
                <p className="text-muted-foreground text-center py-4">您所有的密钥都已质押。(All your keys are staked.)</p>
            )}
        </div>

    </div>
  );
}
