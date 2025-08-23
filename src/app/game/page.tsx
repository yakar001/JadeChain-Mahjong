
'use client';
import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Crown } from 'lucide-react';
import Link from 'next/link';
import { AiTutor } from '@/components/game/ai-tutor';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import crypto from 'crypto';
import { getSpeech } from '@/app/actions';
import { MahjongTile } from '@/components/game/mahjong-tile';

// 定义牌的类型
type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], discards: Tile[] };
type DiceRoll = [number, number];

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

const getTileName = (tile: Tile): string => {
    if (tile.suit === 'dots') return `${tile.value}筒`;
    if (tile.suit === 'bamboo') return `${tile.value}索`;
    if (tile.suit === 'characters') return `${tile.value}万`;
    const honorMap: Record<string, string> = { 'E': '东风', 'S': '南风', 'W': '西风', 'N': '北风', 'R': '红中', 'G': '发财', 'B': '白板' };
    return honorMap[tile.value] || '';
}

export default function GamePage() {
  const [gameState, setGameState] = useState<'pre-roll' | 'rolling' | 'deal' | 'banker-roll-for-golden' | 'playing'>('pre-roll');
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goldenTile, setGoldenTile] = useState<Tile | null>(null);
  const [activePlayer, setActivePlayer] = useState(0); // 0 is human player
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);
  const [dice, setDice] = useState<DiceRoll>([1, 1]);
  const [bankerId, setBankerId] = useState(0);
  const [shuffleHash, setShuffleHash] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);


  const initializeGame = () => {
    setGameState('pre-roll');
    const newDeck = createDeck();
    
    // Create a hash for shuffle fairness
    const deckString = JSON.stringify(newDeck.sort((a,b) => (a.suit+a.value).localeCompare(b.suit+b.value)));
    const seed = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(deckString + seed).digest('hex');
    setShuffleHash(hash);
    
    const shuffled = shuffleDeck(newDeck);
    
    setWall(shuffled);
    setGoldenTile(null);
    const initialPlayers: Player[] = [
      { id: 0, name: 'You (南)', avatar: 'https://placehold.co/40x40.png', isAI: false, hand: [], discards: [] },
      { id: 1, name: 'Player 2 (东)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
      { id: 2, name: 'Player 3 (北)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
      { id: 3, name: 'Player 4 (西)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [] },
    ];
    setPlayers(initialPlayers);
    setActivePlayer(0);
    setDrawnTile(null);
    setSelectedTileIndex(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleRollDice = () => {
    setGameState('rolling');
    const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    setDice(newDice);
    
    setTimeout(() => {
        const total = newDice[0] + newDice[1];
        const newBankerId = (total - 1) % 4;
        setBankerId(newBankerId);
        
        const wallCopy = [...wall];
        
        const initialPlayers: Player[] = [...players];
        // Deal 13 tiles to each player
        for (let i = 0; i < 13; i++) {
            for (const player of initialPlayers) {
                player.hand.push(wallCopy.pop()!);
            }
        }
        
        // Banker draws one extra tile
        initialPlayers[newBankerId].hand.push(wallCopy.pop()!);

        setPlayers(initialPlayers);
        setWall(wallCopy);
        setActivePlayer(newBankerId);

        // Transition to next state
        if (newBankerId === 0) { // If human is the banker
            setGameState('banker-roll-for-golden');
        } else {
            // TODO: Simulate AI rolling for golden tile
            setGameState('playing');
        }


    }, 1500); // Animation delay for dice roll
  }

  const handleRollForGolden = () => {
    setGameState('rolling');
    const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    setDice(newDice);

    setTimeout(() => {
        const total = newDice[0] + newDice[1];
        const wallCopy = [...wall];
        // In a real game, this would be counted from the end of the wall.
        // For simplicity, we'll take it from a calculated index.
        const goldenIndex = total * 2;
        const golden = wallCopy.splice(goldenIndex, 1)[0];
        setGoldenTile(golden);
        setWall(wallCopy);
        setGameState('playing');
    }, 1500);
  }

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

  const handleSelectOrDiscardTile = async (tileIndex: number) => {
    if (activePlayer !== 0 || !drawnTile) return;

    if (selectedTileIndex === tileIndex) {
      // This is the second click, so discard the tile
      const updatedPlayers = [...players];
      const player = updatedPlayers[0];
      const tileToDiscard = player.hand[tileIndex];
      
      player.hand.splice(tileIndex, 1);
      player.discards.push(tileToDiscard);
      
      setPlayers(updatedPlayers);
      setDrawnTile(null);
      setSelectedTileIndex(null); // Reset selection
      
      // Play audio for discarded tile
      if (!isMuted) {
          try {
              const tileName = getTileName(tileToDiscard);
              const response = await getSpeech(tileName);
              if(response.media) {
                  setAudioSrc(response.media);
              }
          } catch (error) {
              console.error("Error playing discard audio:", error);
          }
      }
      
      // TODO: Add logic for next player's turn
      // For now, we'll simulate the next AI player's turn quickly
      // In a real game, this would have more logic and delay
      if(players.length > 1) {
          const nextPlayerIndex = (activePlayer + 1) % players.length;
          setActivePlayer(nextPlayerIndex);
          // Here you would implement AI logic for other players
      }

    } else {
      // This is the first click, just select the tile
      setSelectedTileIndex(tileIndex);
    }
  };

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play();
    }
  }, [audioSrc]);

  const humanPlayer = players.find(p => p.id === 0);
  const isBankerAndHuman = bankerId === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold font-headline text-primary">新手场 (Novice Room)</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline"><BookOpen/> 玩法说明 (Rules)</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>闽南游金麻将 (Minnan Golden Mahjong Rules)</AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        <p><strong>核心特点：</strong>开局后随机指定一张牌为“金牌”（Wild Tile），该牌可以当做任意一张牌来使用。</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>开金：</strong>庄家再次掷骰子，根据点数从牌墙的何处翻开一张牌作为“金”。</li>
                            <li><strong>作用：</strong>金牌可以用来替代任何你需要的牌来组成顺子、刻子或将牌。</li>
                            <li><strong>胜负：</strong>拥有金牌可以极大地提高胡牌的概率和牌型的大小。</li>
                        </ul>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogAction> <ThumbsUp className="mr-2"/> 明白了 (Got it)</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
            <GameBoard 
                players={players} 
                activePlayerId={activePlayer}
                wallCount={wall.length}
                dice={dice}
                gameState={gameState}
                bankerId={bankerId}
             />
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">您的手牌 (Your Hand)</h2>
                    {goldenTile && (
                        <div className="flex items-center gap-2 text-sm text-yellow-400 border border-yellow-400/50 bg-yellow-400/10 px-2 py-1 rounded-md">
                            <span>金牌 (Wild):</span>
                             <MahjongTile suit={goldenTile.suit} value={goldenTile.value} size="sm" />
                        </div>
                    )}
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="sound-mute" checked={!isMuted} onCheckedChange={() => setIsMuted(!isMuted)} />
                        <Label htmlFor="sound-mute">{isMuted ? <VolumeX/> : <Volume2/> } 语音播报</Label>
                    </div>
                    {gameState === 'pre-roll' && <Button onClick={handleRollDice}><Dices className="mr-2"/> 掷骰子开局 (Roll Dice)</Button>}
                    {gameState === 'banker-roll-for-golden' && isBankerAndHuman && <Button onClick={handleRollForGolden}><Crown className="mr-2 text-yellow-400"/> 掷骰开金 (Roll for Wild)</Button>}
                    {gameState === 'playing' && activePlayer === 0 && !drawnTile && (
                      <Button onClick={handleDrawTile}>
                          <Hand className="mr-2 h-4 w-4" />
                          摸牌 (Draw Tile)
                      </Button>
                    )}
                 </div>
            </div>
            
            <PlayerHand 
                hand={humanPlayer?.hand || []} 
                onTileClick={handleSelectOrDiscardTile}
                canInteract={!!drawnTile && activePlayer === 0}
                goldenTile={goldenTile}
                selectedTileIndex={selectedTileIndex}
            />
        </div>
        <div className="text-xs text-muted-foreground break-all">
            <strong>Shuffle Hash (确保公平):</strong> {shuffleHash}
        </div>
      </div>
      <div className="lg:col-span-1">
        <AiTutor />
      </div>
    </div>
  );
}
