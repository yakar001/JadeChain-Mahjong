
'use client';
import { KeyNftCard } from '@/components/marketplace/key-nft-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Package, KeyRound } from 'lucide-react';
import { ShardCard } from '@/components/marketplace/shard-card';
import { useToast } from '@/hooks/use-toast';

const keyNfts = [
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
    { name: "Bamboo Shard", image: "https://placehold.co/200x200.png", price: 1.5, "data-ai-hint": "glowing bamboo fragment" },
    { name: "Dots Shard", image: "https://placehold.co/200x200.png", price: 1.2, "data-ai-hint": "glowing circle fragment" },
    { name: "Character Shard", image: "https://placehold.co/200x200.png", price: 1.8, "data-ai-hint": "glowing character fragment" },
    { name: "Dragon Shard", image: "https://placehold.co/200x200.png", price: 5.0, "data-ai-hint": "glowing dragon fragment" },
];

export default function MarketplacePage() {
  const { toast } = useToast();

  const handleBuyKey = (keyName: string, price: number) => {
    toast({
      title: '购买成功 (Purchase Successful)',
      description: `您已花费 ${price} $JIN 购买了 ${keyName}。`
    });
  };

  const handleBuyShard = (shardName: string, price: number) => {
    toast({
      title: '购买成功 (Purchase Successful)',
      description: `您已花费 ${price.toFixed(2)} $JIN 购买了 ${shardName}。`
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">Marketplace (市场)</h1>
        <div className="flex items-center gap-4 text-primary">
          <div className="flex items-center gap-2">
            <Coins />
            <span className="font-semibold">$JIN</span>
          </div>
        </div>
      </div>
      <Tabs defaultValue="keys">
        <TabsList className="mb-4">
          <TabsTrigger value="keys">
            <KeyRound className="mr-2 h-4 w-4" />
            NFT Keys (NFT 密钥)
          </TabsTrigger>
          <TabsTrigger value="shards">
            <Package className="mr-2 h-4 w-4" />
            Shards (碎片)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="keys">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {keyNfts.map((nft) => (
              <KeyNftCard key={nft.level} {...nft} onBuy={() => handleBuyKey(nft.name, nft.price)} />
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
    </div>
  );
}
