import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Coins, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const stakedKeys = [
    { name: '金脉 #1234', level: 3, energy: 110, energyMax: 120, weight: 8.7, pendingGMD: 125.3, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold glowing lines' },
    { name: '金潮 #5678', level: 2, energy: 25, energyMax: 80, weight: 4.3, pendingGMD: 62.1, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold flowing wave' },
];

const unstakedKeys = [
    { name: '金砂 #9101', level: 1, energy: 45, energyMax: 50, weight: 2.0, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
]

export default function StakingPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-2"><Shield /> Staking Center</h1>
        
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Epoch Status</CardTitle>
                <CardDescription>Stake your NFT Keys to earn $GMD rewards every epoch.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold">#1337</p>
                    <p className="text-sm text-muted-foreground">Current Epoch</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold">1h 25m 10s</p>
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold text-yellow-300 flex items-center justify-center gap-1"><Coins size={24}/> 1,234.56</p>
                    <p className="text-sm text-muted-foreground">Total $GMD Rewards This Epoch</p>
                </div>
            </CardContent>
        </Card>

        <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Staked Keys ({stakedKeys.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stakedKeys.map(key => (
                    <Card key={key.name}>
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
                                    <p className="text-xs text-muted-foreground">Pending Rewards</p>
                                </div>
                             </div>
                              <div className="flex flex-col justify-between">
                                <Button size="sm">Claim</Button>
                                <Button size="sm" variant="outline">Unstake</Button>
                              </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

         <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Unstaked Keys ({unstakedKeys.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unstakedKeys.map(key => (
                    <Card key={key.name}>
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
                            <Button>Stake</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

    </div>
  );
}
