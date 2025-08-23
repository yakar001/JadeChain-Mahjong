import { AiTutor } from '@/components/game/ai-tutor';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Undo2 } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline text-primary">新手场 (Novice Room)</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <Undo2 />
              返回大厅 (Back to Lobby)
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>游戏面板 (Game Board)</CardTitle>
          </CardHeader>
          <CardContent>
            <GameBoard />
          </CardContent>
        </Card>

        <Separator />

        <div>
          <h2 className="text-xl font-bold mb-4">您的手牌 (Your Hand)</h2>
          <PlayerHand />
        </div>
      </div>
      <div className="lg:col-span-1">
        <AiTutor />
      </div>
    </div>
  );
}
