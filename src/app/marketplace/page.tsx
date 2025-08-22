import { NftCard } from '@/components/marketplace/nft-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins } from 'lucide-react';

const tileSkins = [
  {
    name: 'Gilded Dragon',
    price: 1.5,
    rarity: 'Legendary',
    image: 'https://placehold.co/400x600.png',
    'data-ai-hint': 'gold dragon',
  },
  {
    name: 'Jade Bamboo',
    price: 0.8,
    rarity: 'Epic',
    image: 'https://placehold.co/400x600.png',
    'data-ai-hint': 'jade bamboo',
  },
  {
    name: 'Blockchain Dot',
    price: 0.5,
    rarity: 'Rare',
    image: 'https://placehold.co/400x600.png',
    'data-ai-hint': 'glowing circuit',
  },
  {
    name: 'Imperial Character',
    price: 0.2,
    rarity: 'Common',
    image: 'https://placehold.co/400x600.png',
    'data-ai-hint': 'chinese calligraphy',
  },
];

const avatars = [
  {
    name: 'The Strategist',
    price: 2.0,
    rarity: 'Legendary',
    image: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'wise master',
  },
  {
    name: 'Crypto Punk',
    price: 1.2,
    rarity: 'Epic',
    image: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'cyberpunk character',
  },
  {
    name: 'Jade Maiden',
    price: 0.9,
    rarity: 'Rare',
    image: 'https://placehold.co/400x400.png',
    'data-ai-hint': 'beautiful princess',
  },
];

export default function MarketplacePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">NFT Marketplace</h1>
        <div className="flex items-center gap-2 text-primary">
          <Coins />
          <span className="font-semibold">JADE</span>
        </div>
      </div>
      <Tabs defaultValue="tiles">
        <TabsList className="mb-4">
          <TabsTrigger value="tiles">Tile Skins</TabsTrigger>
          <TabsTrigger value="avatars">Player Avatars</TabsTrigger>
        </TabsList>
        <TabsContent value="tiles">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tileSkins.map((nft, index) => (
              <NftCard key={index} {...nft} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="avatars">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {avatars.map((nft, index) => (
              <NftCard key={index} {...nft} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
