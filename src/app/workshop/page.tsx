'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Hammer, Zap, Coins, Package, Minus, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const ownedKeys = [
  { id: 1, name: '金砂 #9101', level: 1, energy: 45, energyMax: 50, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
  { id: 2, name: '金砂 #8233', level: 1, energy: 50, energyMax: 50, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
  { id: 3, name: '金砂 #7451', level: 1, energy: 23, energyMax: 50, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
  { id: 4, name: '金砂 #6129', level: 1, energy: 50, energyMax: 50, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
  { id: 5, name: '金砂 #5345', level: 1, energy: 10, energyMax: 50, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold sand particle' },
  { id: 6, name: '金潮 #5678', level: 2, energy: 30, energyMax: 80, image: 'https://placehold.co/400x500.png', 'data-ai-hint': 'gold flowing wave' },
];

const ownedShards = [
    { name: "Bamboo Shard", count: 12 },
    { name: "Dots Shard", count: 8 },
    { name: "Character Shard", count: 25 },
    { name: "Dragon Shard", count: 5 },
];

const upgradeRecipes: Record<string, { fromLevel: number; fromName: string; fromCount: number; jin: number; shards: { name: string; count: number }[], toName: string; toImage: string, toDataAiHint: string }> = {
    "2": { fromLevel: 1, fromName: "金砂 (Golden Sand)", fromCount: 5, jin: 100, shards: [{ name: "Character Shard", count: 20 }], toName: '金潮 (Golden Tide)', toImage: 'https://placehold.co/400x500.png', toDataAiHint: 'gold flowing wave' },
    "3": { fromLevel: 2, fromName: "金潮 (Golden Tide)", fromCount: 3, jin: 500, shards: [{ name: "Dragon Shard", count: 10 }], toName: '金脉 (Golden Vein)', toImage: 'https://placehold.co/400x500.png', toDataAiHint: 'gold glowing lines' },
};

export default function WorkshopPage() {
    const [selectedKeyId, setSelectedKeyId] = useState<number | undefined>(ownedKeys[0]?.id);
    const [targetUpgradeLevel, setTargetUpgradeLevel] = useState<string>("2");

    const selectedKey = ownedKeys.find(k => k.id === selectedKeyId);
    const recipe = upgradeRecipes[targetUpgradeLevel];
    const userKeysOfRequiredLevel = ownedKeys.filter(k => k.level === recipe?.fromLevel).length;

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
                <CardContent className="space-y-4">
                   <div>
                        <label className="text-sm font-medium">Select Target Level</label>
                         <Select onValueChange={setTargetUpgradeLevel} defaultValue={targetUpgradeLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a level to upgrade to..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(upgradeRecipes).map(([level, r]) => (
                                    <SelectItem key={level} value={level}>Upgrade to Level {level}: {r.toName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>

                    {recipe && (
                        <div className="grid md:grid-cols-3 gap-6 items-center">
                            {/* Materials Required */}
                            <div className="flex flex-col items-center gap-2">
                                <p className="font-bold">Required Materials</p>
                                <Card className="p-4 w-full text-sm space-y-2">
                                    <div>
                                        <div className="flex justify-between">
                                           <span>{recipe.fromCount}x {recipe.fromName}</span>
                                           <span className={userKeysOfRequiredLevel >= recipe.fromCount ? 'text-green-400' : 'text-red-400'}>({userKeysOfRequiredLevel} owned)</span>
                                        </div>
                                    </div>
                                    {recipe.shards.map(shard => {
                                        const owned = ownedShards.find(s => s.name === shard.name)?.count || 0;
                                        return (
                                            <div key={shard.name} className="flex justify-between">
                                                <span>{shard.count}x {shard.name}</span>
                                                <span className={owned >= shard.count ? 'text-green-400' : 'text-red-400'}>({owned} owned)</span>
                                            </div>
                                        )
                                    })}
                                    <p className="flex items-center gap-1 pt-2 border-t mt-2"><Coins size={14}/> {recipe.jin} $JIN</p>
                                </Card>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex justify-center items-center">
                                <ArrowRight size={48} className="text-primary animate-pulse" />
                            </div>
                            
                            {/* Result */}
                            <div className="flex flex-col items-center gap-2">
                                <p className="font-bold">Result</p>
                                <div className="w-40">
                                    <Image src={recipe.toImage} alt={recipe.toName} width={400} height={500} className="rounded-lg border" data-ai-hint={recipe.toDataAiHint}/>
                                    <p className="text-center mt-1 font-semibold">1x {recipe.toName}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full md:w-auto ml-auto" disabled={!recipe}>Upgrade to Level {targetUpgradeLevel}</Button>
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
                                    <SelectItem key={key.id} value={key.id.toString()}>{key.name} (Lv. {key.level})</SelectItem>
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
