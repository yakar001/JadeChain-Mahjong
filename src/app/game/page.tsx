
'use client';
import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Bot, Loader2, Minus, Plus, Eye, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import crypto from 'crypto';
import { getSpeech } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { MahjongTile } from '@/components/game/mahjong-tile';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Coins, MapPin, AlertTriangle, Layers } from 'lucide-react';
import { DraggableBox } from '@/components/game/draggable-box';


// 定义牌的类型
type Tile = { suit: string; value: string };
type Discard = { tile: Tile; playerId: number };
type Meld = { type: 'pong' | 'kong' | 'chow'; tiles: Tile[], concealed?: boolean };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], melds: Meld[]; balance: number; hasLocation: boolean | null; isEast?: boolean; discards: Tile[]};
type DiceRoll = [number, number];
type GameState = 'pre-roll-seating' | 'rolling-seating' | 'pre-roll-banker' | 'rolling-banker' | 'pre-roll' | 'rolling' | 'deal' | 'banker-roll-for-golden' | 'playing' | 'game-over';
type Action = 'pong' | 'kong' | 'chow' | 'win';
export type ActionPossibility = {
    playerId: number;
    actions: {
        win: boolean;
        pong: boolean;
        kong: boolean;
        chow: boolean;
    }
}
type FanCalculation = {
    winner: Player;
    isSelfDrawn: boolean;
    isGoldenUsedInWin: boolean;
    totalFan: number;
    breakdown: { item: string; fan: number }[];
};

type WinningHandStructure = {
    melds: Tile[][];
    pair: Tile[];
}

type RoundResult = {
    winners: Array<{ player: Player; netWin: number }>;
    losers: Array<{ player: Player; netLoss: number }>;
    biggestWinner: Player | null;
    tableFee: number;
    leaver?: Player;
    isDraw?: boolean;
    finalHands: (Player & { winningHand?: WinningHandStructure, winningTile?: Tile })[];
    fanCalculation?: FanCalculation;
} | null;


export type LayoutConfig = {
    [key: string]: {
        width: number;
        height: number;
        scale: number;
    }
};

const INITIAL_LAYOUT_CONFIG: LayoutConfig = {
    playerInfo: { width: 160, height: 60, scale: 1 },
    discardArea: { width: 200, height: 100, scale: 1 },
    meldsArea: { width: 200, height: 50, scale: 1 },
    goldenTile: { width: 80, height: 100, scale: 1 },
    wallCounter: { width: 120, height: 80, scale: 1 },
}


// 初始牌的数据
const suits = ['dots', 'bamboo', 'characters'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const honors = ['E', 'S', 'W', 'N', 'R', 'G', 'B']; // East, South, West, North, Red, Green, White
const INITIAL_BALANCE = 100;
const TURN_DURATION = 60; // 60 seconds per turn
const ACTION_DURATION = 15; // 15 seconds to decide on an action
const MIN_WALL_TILES_FOR_DRAW = 9;

// A correct deck has 136 tiles (4 of each).
const createDeck = (): Tile[] => {
  const deck: Tile[] = [];

  // Add 4 copies of each numbered tile (Dots, Bamboo, Characters)
  // 3 suits * 9 values * 4 copies = 108 tiles
  for (const suit of suits) {
    for (const value of values) {
      for (let i = 0; i < 4; i++) {
        deck.push({ suit, value });
      }
    }
  }

  // Add 4 copies of each honor tile (Winds and Dragons)
  // 7 honors * 4 copies = 28 tiles
  for (const honor of honors) {
    const suit = ['E', 'S', 'W', 'N'].includes(honor) ? 'wind' : 'dragon';
    for (let i = 0; i < 4; i++) {
      deck.push({ suit, value: honor });
    }
  }

  return deck; // Total: 108 + 28 = 136 tiles
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
    if (tile.suit === 'bamboo') return `${tile.value}条`;
    if (tile.suit === 'characters') return `${tile.value}万`;
    const honorMap: Record<string, string> = { 'E': '东风', 'S': '南风', 'W': '西风', 'N': '北风', 'R': '红中', 'G': '发财', 'B': '白板' };
    return honorMap[tile.value] || '';
}

const isWinningHand = (hand: Tile[], goldenTile: Tile | null): boolean => {
    if (hand.length % 3 !== 2) return false;

    const tileToKey = (t: Tile) => `${t.suit}-${t.value}`;
    const keyToTile = (k: string) => {
        const [suit, value] = k.split('-');
        return { suit, value };
    };

    const goldenTileKey = goldenTile ? tileToKey(goldenTile) : null;

    let goldenTileCount = 0;
    const counts: Record<string, number> = {};
    hand.forEach(tile => {
        const key = tileToKey(tile);
        if (key === goldenTileKey) {
            goldenTileCount++;
        } else {
            counts[key] = (counts[key] || 0) + 1;
        }
    });

    const sortedKeys = Object.keys(counts).sort((a, b) => {
        const [suitA, valueA] = a.split('-');
        const [suitB, valueB] = b.split('-');
        const suitOrder = ['dots', 'bamboo', 'characters', 'wind', 'dragon'];
        if (suitOrder.indexOf(suitA) !== suitOrder.indexOf(suitB)) {
            return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
        }
        const numA = parseInt(valueA, 10);
        const numB = parseInt(valueB, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    });

    function canFormMelds(currentCounts: Record<string, number>, wilds: number): boolean {
        let empty = true;
        for (const key in currentCounts) {
            if (currentCounts[key] > 0) {
                empty = false;
                break;
            }
        }
        if (empty) return true;

        const firstKey = sortedKeys.find(k => currentCounts[k] > 0)!;

        // Try to form a PONG (triplet)
        if (currentCounts[firstKey] >= 3) {
            const nextCounts = { ...currentCounts };
            nextCounts[firstKey] -= 3;
            if (canFormMelds(nextCounts, wilds)) return true;
        }
        if (currentCounts[firstKey] >= 2 && wilds >= 1) {
             const nextCounts = { ...currentCounts };
            nextCounts[firstKey] -= 2;
            if (canFormMelds(nextCounts, wilds - 1)) return true;
        }
        if (currentCounts[firstKey] >= 1 && wilds >= 2) {
             const nextCounts = { ...currentCounts };
            nextCounts[firstKey] -= 1;
            if (canFormMelds(nextCounts, wilds - 2)) return true;
        }


        // Try to form a CHOW (sequence)
        const tile = keyToTile(firstKey);
        if (['dots', 'bamboo', 'characters'].includes(tile.suit)) {
            const v = parseInt(tile.value);
            if (v <= 7) {
                const key2 = tileToKey({ suit: tile.suit, value: (v + 1).toString() });
                const key3 = tileToKey({ suit: tile.suit, value: (v + 2).toString() });
                
                // Normal Chow
                if (currentCounts[firstKey] > 0 && currentCounts[key2] > 0 && currentCounts[key3] > 0) {
                    const nextCounts = { ...currentCounts };
                    nextCounts[firstKey] -= 1;
                    nextCounts[key2] -= 1;
                    nextCounts[key3] -= 1;
                    if (canFormMelds(nextCounts, wilds)) return true;
                }
                if (wilds >= 1) {
                     // Chow with 1 wild
                    if (currentCounts[firstKey] > 0 && currentCounts[key2] > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[firstKey] -= 1;
                         nextCounts[key2] -= 1;
                         if (canFormMelds(nextCounts, wilds - 1)) return true;
                    }
                    if (currentCounts[firstKey] > 0 && currentCounts[key3] > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[firstKey] -= 1;
                         nextCounts[key3] -= 1;
                         if (canFormMelds(nextCounts, wilds - 1)) return true;
                    }
                     if (currentCounts[key2] > 0 && currentCounts[key3] > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[key2] -= 1;
                         nextCounts[key3] -= 1;
                         if (canFormMelds(nextCounts, wilds - 1)) return true;
                    }
                }
                 if (wilds >= 2) {
                     // Chow with 2 wilds
                     if (currentCounts[firstKey] > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[firstKey] -= 1;
                        if (canFormMelds(nextCounts, wilds - 2)) return true;
                     }
                      if (currentCounts[key2] > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[key2] -= 1;
                        if (canFormMelds(nextCounts, wilds - 2)) return true;
                     }
                      if (currentCounts[key3] > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[key3] -= 1;
                        if (canFormMelds(nextCounts, wilds - 2)) return true;
                     }
                }
            }
        }
        
        return false;
    }

    // Iterate through all possible pairs
    for (const pairKey of [...sortedKeys, goldenTileKey]) {
       if (!pairKey) continue;
       
       const tempCounts = {...counts};
       let tempWilds = goldenTileCount;

       // Form the pair
       if (pairKey === goldenTileKey) { // Pair of wilds
           if(tempWilds < 2) continue;
           tempWilds -= 2;
       } else if (tempCounts[pairKey] >= 2) { // Normal pair
           tempCounts[pairKey] -= 2;
       } else if (tempCounts[pairKey] >= 1 && tempWilds >= 1) { // Pair with one wild
            tempCounts[pairKey] -= 1;
            tempWilds -= 1;
       } else {
           continue; // Cannot form this pair
       }

       if (canFormMelds(tempCounts, tempWilds)) return true;
    }

    return false;
};

const findBestDiscard = (hand: Tile[], goldenTile: Tile | null): number => {
    // 1. Never discard the golden tile unless it's for a win.
    const tileToKey = (t: Tile) => `${t.suit}-${t.value}`;
    const goldenTileKey = goldenTile ? tileToKey(goldenTile) : null;
    if (hand.every(t => tileToKey(t) === goldenTileKey)) return hand.length - 1;

    // Simulate discarding each tile and find the one that results in the "best" hand
    let bestDiscardIndex = -1;
    let highestScore = -Infinity;

    for (let i = 0; i < hand.length; i++) {
        const tile = hand[i];
        if (tileToKey(tile) === goldenTileKey) continue;

        const tempHand = [...hand];
        tempHand.splice(i, 1);

        // Simple scoring: count pairs and potential sequences
        let score = 0;
        const counts: Record<string, number> = {};
        tempHand.forEach(t => {
            const key = tileToKey(t);
            counts[key] = (counts[key] || 0) + 1;
        });

        for (const key in counts) {
            if (counts[key] >= 2) score += counts[key] * 2; // Pairs/Pongs are good

            const t = key.split('-').reduce((acc, part, i) => ({...acc, [i === 0 ? 'suit' : 'value']: part}), {}) as Tile;

            if (!['wind', 'dragon'].includes(t.suit)) {
                const v = parseInt(t.value, 10);
                const has = (val: number) => tempHand.some(th => th.suit === t.suit && parseInt(th.value, 10) === val);
                if (has(v - 1)) score += 1.5; // Potential sequence
                if (has(v + 1)) score += 1.5; // Potential sequence
                if (has(v - 2)) score += 0.5; // Wider potential sequence
                if (has(v + 2)) score += 0.5;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestDiscardIndex = i;
        }
    }

    if (bestDiscardIndex !== -1) {
        return bestDiscardIndex;
    }
    
    // Fallback: discard lone winds/dragons, then terminals, then others
    const findIndexToDiscard = (filterFn: (tile: Tile) => boolean) => {
        return hand.findIndex(t => tileToKey(t) !== goldenTileKey && filterFn(t));
    };

    const isHonor = (t: Tile) => ['wind', 'dragon'].includes(t.suit);
    const isTerminal = (t: Tile) => t.value === '1' || t.value === '9';

    bestDiscardIndex = findIndexToDiscard(t => isHonor(t));
    if (bestDiscardIndex !== -1) return bestDiscardIndex;

    bestDiscardIndex = findIndexToDiscard(t => isTerminal(t));
    if (bestDiscardIndex !== -1) return bestDiscardIndex;

    // If all else fails, find the first non-golden tile
    bestDiscardIndex = hand.findIndex(t => tileToKey(t) !== goldenTileKey);
    return bestDiscardIndex !== -1 ? bestDiscardIndex : hand.length - 1;
};


function GameRoom() {
  const searchParams = useSearchParams();
  const roomTier = searchParams.get('tier') || 'Novice';
  const roomFee = parseInt(searchParams.get('fee') || '10', 10);
  const { toast } = useToast();
  
  const [STAKE_AMOUNT] = useState(roomFee);
  const [gameState, setGameState] = useState<GameState>('pre-roll-seating');
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [latestDiscard, setLatestDiscard] = useState<Discard | null>(null);
  const [goldenTile, setGoldenTile] = useState<Tile | null>(null);
  const [activePlayer, setActivePlayer] = useState<number | null>(null); 
  const [dice, setDice] = useState<DiceRoll>([1, 1]);
  const [seatingRolls, setSeatingRolls] = useState<(DiceRoll | null)[]>([]);
  const [bankerId, setBankerId] = useState<number | null>(null);
  const [eastPlayerId, setEastPlayerId] = useState<number | null>(null);
  const [shuffleHash, setShuffleHash] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isAiControlled, setIsAiControlled] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [pot, setPot] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [turnTimer, setTurnTimer] = useState(TURN_DURATION);
  const [actionPossibilities, setActionPossibilities] = useState<ActionPossibility[]>([]);
  const [actionTimer, setActionTimer] = useState(ACTION_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [humanPlayerCanDiscard, setHumanPlayerCanDiscard] = useState(false);
  const [concealedKongCandidate, setConcealedKongCandidate] = useState<Tile | null>(null);
  const [audioCache, setAudioCache] = useState(new Map<string, string>());
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(INITIAL_LAYOUT_CONFIG);

  const handleLayoutChange = (component: keyof LayoutConfig, property: 'width' | 'height' | 'scale', value: number) => {
      setLayoutConfig(prev => ({
          ...prev,
          [component]: {
              ...prev[component],
              [property]: value
          }
      }))
  }

  const playSound = useCallback(async (text: string) => {
    if (isMuted) return;
    if (audioCache.has(text)) {
        setAudioSrc(audioCache.get(text)!);
        return;
    }
    try {
        const response = await getSpeech(text);
        if(response.media) {
            setAudioCache(prevCache => new Map(prevCache).set(text, response.media));
            setAudioSrc(response.media);
        }
    } catch (error) {
        console.error(`Error playing sound for "${text}":`, error);
    }
  }, [isMuted, audioCache]);

  const clearTimer = (timerToClearRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timerToClearRef.current) {
        clearInterval(timerToClearRef.current);
        timerToClearRef.current = null;
    }
  }
    
  // Function to end the game and calculate results
  const handleEndGame = useCallback((finalPlayers: Player[], isDraw: boolean = false) => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
    
    if (isDraw) {
      playSound("流局");
       toast({
          title: '流局 (Draw Game)',
          description: '牌墙已打完，本局平局。(The wall is empty. This round is a draw.)',
      });
      setRoundResult({
          winners: [],
          losers: [],
          biggestWinner: null,
          tableFee: 0,
          isDraw: true,
          finalHands: finalPlayers,
      });

    } else {
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
            finalHands: finalPlayers
        });
    }
    
    setGameState('game-over');
    
  }, [pot, STAKE_AMOUNT, playSound, toast]);

  const getNextPlayerId = useCallback((currentPlayerId: number) => {
    const playerPositions = ['东', '南', '西', '北'];
    const playerSeatMap = new Map<string, number>();
    players.forEach(p => {
        const windMatch = p.name.match(/\(([^)]+)\)/);
        if(windMatch) {
            playerSeatMap.set(windMatch[1], p.id);
        }
    });

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return null;
    
    const currentWindMatch = currentPlayer.name.match(/\(([^)]+)\)/);
    if (!currentWindMatch) return null;
    const currentWind = currentWindMatch[1];
    
    const currentIndex = playerPositions.indexOf(currentWind);
    if (currentIndex === -1) return null;
    
    const nextWind = playerPositions[(currentIndex + 1) % playerPositions.length];
    
    return playerSeatMap.get(nextWind) ?? null;
}, [players]);


  const advanceTurn = useCallback((lastPlayerId: number) => {
      const nextPlayerId = getNextPlayerId(lastPlayerId);
      if (nextPlayerId !== null) {
          setActivePlayer(nextPlayerId);
          setIsProcessingTurn(false);
      }
  }, [getNextPlayerId]);

  const handleWin = useCallback((winnerId?: number) => {
    setIsProcessingTurn(true);
    const id = winnerId !== undefined ? winnerId : activePlayer;
    if (id === null) {
        setIsProcessingTurn(false);
        return;
    }

    const winner = players.find(p => p.id === id);
    if (!winner) {
        setIsProcessingTurn(false);
        return;
    }
    
    const isSelfDrawn = winnerId === undefined || winnerId === activePlayer;
    const handToCheck = !isSelfDrawn && latestDiscard 
        ? [...winner.hand, latestDiscard.tile] 
        : winner.hand;
    
    if (!isWinningHand(handToCheck, goldenTile)) {
         toast({
            variant: "destructive",
            title: "诈胡! (False Win!)",
            description: `${winner.name} 的手牌未满足胡牌条件。(Player ${winner.name}'s hand does not meet the winning criteria.)`,
        });
        setIsProcessingTurn(false);
        return; 
    }

    playSound(isSelfDrawn ? "自摸" : "胡牌");

    toast({
        title: `${winner.name} ${isSelfDrawn ? '自摸' : ''}胡牌了！ (Win!)`,
        description: `恭喜玩家 ${winner.name} 获得胜利！`,
    });

    const winAmount = pot;

    const losingPlayers = players.filter(p => p.id !== id);
    const lossAmount = winAmount / losingPlayers.length;

    // Calculate final balances
    const finalPlayers = players.map(p => {
        if (p.id === id) {
            return { ...p, balance: p.balance + winAmount };
        }
        return { ...p, balance: p.balance - lossAmount };
    });
    
    handleEndGame(finalPlayers);

  }, [players, activePlayer, pot, handleEndGame, toast, playSound, goldenTile, latestDiscard]);

  const initializeGame = useCallback(() => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
    setGameState('pre-roll-seating');
    setRoundResult(null);
    setSeatingRolls([]);
    setActionPossibilities([]);
    setHumanPlayerCanDiscard(false);
    setLatestDiscard(null);
    setIsProcessingTurn(false);

    const newDeck = createDeck();
    
    const deckString = JSON.stringify(newDeck.sort((a,b) => (a.suit+a.value).localeCompare(b.suit+b.value)));
    const seed = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(deckString + seed).digest('hex');
    setShuffleHash(hash);
    
    const shuffled = shuffleDeck(newDeck);
    
    setWall(shuffled);
    setGoldenTile(null);
    
    const humanPlayer: Player = { id: 0, name: 'You', avatar: `https://placehold.co/40x40.png`, isAI: false, hand: [], melds: [], balance: INITIAL_BALANCE, hasLocation: null, discards: [] };
    const initialPlayers: Player[] = [humanPlayer];

    for (let i = 1; i <= 3; i++) {
        const isAI = true;
        const name = `AI 玩家 ${i}`;
        initialPlayers.push({
            id: i,
            name: name,
            avatar: `https://placehold.co/40x40.png`,
            isAI: isAI,
            hand: [],
            melds: [],
            balance: INITIAL_BALANCE,
            hasLocation: Math.random() > 0.5,
            discards: [],
        });
    }
    
    setPlayers(initialPlayers);
    setPot(0);
    setActivePlayer(null);
    setBankerId(null);
    setEastPlayerId(null);
    setSelectedTileIndex(null);
    setIsAiControlled(false);

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: true } : p)),
                () => setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: false } : p))
            );
        } else {
            setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: false } : p));
        }
    };
    requestLocation();
  }, []);

  const handleLeaveGame = (andStartNew = false) => {
    const leaver = players.find(p => p.id === 0);
    const isGameInProgress = gameState === 'deal' || gameState === 'playing' || gameState === 'banker-roll-for-golden';
    
    if (!leaver || !isGameInProgress) {
      if (andStartNew) {
        initializeGame();
      }
      return;
    }

    const remainingPlayers = players.filter(p => p.id !== 0);
    const penalty = STAKE_AMOUNT; // The stake amount is forfeited
    const share = penalty / remainingPlayers.length;

    const winners = remainingPlayers.map(p => ({
        player: p,
        netWin: share,
    }));
    
    if (andStartNew) {
      toast({
        variant: 'destructive',
        title: '您已退出当前对局 (You Left the Game)',
        description: `您输掉了入场费 ${STAKE_AMOUNT} $JIN。正在开始新对局...`,
      });
      setTimeout(initializeGame, 1500);
    } else {
      setRoundResult({
          winners,
          losers: [{ player: leaver, netLoss: penalty }],
          biggestWinner: null,
          tableFee: 0,
          leaver,
          finalHands: players,
      });
      setGameState('game-over');
    }
  };
  
  const handleAction = useCallback(async (action: Action | 'skip', playerId: number) => {
    clearTimer(actionTimerRef);
    setIsProcessingTurn(true);
    
    const canPerformAction = actionPossibilities.some(p => p.playerId === playerId);
    
    const lastDiscarderId = latestDiscard?.playerId;
    // Always clear possibilities after any action is taken or skipped.
    setActionPossibilities([]); 

    if (!canPerformAction && action !== 'skip' && action !== 'kong') {
         toast({
            variant: "destructive",
            title: "无效操作 (Invalid Action)",
            description: `您的手牌不满足'${action}'的条件。`,
        });
        if (lastDiscarderId !== undefined && lastDiscarderId !== null) {
             advanceTurn(lastDiscarderId);
        }
        return;
    }

    if (latestDiscard === null && action !== 'kong') {
        if (lastDiscarderId !== undefined && lastDiscarderId !== null) {
          advanceTurn(lastDiscarderId);
        }
        return;
    }
    
    if (action === 'skip') {
        if (lastDiscarderId !== undefined && lastDiscarderId !== null) {
          advanceTurn(lastDiscarderId);
        }
        return;
    }

    if (action === 'win') {
        handleWin(playerId);
        return;
    }
    
    const actionPlayer = players.find(p => p.id === playerId);
    if (!actionPlayer) {
        if (lastDiscarderId !== undefined && lastDiscarderId !== null) {
             advanceTurn(lastDiscarderId);
        }
        return;
    };
    
    // Concealed Kong (An Kong)
    if (action === 'kong' && concealedKongCandidate) {
        playSound('杠');
        toast({ title: `执行操作 (杠)`, description: `您选择了暗杠。` });

        const wallCopy = [...wall];
        const supplementalTile = wallCopy.shift()!; // Draw from the back of the wall (conventionally opposite end from dealing)
        
        setPlayers(currentPlayers => {
            const updatedPlayers = [...currentPlayers];
            const playerToUpdate = updatedPlayers.find(p => p.id === playerId);
            if(playerToUpdate) {
                const tilesToMeld = playerToUpdate.hand.filter(t => t.suit === concealedKongCandidate.suit && t.value === concealedKongCandidate.value);
                playerToUpdate.hand = playerToUpdate.hand.filter(t => t.suit !== concealedKongCandidate.suit || t.value !== concealedKongCandidate.value);
                playerToUpdate.hand.push(supplementalTile); // Add supplemental tile
                playerToUpdate.melds.push({ type: 'kong', tiles: tilesToMeld, concealed: true });
            }
            return updatedPlayers;
        });

        setWall(wallCopy);
        setConcealedKongCandidate(null);
        setActivePlayer(playerId);
        if (playerId === 0) {
            setHumanPlayerCanDiscard(true);
        }
        setIsProcessingTurn(false);
        return;
    }

    // Exposed actions (Pong, Kong, Chow) from a discard
    const actionSoundMap = { 'pong': '碰', 'kong': '杠', 'chow': '吃' } as const;
    const soundKey = action as keyof typeof actionSoundMap;
    if (actionSoundMap[soundKey]) {
        playSound(actionSoundMap[soundKey]);
    }
    
    toast({
        title: `执行操作 (${action})`,
        description: `您选择了 ${action}。`,
    });

    setPlayers(currentPlayers => {
        const updatedPlayers = [...currentPlayers];
        const playerToUpdate = updatedPlayers.find(p => p.id === playerId);
        const lastDiscardTile = latestDiscard!.tile;

        if(playerToUpdate && lastDiscardTile) {
            let meldTiles: Tile[] = [lastDiscardTile];
            let tilesToRemoveFromHand: Tile[] = [];

            if (action === 'pong') {
                tilesToRemoveFromHand = playerToUpdate.hand.filter(t => t.suit === lastDiscardTile.suit && t.value === lastDiscardTile.value).slice(0, 2);
            } else if (action === 'kong') {
                tilesToRemoveFromHand = playerToUpdate.hand.filter(t => t.suit === lastDiscardTile.suit && t.value === lastDiscardTile.value).slice(0, 3);
            } else if (action === 'chow') {
                const v = parseInt(lastDiscardTile.value);
                const handWithoutGolden = playerToUpdate.hand.filter(t => !(goldenTile && t.suit === goldenTile.suit && t.value === goldenTile.value));
                const findInHand = (val: number) => handWithoutGolden.find(t => t.suit === lastDiscardTile.suit && parseInt(t.value) === val);
                
                // Potential chow combinations
                const combos = [
                    [findInHand(v - 2), findInHand(v - 1)], // e.g., have 3,4 for a 5
                    [findInHand(v - 1), findInHand(v + 1)], // e.g., have 4,6 for a 5
                    [findInHand(v + 1), findInHand(v + 2)], // e.g., have 6,7 for a 5
                ];
                
                const validCombo = combos.find(c => c[0] && c[1]);
                if (validCombo) {
                    tilesToRemoveFromHand = validCombo as Tile[];
                }
            }
            
            meldTiles.push(...tilesToRemoveFromHand);
            playerToUpdate.hand = playerToUpdate.hand.filter(handTile => {
                return !tilesToRemoveFromHand.some(removedTile => removedTile.suit === handTile.suit && removedTile.value === handTile.value);
            });
            playerToUpdate.melds.push({ type: action as 'pong' | 'kong' | 'chow', tiles: meldTiles, concealed: false });
            
            if (action === 'kong') {
                const wallCopy = [...wall];
                if (wallCopy.length > MIN_WALL_TILES_FOR_DRAW) {
                    const supplementalTile = wallCopy.shift()!;
                    setWall(wallCopy);
                    playerToUpdate.hand.push(supplementalTile);
                }
            }
        }
        return updatedPlayers;
    });

    setLatestDiscard(null); // The discard has been claimed
    setActivePlayer(playerId);
    if (playerId === 0) {
        setHumanPlayerCanDiscard(true);
    }
    setIsProcessingTurn(false);
  }, [latestDiscard, handleWin, playSound, toast, players, concealedKongCandidate, actionPossibilities, advanceTurn, wall, goldenTile]);
  
  const handleDrawTile = useCallback(() => {
    if (isProcessingTurn) return;
    if (wall.length <= MIN_WALL_TILES_FOR_DRAW) {
      handleEndGame(players, true); // True for a draw game
      return;
    }
    const humanPlayer = players.find(p => p.id === 0);
    if (activePlayer === 0 && humanPlayer && humanPlayer.hand.length % 3 !== 2) {
      setIsProcessingTurn(true);
      const newWall = [...wall];
      const tile = newWall.pop()!;
      setWall(newWall);
      
      const newHand = [...players.find(p => p.id === 0)!.hand, tile];

      // Check for concealed Kong
      const counts: Record<string, number> = {};
      for(const t of newHand) {
          const key = `${t.suit}-${t.value}`;
          counts[key] = (counts[key] || 0) + 1;
      }
      const kongCandidateKey = Object.keys(counts).find(key => counts[key] === 4);
      if(kongCandidateKey) {
          const [suit, value] = kongCandidateKey.split('-');
          setConcealedKongCandidate({ suit, value });
      } else {
          setConcealedKongCandidate(null);
      }

      setPlayers(currentPlayers => 
        currentPlayers.map(p => p.id === 0 ? { ...p, hand: newHand } : p)
      );

      setHumanPlayerCanDiscard(true);
      setIsProcessingTurn(false);
    }
  }, [wall, activePlayer, players, handleEndGame, isProcessingTurn]);

  const handleDiscardTile = useCallback(async (playerId: number, tileIndex: number) => {
     if (activePlayer !== playerId || isProcessingTurn) return;
     if (playerId === 0 && !humanPlayerCanDiscard) return;

    setIsProcessingTurn(true);

    let tileToDiscard: Tile | null = null;
    
    const player = players.find(p => p.id === playerId);
    if (!player || tileIndex < 0 || tileIndex >= player.hand.length) {
        console.error("Invalid discard attempt", {playerId, tileIndex, playerHand: player?.hand});
        if (player && player.hand.length > 0) {
            tileIndex = player.hand.length - 1; // Default to last tile if index is invalid
        } else {
            setIsProcessingTurn(false);
            return; // No tiles to discard
        }
    }
        
    const newHand = [...player.hand];
    [tileToDiscard] = newHand.splice(tileIndex, 1);

    const updatedPlayers = players.map(p =>
         p.id === playerId ? { ...p, hand: newHand, discards: [...p.discards, tileToDiscard!] } : p
    );
    
    setPlayers(updatedPlayers);
    setLatestDiscard({ tile: tileToDiscard, playerId: playerId });
    setSelectedTileIndex(null);
    
    if (playerId === 0) {
        setHumanPlayerCanDiscard(false);
        setConcealedKongCandidate(null);
    }
    clearTimer(timerRef);

    const tileName = getTileName(tileToDiscard);
    await playSound(tileName);
    
    const potentialActions: ActionPossibility[] = [];
    updatedPlayers.forEach(p => {
        if (p.id !== playerId) {
            const isNextPlayer = p.id === getNextPlayerId(playerId);
            const handWithoutGolden = p.hand.filter(t => !(goldenTile && t.suit === goldenTile.suit && t.value === goldenTile.value));
            const tileCountInHand = handWithoutGolden.filter(t => t.suit === tileToDiscard!.suit && t.value === tileToDiscard!.value).length;
            
            const playerHasGoldenInHand = p.hand.some(t => goldenTile && t.suit === goldenTile.suit && t.value === goldenTile.value);

            const canWin = !playerHasGoldenInHand && isWinningHand([...p.hand, tileToDiscard!], goldenTile);
            const canPong = tileCountInHand >= 2;
            const canKong = tileCountInHand >= 3;

            let canChow = false;
            if (isNextPlayer && !['wind', 'dragon'].includes(tileToDiscard!.suit)) {
                const v = parseInt(tileToDiscard!.value);
                const hasNum = (val: number) => handWithoutGolden.some(t => t.suit === tileToDiscard!.suit && parseInt(t.value) === val);
                if ((hasNum(v-2) && hasNum(v-1)) || (hasNum(v-1) && hasNum(v+1)) || (hasNum(v+1) && hasNum(v+2))) {
                    canChow = true;
                }
            }

            if (canWin || canPong || canKong || canChow) {
                potentialActions.push({ playerId: p.id, actions: { win: canWin, pong: canPong, kong: canKong, chow: canChow } });
            }
        }
    });

    // Action priority: Win > Kong/Pong > Chow
    const winActions = potentialActions.filter(p => p.actions.win);
    const pongKongActions = potentialActions.filter(p => p.actions.pong || p.actions.kong);
    const chowActions = potentialActions.filter(p => p.actions.chow);

    if (winActions.length > 0) {
        setActionPossibilities(winActions);
        setIsProcessingTurn(false); // Release lock to allow players to act
    } else if (pongKongActions.length > 0) {
        setActionPossibilities(pongKongActions);
        setIsProcessingTurn(false);
    } else if (chowActions.length > 0) {
        setActionPossibilities(chowActions);
        setIsProcessingTurn(false);
    } else {
        setActionPossibilities([]);
        advanceTurn(playerId); // This will set isProcessingTurn to false
    }

  }, [playSound, getNextPlayerId, goldenTile, activePlayer, humanPlayerCanDiscard, advanceTurn, players, isProcessingTurn]);

  const runGameFlow = useCallback(async () => {
    if (gameState !== 'playing' || activePlayer === null || isProcessingTurn) return;

    const currentPlayer = players.find(p => p.id === activePlayer);
    if (!currentPlayer) return;

    // AI Action on another's discard
    const aiActionTaker = actionPossibilities.find(p => players.find(pl => pl.id === p.playerId)?.isAI);
    if (aiActionTaker) {
        setIsProcessingTurn(true);
        setTimeout(() => {
            const availableActions: Action[] = [];
            if(aiActionTaker.actions.win) availableActions.push('win');
            if(aiActionTaker.actions.kong) availableActions.push('kong');
            if(aiActionTaker.actions.pong) availableActions.push('pong');
            if(aiActionTaker.actions.chow) availableActions.push('chow');

            if (availableActions.length > 0 && Math.random() > 0.3) { // AI has a 70% chance to act
                handleAction(availableActions[0], aiActionTaker.playerId);
            } else {
                handleAction('skip', aiActionTaker.playerId);
            }
        }, 2500);
        return; 
    }

    // AI's own turn (draw and discard)
    if (currentPlayer.isAI && actionPossibilities.length === 0) {
        setIsProcessingTurn(true);
        await new Promise(res => setTimeout(res, Math.random() * 1000 + 1000));

        // Banker starts with 14 tiles, so they discard directly.
        if (currentPlayer.hand.length % 3 === 2) {
            if (isWinningHand(currentPlayer.hand, goldenTile)) {
                setTimeout(() => handleWin(activePlayer), 500);
            } else {
                const discardIndex = findBestDiscard(currentPlayer.hand, goldenTile);
                await handleDiscardTile(activePlayer, discardIndex);
            }
            return;
        }

        if (wall.length <= MIN_WALL_TILES_FOR_DRAW) {
            handleEndGame(players, true); // True for a draw game
            return;
        }
        
        let wallCopy = [...wall];
        const drawnTileFromWall = wallCopy.pop()!;
        setWall(wallCopy);
        
        setPlayers(prevPlayers => {
            const updatedPlayers = prevPlayers.map(p => 
                p.id === activePlayer ? { ...p, hand: [...p.hand, drawnTileFromWall] } : p
            );
            
            const aiPlayerWithNewTile = updatedPlayers.find(p => p.id === activePlayer)!;

            if (isWinningHand(aiPlayerWithNewTile.hand, goldenTile)) {
                setTimeout(() => handleWin(activePlayer), 500);
            } else {
                setTimeout(() => {
                    const discardIndex = findBestDiscard(aiPlayerWithNewTile.hand, goldenTile);
                    handleDiscardTile(activePlayer, discardIndex);
                }, 500);
            }
            
            return updatedPlayers;
        });

    } else if (activePlayer === 0 && !isAiControlled) { // Human player's turn
        if (currentPlayer.hand.length % 3 !== 2) {
             setHumanPlayerCanDiscard(false); // Can't discard, must draw
        } else {
             setHumanPlayerCanDiscard(true); // Can discard
        }
    } else if (activePlayer === 0 && isAiControlled) { // AI controlled human player
        setIsProcessingTurn(true);
        await new Promise(res => setTimeout(res, Math.random() * 1000 + 1000));
        
        if (currentPlayer.hand.length % 3 !== 2) {
            handleDrawTile(); // This will set humanPlayerCanDiscard to true
            setTimeout(() => {
                const discardIndex = findBestDiscard(currentPlayer.hand, goldenTile);
                handleDiscardTile(0, discardIndex);
            }, 1000)
        } else {
             const discardIndex = findBestDiscard(currentPlayer.hand, goldenTile);
             handleDiscardTile(0, discardIndex);
        }
    }
  }, [gameState, activePlayer, players, actionPossibilities, wall, handleDiscardTile, handleEndGame, handleWin, goldenTile, handleAction, isProcessingTurn, isAiControlled, handleDrawTile]);


  useEffect(() => {
    runGameFlow();
  }, [activePlayer, runGameFlow]);

  useEffect(() => {
    const runGameSetupFlow = async () => {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      const isOurTurn = (playerId: number | null) => players.find(p => p.id === playerId)?.isAI;
      if (gameState === 'pre-roll-seating' && players.length > 0) {
          await delay(1000);
          handleRollForSeating();
      }
      else if (gameState === 'pre-roll-banker') {
          if (isOurTurn(eastPlayerId)) {
            await delay(1500);
            handleRollForBanker();
          }
      }
      else if (gameState === 'pre-roll') {
          if (isOurTurn(bankerId)) {
            await delay(1500);
            handleRollDice();
          }
      }
      else if (gameState === 'banker-roll-for-golden') {
           if (isOurTurn(bankerId)) {
            await delay(1500);
            handleRollForGolden();
          }
      }
    };
    runGameSetupFlow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, eastPlayerId, bankerId, players]);

  useEffect(() => {
    if (gameState === 'playing' && activePlayer !== null && activePlayer === 0 && humanPlayerCanDiscard) {
      setTurnTimer(TURN_DURATION); 
      clearTimer(timerRef);
      timerRef.current = setInterval(() => {
        setTurnTimer(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                clearTimer(timerRef);
                 const currentPlayer = players.find(p => p.id === activePlayer);
                if (currentPlayer && activePlayer === 0 && !isAiControlled) {
                     toast({ title: "时间到 (Time's Up!)", description: "系统已为您开启AI托管并打出最右边的牌。(AI activated and discarded rightmost tile.)" });
                     setIsAiControlled(true);
                }
            }
            return newTime;
        });
      }, 1000);
    } else {
        clearTimer(timerRef);
        setTurnTimer(TURN_DURATION);
    }
     return () => clearTimer(timerRef);
  }, [gameState, activePlayer, humanPlayerCanDiscard, isAiControlled, players, toast]);

  useEffect(() => {
      const humanPlayerAction = actionPossibilities.find(p => p.playerId === 0);
      if (humanPlayerAction) {
          setActionTimer(ACTION_DURATION);
          clearTimer(actionTimerRef);
          actionTimerRef.current = setInterval(() => {
              setActionTimer(prev => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearTimer(actionTimerRef);
                    handleAction('skip', 0);
                }
                return newTime;
              });
          }, 1000);
      } else {
          clearTimer(actionTimerRef);
          setActionTimer(ACTION_DURATION);
      }
      return () => clearTimer(actionTimerRef);
  }, [actionPossibilities, handleAction]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleRollForSeating = () => {
    setGameState('rolling-seating');
    const rolls = players.map(() => [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as DiceRoll);
    setSeatingRolls(rolls);

    setTimeout(() => {
        const playerRolls = players.map((player, index) => ({
            player,
            roll: rolls[index],
            total: rolls[index][0] + rolls[index][1],
        }));

        playerRolls.sort((a, b) => b.total - a.total);
        
        const windAssignments = ['东', '南', '西', '北'];
        const finalPlayers = playerRolls.map((pr, index) => {
            const windName = windAssignments[index];
            const baseName = pr.player.isAI ? pr.player.name.replace(/\s*\([^)]*\)/, '') : 'You';
            const newName = `${baseName} (${windName})`;
            const isEast = windName === '东';
            if (isEast) {
                setEastPlayerId(pr.player.id);
            }
            return { ...pr.player, name: newName, isEast };
        });

        const sortedFinalPlayers = finalPlayers.sort((a, b) => {
            const windA = a.name.match(/\(([^)]+)\)/)?.[1] || '';
            const windB = b.name.match(/\(([^)]+)\)/)?.[1] || '';
            return windAssignments.indexOf(windA) - windAssignments.indexOf(windB);
        });

        setPlayers(sortedFinalPlayers);
        setGameState('pre-roll-banker');
    }, 5500); 
}

  const handleRollForBanker = () => {
     if (eastPlayerId === null) return;
     setGameState('rolling-banker');
     const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as DiceRoll;
     setDice(newDice);
     
     setTimeout(() => {
        const newBanker = players.find(p => p.isEast);
        if (newBanker) {
            setBankerId(newBanker.id);
            setGameState('pre-roll'); 
        }
    }, 5500);
  }


  const handleRollDice = () => {
    if (bankerId === null) return;
    setGameState('rolling');
    const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    setDice(newDice);

    const playersWithStake = players.map(p => ({...p, balance: p.balance - STAKE_AMOUNT}));
    setPlayers(playersWithStake);
    setPot(players.length * STAKE_AMOUNT);
    
    setTimeout(() => {
        const wallCopy = [...wall];
        const tempPlayers = JSON.parse(JSON.stringify(playersWithStake));
        
        const diceTotal = newDice[0] + newDice[1];
        
        const playerSeats = ['东', '南', '西', '北'];
        const seatMap = new Map<number, string>();
        tempPlayers.forEach((p: Player) => {
             const windMatch = p.name.match(/\(([^)]+)\)/);
             if(windMatch) seatMap.set(p.id, windMatch[1]);
        });
        
        const bankerWind = seatMap.get(bankerId);
        if(!bankerWind) return;

        const bankerSeatIndex = playerSeats.indexOf(bankerWind);

        const dealStartSeatIndex = (bankerSeatIndex + diceTotal - 1) % 4;
        const dealStartWind = playerSeats[dealStartSeatIndex];
        const dealStartPlayer = tempPlayers.find((p: Player) => seatMap.get(p.id) === dealStartWind);
        if(!dealStartPlayer) return;
        const dealStartPlayerIndex = tempPlayers.findIndex((p:Player) => p.id === dealStartPlayer.id);

        for (let i = 0; i < 13; i++) {
            for (let j = 0; j < tempPlayers.length; j++) {
                 const playerArrayIndex = (dealStartPlayerIndex + j) % tempPlayers.length;
                 const tile = wallCopy.pop();
                 if(tile) tempPlayers[playerArrayIndex].hand.push(tile);
            }
        }
        
        const bankerPlayerIndex = tempPlayers.findIndex((p: Player) => p.id === bankerId);
        const bankerTile = wallCopy.pop();
        if (bankerTile) tempPlayers[bankerPlayerIndex].hand.push(bankerTile);

        setPlayers(tempPlayers);
        setWall(wallCopy);
        
        setGameState('banker-roll-for-golden');
    }, 5500); 
  }

  const handleRollForGolden = () => {
    setGameState('rolling');
    const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
    setDice(newDice);

    setTimeout(() => {
        const total = newDice[0] + newDice[1];
        const wallCopy = [...wall];
        
        const goldenRevealIndex = wallCopy.length - (total * 2);

        if (goldenRevealIndex >= 0 && goldenRevealIndex < wallCopy.length) {
            const golden = wallCopy.splice(goldenRevealIndex, 1)[0];
            setGoldenTile(golden);
        } else {
            const golden = wallCopy.pop()!;
            setGoldenTile(golden);
        }

        setWall(wallCopy);
        setGameState('playing');
        
        setActivePlayer(bankerId);
        
    }, 5500); 
  }

  const handleSelectOrDiscardTile = (tileIndex: number) => {
    if (activePlayer !== 0 || !humanPlayerCanDiscard || isAiControlled || isProcessingTurn) return;

    if (selectedTileIndex === tileIndex) {
      handleDiscardTile(0, tileIndex);
    } else {
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
  const humanPlayerWind = humanPlayer?.name.match(/\(([^)]+)\)/)?.[1];
  
  const getPlayerByWind = (wind: string) => {
      return players.find(p => p.name.includes(`(${wind})`));
  }
  
  let topPlayer, bottomPlayer, leftPlayer, rightPlayer;
  
  if (humanPlayerWind) {
      const windOrder = ['东', '南', '西', '北'];
      const humanIndex = windOrder.indexOf(humanPlayerWind);
      
      bottomPlayer = humanPlayer;
      rightPlayer = getPlayerByWind(windOrder[(humanIndex + 1) % 4]);
      topPlayer = getPlayerByWind(windOrder[(humanIndex + 2) % 4]);
      leftPlayer = getPlayerByWind(windOrder[(humanIndex + 3) % 4]);
  } else {
      bottomPlayer = players.find(p => p.id === 0);
      rightPlayer = players.find(p => p.id === 1);
      topPlayer = players.find(p => p.id === 2);
      leftPlayer = players.find(p => p.id === 3);
  }

  const humanPlayerHasGolden = humanPlayer?.hand.some(t => goldenTile && t.suit === goldenTile.suit && t.value === goldenTile.value);
  const humanPlayerAction = actionPossibilities.find(p => p.playerId === 0);
  
  const roomTierMap: Record<string, string> = {
    Free: "免费体验娱乐场",
    Novice: "新手场",
    Adept: "进阶场",
    Expert: "高手场",
    Master: "大师场",
  };

  const isGameInProgress = gameState === 'deal' || gameState === 'playing' || gameState === 'banker-roll-for-golden';

  const PlayerInfo = ({ player, action }: { player: Player | undefined, action?: ActionPossibility }) => {
    if (!player) return null;
    const isBanker = bankerId === player.id;
    const actionPossibility = actionPossibilities.find(ap => ap.playerId === player.id);
    const isActive = activePlayer === player.id;

    return (
        <div className={cn(
            'flex items-center gap-2 z-10 p-1.5 bg-background/80 rounded-lg border-2 border-transparent relative transition-all',
            isActive && 'border-primary shadow-lg shadow-primary/30'
            )}>
            <Avatar className='h-8 w-8'>
                <AvatarImage src={player.avatar} />
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='text-left'>
                <div className='flex items-center gap-1'>
                    <p className="font-semibold text-xs whitespace-nowrap">{player.name}</p>
                    {isBanker && <Crown className="w-3 h-3 text-yellow-500" />}
                </div>
                <p className='text-xs text-primary font-mono flex items-center gap-1'><Coins size={12}/> {player.balance}</p>
            </div>
             {actionPossibility && player.isAI && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 bg-background/80 p-1 rounded-lg backdrop-blur-sm">
                    <div className='flex items-center gap-1'>
                        <Progress value={(actionTimer / ACTION_DURATION) * 100} className="absolute -top-1 left-0 right-0 w-full h-0.5 [&>div]:bg-yellow-400" />
                        {actionPossibility.actions.win && <div className="text-destructive font-bold text-xs px-2">胡?</div>}
                        {actionPossibility.actions.kong && <div className="text-primary font-bold text-xs px-2">杠?</div>}
                        {actionPossibility.actions.pong && <div className="text-primary font-bold text-xs px-2">碰?</div>}
                        {actionPossibility.actions.chow && <div className="text-primary font-bold text-xs px-2">吃?</div>}
                    </div>
                </div>
            )}
        </div>
    )
}
  
  return (
    <div className={cn("game-container bg-background text-white min-h-screen flex flex-col")}>
       <div className="flex-none p-2 flex justify-between items-center border-b">
        <h1 className="text-lg font-bold font-headline text-primary">{`${roomTierMap[roomTier]}`}</h1>
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><Menu /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}><BookOpen className="mr-2"/> 玩法说明</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>闽南游金麻将 (Minnan Golden Mahjong Rules)</AlertDialogTitle>
                            <AlertDialogDescription>
                                <div className="text-left max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                                    <p>核心特点：开局后随机指定一张牌为“金牌”（Wild Tile），该牌可以当做任意一张牌来使用。</p>
                                    <p>持金限制：当您手中有“金牌”时，您只能通过**自摸**胡牌，不能胡别人打出的牌。</p>
                                    <p>行动规则：金牌不可用于吃、碰、杠。</p>
                                </div>
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogAction> <ThumbsUp className="mr-2"/> 明白了 (Got it)</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Dialog>
                        <DialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Settings className="mr-2"/> 自定义设置</DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>自定义布局</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                {Object.keys(layoutConfig).map(key => (
                                    <div key={key} className="space-y-2 p-2 border rounded-md">
                                        <p className="font-semibold text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <Label>Width</Label><Slider value={[layoutConfig[key as keyof LayoutConfig].width]} onValueChange={([v]) => handleLayoutChange(key as keyof LayoutConfig, 'width', v)} max={500} step={10}/>
                                            <Label>Height</Label><Slider value={[layoutConfig[key as keyof LayoutConfig].height]} onValueChange={([v]) => handleLayoutChange(key as keyof LayoutConfig, 'height', v)} max={500} step={10}/>
                                            <Label>Scale</Label><Slider value={[layoutConfig[key as keyof LayoutConfig].scale]} onValueChange={([v]) => handleLayoutChange(key as keyof LayoutConfig, 'scale', v)} max={2} step={0.1}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Shuffle className="mr-2"/> 新对局</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>开始新对局吗？ (Start a New Game?)</AlertDialogTitle>
                            <AlertDialogDescription>
                                {isGameInProgress ? `当前对局仍在进行中。如果现在开始新对局，您将输掉本局的入场费 ${STAKE_AMOUNT} $JIN。` : '您确定要开始一个新对局吗？'}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>取消 (Cancel)</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLeaveGame(true)} className={isGameInProgress ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                                确认 (Confirm)
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Undo2 className="mr-2"/> 返回大厅</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>确认退出吗？ (Confirm Exit?)</AlertDialogTitle>
                            <AlertDialogDescription>
                                {isGameInProgress ? `当前对局仍在进行中。如果现在退出，您将输掉本局的入场费 ${STAKE_AMOUNT} $JIN，并会分配给其他玩家。` : '您确定要返回大厅吗？'}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>取消 (Cancel)</AlertDialogCancel>
                            {isGameInProgress ? (
                                <AlertDialogAction onClick={() => handleLeaveGame(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                确认退出 (Confirm Exit)
                                </AlertDialogAction>
                            ) : (
                                <AlertDialogAction asChild>
                                    <Link href="/">确认 (Confirm)</Link>
                                </AlertDialogAction>
                            )}
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
       </div>
      <div className="flex-grow relative bg-gray-800 p-2 flex flex-col">
          <GameBoard 
              players={players} 
              latestDiscard={latestDiscard}
              activePlayerId={activePlayer}
              wallCount={wall.length}
              goldenTile={goldenTile}
          >
            <DraggableBox initialPosition={{ top: 8, left: '50%', transform: 'translateX(-50%)' }}>
                <PlayerInfo player={topPlayer} action={actionPossibilities.find(ap => ap.playerId === topPlayer?.id)} />
            </DraggableBox>
                
            <DraggableBox initialPosition={{ bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
                <div>
                  <PlayerInfo player={bottomPlayer} />
                    <div className="mt-2 flex items-center gap-4 flex-wrap justify-center">
                        <div className="flex items-center space-x-2">
                            <Switch id="ai-control" checked={isAiControlled} onCheckedChange={setIsAiControlled} />
                            <Label htmlFor="ai-control" className="flex items-center gap-1 text-xs text-white">
                                {isAiControlled ? <Loader2 className="animate-spin" /> : <Bot />}
                                AI托管
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="sound-mute" checked={!isMuted} onCheckedChange={() => setIsMuted(!isMuted)} />
                            <Label htmlFor="sound-mute" className="flex items-center gap-1 text-xs text-white">{isMuted ? <VolumeX/> : <Volume2/> } 语音</Label>
                        </div>
                    </div>
                </div>
            </DraggableBox>
            <DraggableBox initialPosition={{ top: '50%', right: 8, transform: 'translateY(-50%)' }}>
                <PlayerInfo player={rightPlayer} action={actionPossibilities.find(ap => ap.playerId === rightPlayer?.id)} />
            </DraggableBox>
            <DraggableBox initialPosition={{ top: '50%', left: 8, transform: 'translateY(-50%)' }}>
                <PlayerInfo player={leftPlayer} action={actionPossibilities.find(ap => ap.playerId === leftPlayer?.id)} />
            </DraggableBox>
          </GameBoard>
      </div>
      <div className="flex-none bg-background p-2 border-t">
        <div className="relative min-h-[10rem] flex items-center justify-center">
            {humanPlayerAction && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-background/80 p-2 rounded-lg backdrop-blur-sm">
                    <div className='flex items-center gap-2'>
                        <Progress value={(actionTimer / ACTION_DURATION) * 100} className="absolute -top-1 left-0 right-0 w-full h-0.5 [&>div]:bg-yellow-400" />
                        {humanPlayerAction.actions.win && <Button onClick={() => handleAction('win', 0)} size="sm" variant="destructive" className="w-16 h-10" disabled={humanPlayerHasGolden}>胡</Button>}
                        {humanPlayerAction.actions.kong && <Button onClick={() => handleAction('kong', 0)} size="sm" className="w-16 h-10">杠</Button>}
                        {humanPlayerAction.actions.pong && <Button onClick={() => handleAction('pong', 0)} size="sm" className="w-16 h-10">碰</Button>}
                        {humanPlayerAction.actions.chow && <Button onClick={() => handleAction('chow', 0)} size="sm" className="w-16 h-10">吃</Button>}
                        <Button onClick={() => handleAction('skip', 0)} size="sm" variant="secondary" className="w-16 h-10">过 ({actionTimer}s)</Button>}
                    </div>
                    {humanPlayerHasGolden && humanPlayerAction.actions.win && <p className="text-xs text-yellow-400 text-center mt-1">持金只能自摸，不可胡牌</p>}
                </div>
            )}
            <div className='flex flex-col items-center gap-1 w-full'>
                <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
                    {gameState === 'playing' && activePlayer === 0 && humanPlayer && humanPlayer.hand.length % 3 !== 2 && !humanPlayerAction && (
                    <Button onClick={handleDrawTile} disabled={isProcessingTurn}>
                        <Hand className="mr-2 h-4 w-4" />
                        摸牌 (Draw Tile)
                    </Button>
                    )}
                    {gameState === 'playing' && activePlayer === 0 && humanPlayerCanDiscard && (
                        <>
                            {concealedKongCandidate && <Button onClick={() => handleAction('kong', 0)} variant="default">暗杠 (Kong)</Button>}
                            {isWinningHand(humanPlayer?.hand || [], goldenTile) && 
                                <Button onClick={() => handleWin()} variant="destructive">
                                    <ThumbsUp className="mr-2 h-4 w-4"/>
                                    自摸胡牌 (Win)
                                </Button>
                            }
                        </>
                    )}
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">手牌区</p>
                <PlayerHand 
                    hand={humanPlayer?.hand || []} 
                    onTileClick={handleSelectOrDiscardTile}
                    canInteract={humanPlayerCanDiscard && activePlayer === 0 && !isAiControlled}
                    goldenTile={goldenTile}
                    selectedTileIndex={selectedTileIndex}
                />
            </div>
        </div>
      </div>


       <AlertDialog open={gameState === 'game-over'}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <ThumbsUp className="text-yellow-400" />
                对局结束 (Game Over)
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roundResult?.leaver ? `${roundResult.leaver.name} 已退出对局。` : ''}
              {roundResult?.isDraw ? `牌墙已打完，本局平局。所有入场费已退还。` : '对局结算详情如下：'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-4 text-sm max-h-[60vh] overflow-y-auto">
             <div>
                <h3 className="font-semibold mb-2 text-base flex items-center gap-2"><Eye /> 玩家手牌 (Player Hands)</h3>
                <div className="space-y-3 rounded-md bg-muted/50 p-3">
                    {roundResult?.finalHands.map(player => (
                        <div key={player.id}>
                            <p className="font-semibold text-foreground mb-1">{player.name}</p>
                            <div className="flex flex-wrap gap-1">
                                {player.hand.map((tile, i) => (
                                    <MahjongTile key={i} suit={tile.suit} value={tile.value as any} size="sm" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

             {!roundResult?.isDraw && (
                 <div>
                    <h3 className="font-semibold mb-2 text-base">输赢结算 (Payouts)</h3>
                    <div className="space-y-3">
                        {roundResult?.winners.map(({ player, netWin }) => (
                            <div key={player.id} className="flex justify-between items-center">
                                <span className="font-semibold">{player.name}</span>
                                <div className="flex items-center gap-2 text-green-400">
                                    <Plus size={16}/>
                                    <span>{netWin.toFixed(2)} $JIN</span>
                                    {roundResult.leaver && <span className="text-xs text-muted-foreground">(from leaver)</span>}
                                </div>
                            </div>
                        ))}
                        {roundResult?.losers.map(({ player, netLoss }) => (
                            <div key={player.id} className="flex justify-between items-center">
                                <span className="font-semibold">{player.name}</span>
                                <div className="flex items-center gap-2 text-red-400">
                                    <Minus size={16}/>
                                    <span>{netLoss.toFixed(2)} $JIN</span>
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
                </div>
             )}
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

    