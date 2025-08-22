
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, Shield, Weight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface KeyNftCardProps {
  name: string;
  level: number;
  cap: number;
  energy: number;
  weightH: number;
  weightW: number;
  price: number;
  image: string;
  'data-ai-hint'?: string;
  onBuy: () => void;
}

const levelColors = {
  1: 'bg-yellow-800/80 border-yellow-700',
  2: 'bg-yellow-700/80 border-yellow-600',
  3: 'bg-yellow-600/80 border-yellow-500',
  4: 'bg-yellow-500/80 border-yellow-400 text-black',
  5: 'bg-yellow-400/80 border-yellow-300 text-black',
};

export function KeyNftCard({ name, level, cap, energy, weightH, weightW, price, image, 'data-ai-hint': dataAiHint, onBuy }: KeyNftCardProps) {
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
        <Badge className={`absolute top-2 right-2 ${levelColors[level as keyof typeof levelColors]}`}>
            Lv. {level}
        </Badge>
        <p className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          {isFinite(cap) ? `1 / ${cap.toLocaleString()}` : 'Unlimited'}
        </p>
      </CardHeader>
      <CardContent className="p-3 flex-grow space-y-2">
        <CardTitle className="text-base font-headline truncate">{name}</CardTitle>
        <div className="text-xs text-muted-foreground space-y-1">
            <div className='flex justify-between items-center'>
                <span className='flex items-center gap-1'><Zap size={12} className='text-primary'/> Energy (能量)</span>
                <span>{energy}</span>
            </div>
            <div className='flex justify-between items-center'>
                <span className='flex items-center gap-1'><Shield size={12} className='text-primary'/> Weight H (权重 H)</span>
                <span>{weightH.toFixed(1)}</span>
            </div>
            <div className='flex justify-between items-center'>
                <span className='flex items-center gap-1'><Weight size={12} className='text-primary'/> Weight W (权重 W)</span>
                <span>{weightW.toFixed(1)}</span>
            </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-1 font-bold text-primary">
          <Coins className="w-4 h-4" />
          <span>{price.toLocaleString()}</span>
        </div>
        <Button size="sm" onClick={onBuy}>
          Buy (购买)
        </Button>
      </CardFooter>
    </Card>
  );
}

    