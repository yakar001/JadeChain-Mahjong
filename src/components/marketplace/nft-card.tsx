import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';

interface NftCardProps {
  name: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  image: string;
  'data-ai-hint'?: string;
}

const rarityColors = {
  Common: 'bg-gray-500',
  Rare: 'bg-blue-500',
  Epic: 'bg-purple-600',
  Legendary: 'bg-yellow-500 text-black',
};

export function NftCard({ name, price, rarity, image, 'data-ai-hint': dataAiHint }: NftCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={400}
            height={500}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={dataAiHint}
          />
        </div>
        <Badge className={`absolute top-2 right-2 ${rarityColors[rarity]}`}>{rarity}</Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline">{name}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Coins className="w-5 h-5" />
          <span>{price.toFixed(2)}</span>
        </div>
        <Button size="sm" variant="secondary">
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
