
'use client';
import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Crown, Trophy, Bot, Loader2, Minus, Plus, Layers } from 'lucide-react';
import Link from 'next/link';
import { AiTutor } from '@/components/game/ai-tutor';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import crypto from 'crypto';
import { getSpeech } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- SIMULATION CONTROL ---
// Set to `true` to enable AI players to automatically take their turns.
// Set to `false` before deployment to disable simulation.
const SIMULATION_ENABLED = false;

// 定义牌的类型
type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], discards: Tile[]; melds: Tile[][]; balance: number; hasLocation: boolean | null; };
type DiceRoll = [number, number];
type GameState = 'pre-roll' | 'rolling' | 'deal' | 'banker-roll-for-golden' | 'playing' | 'game-over';

type RoundResult = {
    winners: Array<{ player: Player; netWin: number }>;
    losers: Array<{ player: Player; netLoss: number }>;
    biggestWinner: Player | null;
    tableFee: number;
} | null;

// 初始牌的数据
const suits = ['dots', 'bamboo', 'characters'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const honors = ['E', 'S', 'W', 'N', 'R', 'G', 'B'];
const INITIAL_BALANCE = 100;
const TURN_DURATION = 15; // 15 seconds per turn

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

function GameRoom() {
  const searchParams = useSearchParams();
  const roomTier = searchParams.get('tier') || 'Novice';
  const roomFee = parseInt(searchParams.get('fee') || '10', 10);
  const { toast } = useToast();
  
  const [STAKE_AMOUNT] = useState(roomFee);
  const [gameState, setGameState] = useState<GameState>('pre-roll');
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goldenTile, setGoldenTile] = useState<Tile | null>(null);
  const [activePlayer, setActivePlayer] = useState(0); // 0 is human player
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);
  const [dice, setDice] = useState<DiceRoll>([1, 1]);
  const [bankerId, setBankerId] = useState(0);
  const [shuffleHash, setShuffleHash] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiControlled, setIsAiControlled] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [pot, setPot] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [turnTimer, setTurnTimer] = useState(TURN_DURATION);
  const [canPerformAction, setCanPerformAction] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  const clearTimer = () => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
  }
    
  // Function to end the game and calculate results
  const handleEndGame = useCallback((winningPlayer: Player, winAmount: number) => {
    clearTimer();
    
    // All other players are losers
    const losingPlayers = players.filter(p => p.id !== winningPlayer.id);
    const lossAmount = winAmount / losingPlayers.length;

    // Calculate final balances
    const finalPlayers = players.map(p => {
        if (p.id === winningPlayer.id) {
            return { ...p, balance: p.balance + winAmount };
        }
        return { ...p, balance: p.balance - lossAmount };
    });

    const hasPlayerLost = finalPlayers.some(p => p.balance <= 0);

    // If a player has run out of chips, the game truly ends
    if (hasPlayerLost) {
        let totalWinnings = 0;
        const winners = finalPlayers.filter(p => p.balance > INITIAL_BALANCE).map(p => {
            const netWin = p.balance - INITIAL_BALANCE;
            totalWinnings += netWin;
            return { player: p, netWin };
        });

        const losers = finalPlayers.filter(p => p.balance < INITIAL_BALANCE).map(p => {
            const netLoss = INITIAL_BALANCE - p.balance;
            return { player: p, netLoss };
        });

        // Distribute pot proportionally
        let biggestWinner: Player | null = null;
        let maxWin = 0;

        const winnersWithDistribution = winners.map(w => {
            const share = totalWinnings > 0 ? (w.netWin / totalWinnings) * pot : 0;
            if(w.netWin > maxWin) {
                maxWin = w.netWin;
                biggestWinner = w.player;
            }
            return { ...w, potShare: share };
        });
        
        const tableFee = STAKE_AMOUNT; // The fee is the initial stake amount
        
        setRoundResult({
            winners: winnersWithDistribution.map(w => ({ player: w.player, netWin: w.potShare })),
            losers,
            biggestWinner,
            tableFee,
        });
        
        setGameState('game-over');
    } else {
        // Continue to the next round (not fully implemented, for now just update balances)
        setPlayers(finalPlayers);
        // Reset for next hand, e.g. re-deal etc. For now, we'll just show a toast.
         toast({
            title: "回合结束 (Hand Over)",
            description: `${winningPlayer.name} wins ${winAmount} chips!`,
        });
        // Here you would reset the hand, keep the balances, and start a new hand.
        // For simplicity of this implementation, we'll stop here.
    }
  }, [players, pot, STAKE_AMOUNT, toast]);


  const handleDiscardTile = useCallback(async (playerIndex: number, tileIndex: number) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[playerIndex];
    if (!player || tileIndex < 0 || tileIndex >= player.hand.length) {
      console.error("Invalid discard attempt");
      return;
    }

    const tileToDiscard = player.hand[tileIndex];
    
    player.hand.splice(tileIndex, 1);
    player.discards.push(tileToDiscard);
    
    setPlayers(updatedPlayers);
    setDrawnTile(null);
    setSelectedTileIndex(null); // Reset selection for human player
    
    if (playerIndex === 0) {
        clearTimer(); // Human player made a move, clear timer
    }

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
    
    // Check if other players can perform an action (Pong, Kong, Chow)
    // For simulation, we'll just enable it for the human player if it's an AI's turn
    if (playerIndex !== 0) {
        // Placeholder logic: just enable buttons for demo
        setCanPerformAction(true);
    } else {
         if(players.length > 1) {
            const nextPlayerIndex = (activePlayer + 1) % players.length;
            setActivePlayer(nextPlayerIndex);
        }
    }
  }, [players, activePlayer, isMuted]);

  // Timer useEffect
  useEffect(() => {
    if (gameState === 'playing' && activePlayer === 0 && drawnTile) {
      setTurnTimer(TURN_DURATION); // Reset timer
      timerRef.current = setInterval(() => {
        setTurnTimer(prev => prev - 1);
      }, 1000);

      return () => clearTimer();
    } else {
        clearTimer();
    }
  }, [gameState, activePlayer, drawnTile]);

  // Timer expiration or AI control useEffect
  useEffect(() => {
    // Handle timer expiration
    if (turnTimer <= 0 && activePlayer === 0 && drawnTile) {
      toast({ title: "时间到 (Time's Up!)", description: "自动为您打出最右边的牌。(Automatically discarding rightmost tile.)" });
      handleDiscardTile(0, players[0].hand.length - 1);
      return;
    }

    // Handle AI control
    if (isAiControlled && activePlayer === 0 && drawnTile) {
      const aiThinkTime = Math.random() * 1000 + 500; // Simulate 0.5-1.5s thinking
      const timeout = setTimeout(() => {
        handleDiscardTile(0, players[0].hand.length - 1);
      }, aiThinkTime);
      return () => clearTimeout(timeout);
    }
  }, [turnTimer, isAiControlled, activePlayer, drawnTile, players, handleDiscardTile, toast]);

  // AI Player Turn Simulation
  useEffect(() => {
      const currentPlayer = players[activePlayer];
      if (SIMULATION_ENABLED && gameState === 'playing' && currentPlayer?.isAI) {
          
          const handleAiTurn = async () => {
              // 1. Draw a tile
              const newWall = [...wall];
              const tileDrawn = newWall.pop();
              if (!tileDrawn) {
                  // Handle end of wall - for now, just pass turn
                  setActivePlayer((activePlayer + 1) % players.length);
                  return;
              }

              const updatedPlayers = [...players];
              updatedPlayers[activePlayer].hand.push(tileDrawn);
              
              setWall(newWall);
              setPlayers(updatedPlayers);
              
              // 2. Simulate thinking
              const thinkTime = Math.random() * 1000 + 500; // 0.5s to 1.5s
              await new Promise(resolve => setTimeout(resolve, thinkTime));

              // 3. Discard a tile (for simulation, discard the one just drawn)
              const discardIndex = updatedPlayers[activePlayer].hand.length - 1;
              handleDiscardTile(activePlayer, discardIndex);
          };

          const timeoutId = setTimeout(handleAiTurn, 500); // Small delay before AI starts its turn
          return () => clearTimeout(timeoutId);
      }
  }, [activePlayer, players, gameState, wall, handleDiscardTile]);


  const initializeGame = useCallback(() => {
    clearTimer();
    setGameState('pre-roll');
    setRoundResult(null);
    const newDeck = createDeck();
    
    const deckString = JSON.stringify(newDeck.sort((a,b) => (a.suit+a.value).localeCompare(b.suit+b.value)));
    const seed = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(deckString + seed).digest('hex');
    setShuffleHash(hash);
    
    const shuffled = shuffleDeck(newDeck);
    
    setWall(shuffled);
    setGoldenTile(null);
    const initialPlayers: Player[] = [
      { id: 0, name: 'You (南)', avatar: 'https://placehold.co/40x40.png', isAI: false, hand: [], discards: [], melds: [], balance: INITIAL_BALANCE, hasLocation: null },
      { id: 1, name: 'Player 2 (东)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [], melds: [[{ suit: 'bamboo', value: '2' }, { suit: 'bamboo', value: '2' }, { suit: 'bamboo', value: '2' }]], balance: INITIAL_BALANCE, hasLocation: true },
      { id: 2, name: 'Player 3 (北)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [], melds: [], balance: INITIAL_BALANCE, hasLocation: false },
      { id: 3, name: 'Player 4 (西)', avatar: 'https://placehold.co/40x40.png', isAI: true, hand: [], discards: [], melds: [], balance: INITIAL_BALANCE, hasLocation: true },
    ];
    setPlayers(initialPlayers);
    setPot(0);
    setActivePlayer(0);
    setDrawnTile(null);
    setSelectedTileIndex(null);
    setIsAiControlled(false);
    
    if (SIMULATION_ENABLED) {
        // Reset mock data for simulation
        initialPlayers.forEach(p => {
            p.balance = INITIAL_BALANCE;
            p.hand = [];
            p.discards = [];
            p.melds = [];
        });
    }

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: true } : p));
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: false } : p));
                    toast({
                        variant: 'destructive',
                        title: '定位失败 (Location Failed)',
                        description: '无法获取您的地理位置，请检查浏览器权限设置。(Could not get location. Please check browser permissions.)',
                    });
                }
            );
        } else {
            setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: false } : p));
        }
    };
    requestLocation();
  }, [toast]);
  

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleRollDice = () => {
    setGameState('rolling');
    const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    setDice(newDice);

    // Stake tokens
    const playersWithStake = players.map(p => ({...p, balance: p.balance - STAKE_AMOUNT}));
    setPlayers(playersWithStake);
    setPot(players.length * STAKE_AMOUNT);
    
    setTimeout(() => {
        const total = newDice[0] + newDice[1];
        const newBankerId = (total - 1) % 4;
        setBankerId(newBankerId);
        
        const wallCopy = [...wall];
        
        // Use a temporary copy for dealing to avoid state update issues in the loop
        const tempPlayers = JSON.parse(JSON.stringify(playersWithStake));

        // Deal 13 tiles to each player
        for (let i = 0; i < 13; i++) {
            for (const player of tempPlayers) {
                const tile = wallCopy.pop();
                if (tile) player.hand.push(tile);
            }
        }
        
        // Banker draws one extra tile
        const bankerTile = wallCopy.pop();
        if (bankerTile) tempPlayers[newBankerId].hand.push(bankerTile);

        setPlayers(tempPlayers);
        setWall(wallCopy);
        setActivePlayer(newBankerId);

        // Transition to next state
        if (newBankerId === 0) { // If human is the banker
            setGameState('banker-roll-for-golden');
        } else {
            // Simulate AI rolling for golden tile
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
        const goldenIndex = Math.min(total * 2, wallCopy.length - 1);
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

  const handleSelectOrDiscardTile = (tileIndex: number) => {
    if (activePlayer !== 0 || !drawnTile || isAiControlled) return;

    if (selectedTileIndex === tileIndex) {
      // This is the second click, so discard the tile
      handleDiscardTile(0, tileIndex);
    } else {
      // This is the first click, just select the tile
      setSelectedTileIndex(tileIndex);
    }
  };
  
  const handleWin = () => {
      const winner = players.find(p => p.id === activePlayer);
      if (!winner) return;

      // In a real game, the win amount would be calculated based on the hand's value.
      // For simplicity, we'll assume the win amount makes one opponent lose all chips.
      const opponent = players.find(p => p.id !== activePlayer);
      if(!opponent) return;

      handleEndGame(winner, opponent.balance);
  }

  const handleAction = (action: 'pong' | 'kong' | 'chow' | 'skip') => {
    setCanPerformAction(false); // Hide buttons after action
    toast({
        title: `执行操作 (${action})`,
        description: `您选择了 ${action}。`,
    });
    // Placeholder for actual game logic (e.g., forming a meld)
    
    // After action, it's this player's turn to discard. For now, we just pass to next player for simulation flow.
    const nextPlayerIndex = (activePlayer + 1) % players.length;
    setActivePlayer(nextPlayerIndex);
  };

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play();
    }
  }, [audioSrc]);

  const humanPlayer = players.find(p => p.id === 0);
  const isBankerAndHuman = bankerId === 0;
  
  const roomTierMap: Record<string, string> = {
    Novice: "新手场",
    Adept: "进阶场",
    Expert: "高手场",
    Master: "大师场",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold font-headline text-primary">{`${roomTierMap[roomTier]} (${roomTier} Room)`}</h1>
           <div className="flex items-center gap-2 text-xl font-bold text-primary border-2 border-primary/50 bg-primary/10 px-3 py-1 rounded-lg">
                <Trophy />
                <span>奖池 (Pot): {pot} $JIN</span>
            </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline"><BookOpen/> 玩法说明 (Rules)</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>闽南游金麻将 (Minnan Golden Mahjong Rules)</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="text-left max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground">核心特点 (Core Feature)</h3>
                                <p>开局后随机指定一张牌为“金牌”（Wild Tile），该牌可以当做任意一张牌来使用。</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>开金 (Reveal Golden Tile)：</strong>庄家再次掷骰子，根据点数从牌墙的何处翻开一张牌作为“金”。</li>
                                    <li><strong>作用 (Function)：</strong>金牌可以用来替代任何你需要的牌来组成顺子、刻子或将牌。</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">计分规则 (Scoring)</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                     <li><strong>普通胡牌 (Standard Win)：</strong>赢家获得奖池内所有押金。输家均分损失。</li>
                                     <li><strong>自摸 (Self-Drawn Win)：</strong>自摸胡牌的赢家，奖金翻倍。</li>
                                     <li><strong>游金 (Golden Tour Win)：</strong>使用“金牌”作为胡牌的关键张时，称为“游金”。根据打出金牌的时机获得额外翻倍奖励。本次模拟中，自摸胡牌即视为游金成功。</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">公平性保证 (Fairness Guarantee)</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>洗牌哈希 (Shuffle Hash)：</strong>游戏开始前，系统会对一副完整的、排序好的麻将牌进行加密哈希计算，并立即显示该哈希值。这意味着牌墙在发牌前就已完全确定，无法被篡改。</li>
                                    <li><strong>掷骰子 (Dice Roll)：</strong>所有的掷骰子操作均在服务器端完成，保证结果的随机性。</li>
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold text-foreground">游金规则详解 (Golden Tour Rules)</h3>
                                <p>当玩家以“金牌”作为胡牌的关键张时，称为“游金”，并根据打出金牌的时机获得额外翻倍奖励。</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>一游 (Single Tour)：</strong>在胡牌时，将一张金牌作为普通牌打出。如果成功胡牌，则总分翻2倍。</li>
                                    <li><strong>双游 (Double Tour)：</strong>在“一游”的基础上，再次摸牌时恰好胡牌，此时再次打出一张金牌并声明胡牌。如果成功，则总分翻4倍。</li>
                                    <li><strong>三游 (Triple Tour)：</strong>极为罕见。在“双游”成功后，若摸牌后仍未胡牌，则再次打出一张金牌。若最终成功胡牌，则总分翻8倍。</li>
                                </ul>
                            </div>
                        </div>
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
        
        {humanPlayer?.hasLocation === false && (
            <Alert variant="destructive">
                <AlertTitle>需要定位权限 (Location Permission Required)</AlertTitle>
                <AlertDescription>
                    为了保证游戏公平性，我们需要获取您的地理位置。请在浏览器设置中允许定位权限。
                </AlertDescription>
            </Alert>
        )}


        <Card>
          <CardContent className="p-2 md:p-4">
            <GameBoard 
                players={players} 
                activePlayerId={activePlayer}
                wallCount={wall.length}
                dice={dice}
                gameState={gameState}
                bankerId={bankerId}
                turnTimer={turnTimer}
                turnDuration={TURN_DURATION}
                goldenTile={goldenTile}
             />
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">您的区域 (Your Area)</h2>
                </div>
                 <div className="flex items-center gap-4 flex-wrap justify-center">
                    <div className="flex items-center space-x-2">
                        <Switch id="ai-control" checked={isAiControlled} onCheckedChange={setIsAiControlled} />
                        <Label htmlFor="ai-control" className="flex items-center gap-1">
                            {isAiControlled ? <Loader2 className="animate-spin" /> : <Bot />}
                            AI托管
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="sound-mute" checked={!isMuted} onCheckedChange={() => setIsMuted(!isMuted)} />
                        <Label htmlFor="sound-mute" className="flex items-center gap-1">{isMuted ? <VolumeX/> : <Volume2/> } 语音播报</Label>
                    </div>
                    {gameState === 'pre-roll' && <Button onClick={handleRollDice}><Dices className="mr-2"/> 掷骰子开局 (Roll Dice)</Button>}
                    {gameState === 'banker-roll-for-golden' && isBankerAndHuman && <Button onClick={handleRollForGolden}><Crown className="mr-2 text-yellow-400"/> 掷骰开金 (Roll for Wild)</Button>}
                    {gameState === 'playing' && activePlayer === 0 && !drawnTile && (
                      <Button onClick={handleDrawTile}>
                          <Hand className="mr-2 h-4 w-4" />
                          摸牌 (Draw Tile)
                      </Button>
                    )}
                    {gameState === 'playing' && activePlayer === 0 && drawnTile && (
                        <Button onClick={handleWin} variant="destructive">
                            <Trophy className="mr-2 h-4 w-4 text-yellow-300"/>
                            自摸胡牌 (Win)
                        </Button>
                    )}
                 </div>
            </div>
            
            <div className="relative p-4 bg-background/50 rounded-lg min-h-[12rem] flex items-center justify-center">
                
                {/* Hand Area (Center) */}
                <PlayerHand 
                    hand={humanPlayer?.hand || []} 
                    onTileClick={handleSelectOrDiscardTile}
                    canInteract={!!drawnTile && activePlayer === 0 && !isAiControlled}
                    goldenTile={goldenTile}
                    selectedTileIndex={selectedTileIndex}
                />

                {canPerformAction && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 rounded-lg z-20">
                        <Button onClick={() => handleAction('chow')} size="lg">吃 (Chow)</Button>
                        <Button onClick={() => handleAction('pong')} size="lg">碰 (Pong)</Button>
                        <Button onClick={() => handleAction('kong')} size="lg">杠 (Kong)</Button>
                        <Button onClick={() => handleAction('skip')} size="lg" variant="secondary">跳过 (Skip)</Button>
                    </div>
                )}
            </div>

        </div>
        <div className="text-xs text-muted-foreground break-all">
            <strong>Shuffle Hash (确保公平):</strong> {shuffleHash}
        </div>
      </div>
      <div className="lg:col-span-1">
        <AiTutor />
      </div>

       <AlertDialog open={gameState === 'game-over'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-400" />
                对局结束 (Game Over)
            </AlertDialogTitle>
            <AlertDialogDescription>
              对局结算详情如下：
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-3 text-sm">
            {roundResult?.winners.map(({ player, netWin }) => (
                <div key={player.id} className="flex justify-between items-center">
                    <span className="font-semibold">{player.name}</span>
                    <div className="flex items-center gap-2 text-green-400">
                        <Plus size={16}/>
                        <span>{netWin.toFixed(2)} $JIN</span>
                    </div>
                </div>
            ))}
             {roundResult?.losers.map(({ player, netLoss }) => (
                <div key={player.id} className="flex justify-between items-center">
                    <span className="font-semibold">{player.name}</span>
                    <div className="flex items-center gap-2 text-red-400">
                        <Minus size={16}/>
                         <span>{netLoss.toFixed(2)} $JIN from Pot</span>
                    </div>
                </div>
            ))}
            <Separator />
            {roundResult?.biggestWinner && (
                 <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>大赢家台费 (Biggest Winner Fee)</span>
                    <div className="flex items-center gap-2">
                        <Minus size={12}/>
                        <span>{roundResult.tableFee.toFixed(2)} $JIN (to Burn Pool)</span>
                    </div>
                </div>
            )}
             <div className="flex justify-between items-center font-bold text-base pt-2 border-t">
                    <span>总奖池 (Total Pot)</span>
                    <span>{pot} $JIN</span>
                </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={initializeGame}>
                <Shuffle className="mr-2"/>
                继续匹配 (Continue Matching)
            </AlertDialogAction>
             <AlertDialogCancel asChild>
                <Link href="/">返回大厅 (Back to Lobby)</Link>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function GamePage() {
    return (
        <Suspense fallback={<div>Loading room...</div>}>
            <GameRoom />
        </Suspense>
    )
}
