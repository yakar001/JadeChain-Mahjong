
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowRight, Hammer, Zap, Coins, Package, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// In production, this data will be fetched from the user's wallet and smart contracts.
const ownedKeys: { id: number, name: string, level: number, energy: number, energyMax: number, image: string, 'data-ai-hint': string }[] = [];
const ownedShards: { name: string, count: number }[] = [];

// This should be fetched from a backend or configuration file.
const upgradeRecipes: Record<string, { fromLevel: number; fromName: string; fromCount: number; jin: number; shards: { name: string; count: number }[], toName: string; toImage: string, toDataAiHint: string }> = {
    "2": { fromLevel: 1, fromName: "金砂 (Golden Sand)", fromCount: 5, jin: 100, shards: [{ name: "万字碎片", count: 20 }], toName: '金潮 (Golden Tide)', toImage: 'https://placehold.co/400x500.png', toDataAiHint: 'gold flowing wave' },
    "3": { fromLevel: 2, fromName: "金潮 (Golden Tide)", fromCount: 3, jin: 500, shards: [{ name: "神龙碎片", count: 10 }], toName: '金脉 (Golden Vein)', toImage: 'https://placehold.co/400x500.png', toDataAiHint: 'gold glowing lines' },
};

const synthesizeRecipe = {
    shards: [
        { name: "索字碎片", count: 10 },
        { name: "筒字碎片", count: 10 },
        { name: "万字碎片", count: 10 },
    ],
    jin: 10,
    toName: '金砂 (Golden Sand)',
    toImage: 'https://placehold.co/400x500.png',
    toDataAiHint: 'gold sand particle',
};

export default function WorkshopPage() {
    const [selectedKeyId, setSelectedKeyId] = useState<number | undefined>(ownedKeys[0]?.id);
    const [targetUpgradeLevel, setTargetUpgradeLevel] = useState<string>("2");
    const { toast } = useToast();

    const selectedKey = ownedKeys.find(k => k.id === selectedKeyId);
    const recipe = upgradeRecipes[targetUpgradeLevel];
    const userKeysOfRequiredLevel = ownedKeys.filter(k => k.level === recipe?.fromLevel).length;

    const canUpgrade = recipe && userKeysOfRequiredLevel >= recipe.fromCount && recipe.shards.every(shard => (ownedShards.find(s => s.name === shard.name)?.count || 0) >= shard.count);
    
    const canSynthesize = synthesizeRecipe.shards.every(shard => {
        const owned = ownedShards.find(s => s.name === shard.name)?.count || 0;
        return owned >= shard.count;
    });

    const handleUpgrade = () => {
        if (canUpgrade) {
            toast({
                title: "升级成功",
                description: `您已成功将 ${recipe.fromCount}x ${recipe.fromName} 升级为 1x ${recipe.toName}!`
            });
        }
    };

    const handleSynthesize = () => {
        if (canSynthesize) {
            toast({
                title: "合成成功",
                description: `您已成功合成了 1x ${synthesizeRecipe.toName}!`
            });
        }
    };
    
    const handleRefill = () => {
        if (selectedKey && selectedKey.energy < selectedKey.energyMax) {
            const cost = (selectedKey.energyMax - selectedKey.energy) * 0.5;
            toast({
                title: "能量补充成功",
                description: `您已花费 ${cost.toFixed(2)} $JIN 为 ${selectedKey.name} 补充了能量。`
            });
        }
    };
    
    const EmptyState = ({ title, description, buttonText, buttonLink }: { title: string, description: string, buttonText: string, buttonLink: string }) => (
         <div className="text-center text-muted-foreground p-8">
            <p className="mb-2 font-semibold text-foreground">{title}</p>
            <p className="text-sm mb-4">{description}</p>
            <Button variant="outline" asChild><Link href={buttonLink}>{buttonText}</Link></Button>
        </div>
    );

    const MaterialList = ({ items, jin, ownedShardsData }: { items: {name: string, count: number}[], jin: number, ownedShardsData: {name: string, count: number}[] }) => (
        <Card className="p-4 w-full text-sm space-y-2 bg-accent/50">
            {items.map(item => {
                const owned = ownedShardsData.find(s => s.name === item.name)?.count || 0;
                const hasEnough = owned >= item.count;
                return (
                    <div key={item.name} className="flex justify-between">
                        <span>{item.count}x {item.name}</span>
                        <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>({owned} / {item.count})</span>
                    </div>
                );
            })}
            <div className="flex items-center gap-1 pt-2 border-t mt-2"><Coins size={14} className="text-primary"/> {jin} $JIN</div>
        </Card>
    );

    const ResultDisplay = ({ name, image, dataAiHint }: { name: string, image: string, dataAiHint: string }) => (
         <div className="flex flex-col items-center gap-2">
            <p className="font-bold font-headline">获得</p>
            <div className="w-40">
                <Image src={image} alt={name} width={400} height={500} className="rounded-lg border border-primary/20" data-ai-hint={dataAiHint}/>
                <p className="text-center mt-1 font-semibold">1x {name}</p>
            </div>
        </div>
    );


    return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-2 flex items-center gap-2"><Hammer /> NFT 工坊 (Workshop)</h1>
      <p className="text-muted-foreground mb-8">升级、合成或为您的 NFT 密钥补充能量，以最大化您的质押收益。</p>

      <Tabs defaultValue="upgrade">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upgrade"><RefreshCw className="mr-2"/> 升级密钥</TabsTrigger>
          <TabsTrigger value="synthesize"><Package className="mr-2"/> 合成密钥</TabsTrigger>
          <TabsTrigger value="energy"><Zap className="mr-2"/> 补充能量</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upgrade">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline">升级 NFT 密钥</CardTitle>
                    <CardDescription>合并低级密钥并支付费用，以获取更高权重的强大密钥。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                        <Label>选择目标等级</Label>
                         <Select onValueChange={setTargetUpgradeLevel} defaultValue={targetUpgradeLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="选择要升级到的等级..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(upgradeRecipes).map(([level, r]) => (
                                    <SelectItem key={level} value={level}>升级至 Level {level}: {r.toName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>

                    {recipe && (
                        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center pt-4">
                            <div className="flex flex-col items-center gap-2">
                                <p className="font-bold font-headline">需求材料</p>
                                <Card className="p-4 w-full text-sm space-y-2 bg-accent/50">
                                    <div className="flex justify-between">
                                       <span>{recipe.fromCount}x {recipe.fromName}</span>
                                       <span className={userKeysOfRequiredLevel >= recipe.fromCount ? 'text-green-400' : 'text-red-400'}>({userKeysOfRequiredLevel} / {recipe.fromCount})</span>
                                    </div>
                                    <MaterialList items={recipe.shards} jin={recipe.jin} ownedShardsData={ownedShards} />
                                </Card>
                            </div>
                            
                            <div className="flex justify-center items-center">
                                <ArrowRight size={48} className="text-primary animate-pulse hidden md:block" />
                                <ArrowDown size={48} className="text-primary animate-pulse md:hidden" />
                            </div>
                            
                            <ResultDisplay name={recipe.toName} image={recipe.toImage} dataAiHint={recipe.toDataAiHint} />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full md:w-auto ml-auto" disabled={!canUpgrade} onClick={handleUpgrade}>
                        <RefreshCw />
                        确认升级
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
        
        <TabsContent value="synthesize">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline">合成 NFT 密钥</CardTitle>
                    <CardDescription>合并游戏内获得的碎片以铸造一个新的 Level 1 NFT 密钥。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-bold font-headline">需求材料</p>
                            <MaterialList items={synthesizeRecipe.shards} jin={synthesizeRecipe.jin} ownedShardsData={ownedShards} />
                        </div>
                        
                        <div className="flex justify-center items-center">
                             <ArrowRight size={48} className="text-primary animate-pulse hidden md:block" />
                             <ArrowDown size={48} className="text-primary animate-pulse md:hidden" />
                        </div>
                        
                        <ResultDisplay name={synthesizeRecipe.toName} image={synthesizeRecipe.toImage} dataAiHint={synthesizeRecipe.toDataAiHint} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full md:w-auto ml-auto" disabled={!canSynthesize} onClick={handleSynthesize}>
                        <Package />
                        确认合成
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="energy">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                 <CardHeader>
                    <CardTitle className="font-headline">补充能量</CardTitle>
                    <CardDescription>为您的 NFT 密钥补充能量。能量是在质押中赚取奖励的必需品。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {ownedKeys.length > 0 ? (
                        <>
                            <div>
                                <Label>选择 NFT 密钥</Label>
                                <Select onValueChange={(val) => setSelectedKeyId(Number(val))} defaultValue={selectedKeyId?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择一个密钥..." />
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
                                        <Image src={selectedKey.image} alt={selectedKey.name} width={80} height={100} className="rounded-md border border-primary/20" data-ai-hint={selectedKey['data-ai-hint']} />
                                        <div className="w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-semibold flex items-center gap-1"><Zap size={14} /> 能量 (Energy)</p>
                                                <p className="font-mono">{selectedKey.energy} / {selectedKey.energyMax}</p>
                                            </div>
                                            <Progress value={(selectedKey.energy / selectedKey.energyMax) * 100} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground">
                                        充满所需费用: <span className="text-primary font-bold font-mono">{(selectedKey.energyMax - selectedKey.energy) * 0.5} $JIN</span>
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState 
                            title="您还没有任何密钥"
                            description="获取密钥以开始"
                            buttonText="前往市场"
                            buttonLink="/marketplace"
                        />
                    )}
                </CardContent>
                 <CardFooter>
                    <Button size="lg" className="w-full md:w-auto ml-auto" disabled={!selectedKey || selectedKey.energy === selectedKey.energyMax} onClick={handleRefill}>
                        <Zap />
                        补充能量
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
