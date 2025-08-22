'use client'
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Hammer, Zap, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const ownedKeys = [
  { id: 1, name: '金砂 #9101', level: 1, energy: 45, energyMax: 50, image: "https://placehold.co/400x500.png", 'data-ai-hint': 'gold sand particle' },
  { id: 2, name: '金潮 #5678', level: 2, energy: 30, energyMax: 80, image: "https://placehold.co/400x500.png", 'data-ai-hint': 'gold flowing wave' },
];

const ownedShards = [
    { name: "Bamboo Shard", count: 12 },
    { name: "Dots Shard", count: 8 },
    { name: "Character Shard", count: 25 },
];

const upgradeRequirements = {
    2: { from: "金砂", fromCount: 5, jin: 100, shards: [{ name: "Character Shard", count: 20 }] },
    3: { from: "金潮", fromCount: 3, jin: 500, shards: [{ name: "Dragon Shard", count: 10 }] },
};


export default function WorkshopPage() {
    const [selectedKeyId, setSelectedKeyId] = useState<number | undefined>(ownedKeys[0]?.id);
    const selectedKey = ownedKeys.find(k => k.id === selectedKeyId);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-2"><Hammer /> NFT Workshop</h1>
      <Tabs defaultValue="upgrade">
        <TabsList className="mb-4">
          <TabsTrigger value="upgrade">Upgrade Key</TabsTrigger>
          <TabsTrigger value="synthesize" disabled>Synthesize (Soon)</TabsTrigger>
          <TabsTrigger value="energy">Refill Energy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upgrade">
            <Card>
                <CardHeader>
                    <CardTitle>Upgrade Your NFT Key</CardTitle>
                    <CardDescription>Combine lower-level keys and pay a fee to get a more powerful key with higher weights.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-bold">Required Materials</p>
                        <Card className="p-4 w-full text-sm">
                            <p>5x 金砂 (Golden Sand) Key</p>
                            <p>20x Character Shard</p>
                            <p className="flex items-center gap-1 mt-2"><Coins size={14}/> 100 $JIN</p>
                        </Card>
                    </div>
                     <div className="flex justify-center items-center">
                        <ArrowRight size={48} className="text-primary animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-bold">Result</p>
                        <div className="w-40">
                             <Image src="https://placehold.co/400x500.png" alt="Golden Tide" width={400} height={500} className="rounded-lg border" data-ai-hint="gold flowing wave"/>
                             <p className="text-center mt-1 font-semibold">1x 金潮 (Golden Tide) Key</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full md:w-auto ml-auto">Upgrade to Level 2</Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="energy">
            <Card>
                 <CardHeader>
                    <CardTitle>Refill Energy</CardTitle>
                    <CardDescription>Use $JIN to refill your NFT Key's energy. Energy is required for staking and affects your rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="text-sm font-medium">Select NFT Key</label>
                        <Select onValueChange={(val) => setSelectedKeyId(Number(val))} defaultValue={selectedKeyId?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a key..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ownedKeys.map(key => (
                                    <SelectItem key={key.id} value={key.id.toString()}>{key.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedKey && (
                        <div className='space-y-4'>
                            <div className="flex items-center gap-4">
                                <Image src={selectedKey.image} alt={selectedKey.name} width={80} height={100} className="rounded-md border" data-ai-hint={selectedKey['data-ai-hint']} />
                                <div className="w-full">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold flex items-center gap-1"><Zap size={14} /> Energy</p>
                                        <p>{selectedKey.energy} / {selectedKey.energyMax}</p>
                                    </div>
                                    <Progress value={(selectedKey.energy / selectedKey.energyMax) * 100} />
                                </div>
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Cost to fully refill: <span className="text-primary font-bold">{(selectedKey.energyMax - selectedKey.energy) * 0.5} $JIN</span> (0.5 $JIN per energy point)
                            </p>
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button className="w-full md:w-auto ml-auto" disabled={!selectedKey || selectedKey.energy === selectedKey.energyMax}>
                        <Zap className="mr-2 h-4 w-4" />
                        Refill Energy
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
