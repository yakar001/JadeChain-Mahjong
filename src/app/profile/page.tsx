import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Coins, BarChart, Trophy, Gamepad2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ownedNfts = [
  { name: 'Gilded Dragon', image: 'https://placehold.co/400x600.png', 'data-ai-hint': 'gold dragon' },
  { name: 'Crypto Punk', image: 'https://placehold.co/400x400.png', 'data-ai-hint': 'cyberpunk character' },
  { name: 'Imperial Character', image: 'https://placehold.co/400x600.png', 'data-ai-hint': 'chinese calligraphy' },
];

export default function ProfilePage() {
  return (
    <div>
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="wise master" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold font-headline">PlayerOne</h1>
            <p className="text-muted-foreground">0x1234...abcd</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xl font-bold text-primary">
              <Coins /> 1,234 JADE
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart />
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Gamepad2 className="text-accent" />
                <span>152</span>
              </div>
              <p className="text-muted-foreground">Matches Played</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Trophy className="text-primary" />
                <span>88</span>
              </div>
              <p className="text-muted-foreground">Wins</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <span className="text-secondary-foreground">57.9%</span>
              </div>
              <p className="text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">NFT Collection</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ownedNfts.map((nft, index) => (
            <div key={index} className="group relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src={nft.image}
                alt={nft.name}
                width={400}
                height={500}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                data-ai-hint={nft['data-ai-hint']}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-sm font-semibold">{nft.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
