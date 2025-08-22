import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { AiTutor } from '@/components/game/ai-tutor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold font-headline text-primary mb-4">Live Match</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Game Board</CardTitle>
          </CardHeader>
          <CardContent>
            <GameBoard />
          </CardContent>
        </Card>
        <Separator className="my-8" />
        <div>
          <h2 className="text-2xl font-bold font-headline mb-4">Your Hand</h2>
          <PlayerHand />
        </div>
      </div>
      <div className="lg:w-1/3 xl:w-1/4">
        <AiTutor />
      </div>
    </div>
  );
}
