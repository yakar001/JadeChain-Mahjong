
'use client';
import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo2, Hand, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { AiTutor } from '@/components/game/ai-tutor';
import { Separator } from '@/components/ui/separator';

// 定义牌的类型
type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], discards: Tile[] };

// 初始牌的数据
const suits = ['dots', 'bamboo', 'characters'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const honors = ['E', 'S', 'W', 'N', 'R', 'G', 'B'];

const createDeck = (): Tile[] => {
  let deck: Tile[] = [];
  // 万筒索
  for (let i = 0; i < 4; i++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    // 字牌
    for (const honor of honors) {
        const suit = ['E', 'S', 'W', 'N'].includes(honor) ? 'wind' : 'dragon';
        deck.push({ suit, value: honor });
    }
  }
  return deck;
};

// 洗牌
const shuffleDeck = (deck: Tile[]): Tile[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export default function GamePage() {
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goldenTile, setGoldenTile] = useState<Tile | null>(null);
  const [activePlayer, setActivePlayer] = useState(0); // 0 is human player
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);

  const initializeGame = () => {
    const shuffled = shuffleDeck(createDeck());
    
    // 闽南游金玩法：随机指定一张为“金”牌
    const golden = shuffled.pop();
    setGoldenTile(golden);
    
    const initialPlayers: Player[] = [
      { id: 0, name: 'You (南)', avatar: 'https://placehold.co/40x40.png', isAI: false, hand: [], discards: [] },
      { id: 1, name: 'Player 2 (东)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
      { id: 2, name: 'Player 3 (北)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
      { id: 3, name: 'Player 4 (西)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
    ];

    // 发牌
    for (let i = 0; i < 13; i++) {
      for (const player of initialPlayers) {
        player.hand.push(shuffled.pop()!);
      }
    }

    setPlayers(initialPlayers);
    setWall(shuffled);
    setActivePlayer(0);
    setDrawnTile(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleDrawTile = () => {
    if (wall.length > 0 && !drawnTile && activePlayer === 0) {
      const newWall = [...wall];
      const tile = newWall.pop()!;
      setWall(newWall);
      setDrawnTile(tile);

      const updatedPlayers = [...players];
      updatedPlayers[0].hand.push(tile);
      setPlayers(updatedPlayers);
    }
  };

  const handleDiscardTile = (tileIndex: number) => {
    if (!drawnTile && activePlayer !== 0) return; // Not your turn or haven't drawn

    const updatedPlayers = [...players];
    const player = updatedPlayers[0];
    const tileToDiscard = player.hand[tileIndex];
    
    player.hand.splice(tileIndex, 1);
    player.discards.push(tileToDiscard);
    
    setPlayers(updatedPlayers);
    setDrawnTile(null);
    // TODO: Add logic for next player's turn
  };

  const humanPlayer = players.find(p => p.id === 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline text-primary">新手场 (Novice Room)</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={initializeGame}>
                <Shuffle />
                新对局 (New Game)
            </Button>
            <Button variant="outline" asChild>
                <Link href="/">
                <Undo2 />
                返回大厅 (Back to Lobby)
                </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-2 md:p-4">
            <GameBoard players={players} activePlayerId={activePlayer} />
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">您的手牌 (Your Hand)</h2>
                    {goldenTile && (
                        <div className="flex items-center gap-2 text-sm text-yellow-400 border border-yellow-400/50 bg-yellow-400/10 px-2 py-1 rounded-md">
                            <span>金牌 (Wild):</span>
                            <div className="w-6 h-8 flex items-center justify-center text-xs">
                                {goldenTile.suit === 'characters' ? '万' : goldenTile.suit === 'dots' ? '筒' : goldenTile.suit === 'bamboo' ? '索' : ''}{goldenTile.value}
                            </div>
                        </div>
                    )}
                </div>
                 <Button onClick={handleDrawTile} disabled={!!drawnTile || activePlayer !== 0}>
                    <Hand className="mr-2 h-4 w-4" />
                    摸牌 (Draw Tile)
                </Button>
            </div>
            
            <PlayerHand 
                hand={humanPlayer?.hand || []} 
                onDiscard={handleDiscardTile}
                canDiscard={!!drawnTile}
                goldenTile={goldenTile}
            />
        </div>
      </div>
      <div className="lg:col-span-1">
        <AiTutor />
      </div>
    </div>
  );
}
