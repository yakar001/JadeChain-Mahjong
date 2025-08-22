import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

interface ShardCardProps {
  name: string;
  price: number;
  image: string;
  'data-ai-hint'?: string;
}

export function ShardCard({ name, price, image, 'data-ai-hint': dataAiHint }: ShardCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <div className="aspect-square bg-card-foreground/5 p-2">
        <Image
          src={image}
          alt={name}
          width={200}
          height={200}
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
          data-ai-hint={dataAiHint}
        />
      </div>
       <CardContent className="p-2 flex-grow">
        <p className="text-sm font-headline truncate text-center">{name}</p>
      </CardContent>
      <CardFooter className="p-2 flex justify-between items-center">
        <div className="flex items-center gap-1 font-bold text-primary text-sm">
          <Coins className="w-4 h-4" />
          <span>{price.toFixed(2)}</span>
        </div>
        <Button size="sm" variant="secondary">
          Buy
        </Button>
      </CardFooter>
    </Card>
  );
}
