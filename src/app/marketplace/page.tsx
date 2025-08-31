
'use client';
import { useState, useMemo } from 'react';
import { KeyNftCard } from '@/components/marketplace/key-nft-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Package, KeyRound, ArrowUpDown } from 'lucide-react';
import { ShardCard } from '@/components/marketplace/shard-card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { NftKey } from '@/types';

const keyNfts: NftKey[] = [
  {
    name: '金龙 (Golden Dragon)',
    level: 5,
    cap: 500,
    energy: 500,
    weightH: 10.0,
    weightW: 20.0,
    price: 15000,
    image: 'https://placehold.co/400x500.png',
    'data-ai-hint': 'gold dragon statue',
  },
  {
    name: '金鼎 (Golden Tripod)',
    level: 4,
    cap: 3000,
    energy: 250,
    weightH: 5.0,
    weightW: 10.0,
    price: 3000,
    image: 'https://placehold.co/400x500.png',
    'data-ai-hint': 'gold ancient cauldron',
  },
  {
    name: '金脉 (Golden Vein)',
    level: 3,
    cap: 10000,
    energy: 120,
    weightH: 3.2,
    weightW: 5.5,
    price: 500,
    image: 'https://placehold.co/400x500.png',
    'data-ai-hint': 'gold glowing lines',
  },
  {
    name: '金潮 (Golden Tide)',
    level: 2,
    cap: 50000,
    energy: 80,
    weightH: 1.8,
    weightW: 2.5,
    price: 100,
    image: 'https://placehold.co/400x500.png',
    'data-ai-hint': 'gold flowing wave',
  },
  {
    name: '金砂 (Golden Sand)',
    level: 1,
    cap: Infinity,
    energy: 50,
    weightH: 1.0,
    weightW: 1.0,
    price: 10,
    image: 'https://placehold.co/400x500.png',
    'data-ai-hint': 'gold sand particle',
  },
];

const shards = [
    { name: "万字碎片", description: "Character Shard", image: "https://placehold.co/200x200.png", price: 1.8, "data-ai-hint": "glowing character fragment" },
    { name: "筒字碎片", description: "Dots Shard", image: "https://placehold.co/200x200.png", price: 1.2, "data-ai-hint": "glowing circle fragment" },
    { name: "索字碎片", description: "Bamboo Shard", image: "https://placehold.co/200x200.png", price: 1.5, "data-ai-hint": "glowing bamboo fragment" },
    { name: "神龙碎片", description: "Dragon Shard", image: "https://placehold.co/200x200.png", price: 5.0, "data-ai-hint": "glowing dragon fragment" },
];

type SortOption = 'price-desc' | 'price-asc' | 'level-desc' | 'level-asc';

export default function MarketplacePage() {
  const { toast } = useToast();
  const [sortOption, setSortOption] = useState<SortOption>('level-desc');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [pendingPurchase, setPendingPurchase] = useState<NftKey | null>(null);


  const handleBuyKey = (key: NftKey) => {
    setPendingPurchase(key);
  };

  const confirmPurchase = () => {
    if (!pendingPurchase) return;
    toast({
      title: '购买成功 (Purchase Successful)',
      description: `您已花费 ${pendingPurchase.price} $JIN 购买了 ${pendingPurchase.name}。`
    });
    setPendingPurchase(null);
  }

  const handleBuyShard = (shardName: string, price: number) => {
    toast({
      title: '购买成功 (Purchase Successful)',
      description: `您已花费 ${price.toFixed(2)} $JIN 购买了 ${shardName}。`
    });
  };

  const sortedAndFilteredKeys = useMemo(() => {
    let filtered = [...keyNfts];

    if (levelFilter !== 'all') {
      filtered = filtered.filter(nft => nft.level === parseInt(levelFilter));
    }

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-desc': return b.price - a.price;
        case 'price-asc': return a.price - b.price;
        case 'level-desc': return b.level - a.level;
        case 'level-asc': return a.level - b.level;
        default: return 0;
      }
    });
  }, [sortOption, levelFilter]);


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">NFT 市场 (Marketplace)</h1>
        <p className="text-muted-foreground mt-2">购买 NFT 密钥以参与质押分红，或购买碎片来合成您的第一把密钥。</p>
      </div>
      <Tabs defaultValue="keys">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="keys">
            <KeyRound className="mr-2" />
            NFT 密钥 (NFT Keys)
          </TabsTrigger>
          <TabsTrigger value="shards">
            <Package className="mr-2" />
            碎片 (Shards)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">排序方式</label>
                    <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="level-desc">等级: 从高到低</SelectItem>
                            <SelectItem value="level-asc">等级: 从低到高</SelectItem>
                            <SelectItem value="price-desc">价格: 从高到低</SelectItem>
                            <SelectItem value="price-asc">价格: 从低到高</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex-1">
                    <label className="text-sm text-muted-foreground">筛选等级</label>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by level..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">所有等级</SelectItem>
                            <SelectItem value="5">Level 5</SelectItem>
                            <SelectItem value="4">Level 4</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="1">Level 1</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedAndFilteredKeys.map((nft) => (
              <KeyNftCard key={nft.level} {...nft} onBuy={() => handleBuyKey(nft)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shards">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shards.map((shard, index) => (
                <ShardCard key={index} {...shard} onBuy={() => handleBuyShard(shard.name, shard.price)} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

        <AlertDialog open={!!pendingPurchase} onOpenChange={(open) => !open && setPendingPurchase(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确认购买吗？ (Confirm Purchase)</AlertDialogTitle>
                    <AlertDialogDescription>
                        您即将购买 <span className="font-bold text-primary">{pendingPurchase?.name}</span>。
                        这将从您的钱包中花费 <span className="font-bold text-primary font-mono">{pendingPurchase?.price.toLocaleString()} $JIN</span>。
                        此操作在链上确认后将无法撤销。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPendingPurchase(null)}>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmPurchase}>确认购买</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}

    