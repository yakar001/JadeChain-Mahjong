
'use client';
import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Bot, Loader2, Minus, Plus, Eye, RotateCw, Menu } from 'lucide-react';
import Link from 'next/link';
import { AiTutor } from '@/components/game/ai-tutor';
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

// 定义牌的类型
type Tile = { suit: string; value: string };
type Discard = { tile: Tile; playerId: number };
type Meld = { type: 'pong' | 'kong' | 'chow'; tiles: Tile[], concealed?: boolean };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], melds: Meld[]; balance: number; hasLocation: boolean | null; isEast?: boolean; discards: Tile[]};
type DiceRoll = [number, number];
type GameState = 'pre-roll-seating' | 'rolling-seating' | 'pre-roll-banker' | 'rolling-banker' | 'pre-roll' | 'rolling' | 'deal' | 'banker-roll-for-golden' | 'playing' | 'game-over';
type Action = 'pong' | 'kong' | 'chow' | 'win';
type ActionPossibility = {
    playerId: number;
    actions: {
        win: boolean;
        pong: boolean;
        kong: boolean;
        chow: boolean;
    }
}

type RoundResult = {
    winners: Array<{ player: Player; netWin: number }>;
    losers: Array<{ player: Player; netLoss: number }>;
    biggestWinner: Player | null;
    tableFee: number;
    leaver?: Player;
    finalHands: Player[];
} | null;

// 初始牌的数据
const suits = ['dots', 'bamboo', 'characters'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const honors = ['E', 'S', 'W', 'N', 'R', 'G', 'B']; // East, South, West, North, Red, Green, White
const INITIAL_BALANCE = 100;
const TURN_DURATION = 60; // 60 seconds per turn
const ACTION_DURATION = 5; // 5 seconds to decide on an action

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

// SIMULATED WINNING HAND CHECK WITH GOLDEN TILE (WILD CARD)
// This is a simplified check. It checks for the basic "4 melds and 1 pair" structure.
const isWinningHand = (hand: Tile[], goldenTile: Tile | null): boolean => {
    if (hand.length % 3 !== 2) return false;

    const tileToKey = (tile: Tile) => `${tile.suit}-${tile.value}`;
    const goldenTileKey = goldenTile ? tileToKey(goldenTile) : null;
    
    let goldenTileCount = 0;
    const counts: Record<string, number> = {};
    for (const tile of hand) {
        const key = tileToKey(tile);
        if (key === goldenTileKey) {
            goldenTileCount++;
        } else {
            counts[key] = (counts[key] || 0) + 1;
        }
    }

    // Recursive function to check for melds
    function canFormMelds(currentCounts: Record<string, number>, wilds: number): boolean {
        let isEmpty = true;
        for (const key in currentCounts) {
            if (currentCounts[key] > 0) {
                isEmpty = false;
                break;
            }
        }
        if (isEmpty) return true;

        const firstTileKey = Object.keys(currentCounts).find(k => currentCounts[k] > 0);
        if (!firstTileKey) return true;
        
        const [suit, value] = firstTileKey.split('-');

        // Try to form a triplet (Pong)
        if (currentCounts[firstTileKey] >= 3) {
            const nextCounts = { ...currentCounts };
            nextCounts[firstTileKey] -= 3;
            if (canFormMelds(nextCounts, wilds)) return true;
        }
        if (currentCounts[firstTileKey] === 2 && wilds >= 1) {
             const nextCounts = { ...currentCounts };
            nextCounts[firstTileKey] -= 2;
            if (canFormMelds(nextCounts, wilds - 1)) return true;
        }
        if (currentCounts[firstTileKey] === 1 && wilds >= 2) {
             const nextCounts = { ...currentCounts };
            nextCounts[firstTileKey] -= 1;
            if (canFormMelds(nextCounts, wilds - 2)) return true;
        }
        if (wilds >= 3) { // Triplet of wilds
            if(canFormMelds({...currentCounts}, wilds-3)) return true;
        }

        // Try to form a sequence (Chow)
        if (!['wind', 'dragon'].includes(suit)) {
            const v = parseInt(value, 10);
            if (v <= 7) {
                const key2 = `${suit}-${v + 1}`;
                const key3 = `${suit}-${v + 2}`;
                
                const c1 = currentCounts[firstTileKey] || 0;
                const c2 = currentCounts[key2] || 0;
                const c3 = currentCounts[key3] || 0;

                // Case 1: All 3 tiles present
                if (c1 > 0 && c2 > 0 && c3 > 0) {
                    const nextCounts = { ...currentCounts };
                    nextCounts[firstTileKey]--;
                    nextCounts[key2]--;
                    nextCounts[key3]--;
                    if (canFormMelds(nextCounts, wilds)) return true;
                }
                // Case 2: Two tiles + 1 wild
                if (wilds >= 1) {
                    if(c1 > 0 && c2 > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[firstTileKey]--;
                        nextCounts[key2]--;
                         if (canFormMelds(nextCounts, wilds-1)) return true;
                    }
                     if(c1 > 0 && c3 > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[firstTileKey]--;
                        nextCounts[key3]--;
                         if (canFormMelds(nextCounts, wilds-1)) return true;
                    }
                     if(c2 > 0 && c3 > 0) {
                        const nextCounts = { ...currentCounts };
                        nextCounts[key2]--;
                        nextCounts[key3]--;
                         if (canFormMelds(nextCounts, wilds-1)) return true;
                    }
                }
                // Case 3: One tile + 2 wilds
                if(wilds >= 2) {
                    if(c1 > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[firstTileKey]--;
                         if (canFormMelds(nextCounts, wilds - 2)) return true;
                    }
                     if(c2 > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[key2]--;
                         if (canFormMelds(nextCounts, wilds - 2)) return true;
                    }
                     if(c3 > 0) {
                         const nextCounts = { ...currentCounts };
                         nextCounts[key3]--;
                         if (canFormMelds(nextCounts, wilds - 2)) return true;
                    }
                }
            }
        }

        return false;
    }

    // Iterate through all possible pairs
    for (const pairKey in counts) {
        if (counts[pairKey] >= 2) {
            const countsWithoutPair = { ...counts };
            countsWithoutPair[pairKey] -= 2;
            if (canFormMelds(countsWithoutPair, goldenTileCount)) {
                return true;
            }
        }
        if (counts[pairKey] >= 1 && goldenTileCount >= 1) {
             const countsWithoutPair = { ...counts };
             countsWithoutPair[pairKey] -= 1;
             if(canFormMelds(countsWithoutPair, goldenTileCount - 1)) {
                 return true;
             }
        }
    }
     if (goldenTileCount >= 2) {
        if(canFormMelds({...counts}, goldenTileCount - 2)) return true;
    }

    return false;
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
  const [isLandscape, setIsLandscape] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [humanPlayerCanDiscard, setHumanPlayerCanDiscard] = useState(false);
  const [concealedKongCandidate, setConcealedKongCandidate] = useState<Tile | null>(null);

  const playSound = useCallback(async (text: string) => {
    if (isMuted) return;
    try {
        const response = await getSpeech(text);
        if(response.media) {
            setAudioSrc(response.media);
        }
    } catch (error) {
        console.error(`Error playing sound for "${text}":`, error);
    }
  }, [isMuted]);

  const clearTimer = (timerToClearRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timerToClearRef.current) {
        clearInterval(timerToClearRef.current);
        timerToClearRef.current = null;
    }
  }
    
  // Function to end the game and calculate results
  const handleEndGame = useCallback((finalPlayers: Player[]) => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
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
    
    setGameState('game-over');
    
  }, [pot, STAKE_AMOUNT]);

  const getNextPlayerId = useCallback((currentPlayerId: number) => {
      const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
      if (currentPlayerIndex === -1 || players.length === 0) return null;
      return players[(currentPlayerIndex + 1) % players.length].id;
  }, [players]);

  const handleWin = useCallback((winnerId?: number) => {
    const id = winnerId !== undefined ? winnerId : activePlayer;
    if (id === null) return;

    const winner = players.find(p => p.id === id);
    if (!winner) return;
    
    const handToCheck = latestDiscard && winnerId !== activePlayer 
        ? [...winner.hand, latestDiscard.tile] 
        : winner.hand;
    
    if (!isWinningHand(handToCheck, goldenTile)) {
         toast({
            variant: "destructive",
            title: "诈胡! (False Win!)",
            description: "您的手牌未满足胡牌条件。(Your hand does not meet the winning criteria.)",
        });
        return; 
    }

    playSound("胡牌");

    toast({
        title: `${winner.name} 胡牌了！ (Win!)`,
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
    
    const canPerformAction = actionPossibilities.some(p => p.playerId === playerId);
    
    if (!canPerformAction && action !== 'skip' && action !== 'kong') {
         toast({
            variant: "destructive",
            title: "无效操作 (Invalid Action)",
            description: `您的手牌不满足'${action}'的条件。`,
        });
        const lastDiscarderId = latestDiscard?.playerId;
        setActionPossibilities([]); 
        if (lastDiscarderId !== undefined) {
             const nextPlayerId = getNextPlayerId(lastDiscarderId);
             if (nextPlayerId !== null) {
                setActivePlayer(nextPlayerId);
             }
        }
        return;
    }

    if (latestDiscard === null && action !== 'kong') return;
    const lastDiscarderId = latestDiscard?.playerId;

    setActionPossibilities([]); 

    if (action === 'skip') {
        const nextPlayerId = lastDiscarderId !== undefined ? getNextPlayerId(lastDiscarderId) : null;
        if (nextPlayerId !== null) {
            setActivePlayer(nextPlayerId);
        }
        return;
    }

    if (action === 'win') {
        handleWin(playerId);
        return;
    }
    
    const actionPlayer = players.find(p => p.id === playerId);
    if (!actionPlayer) return;
    
    // Concealed Kong (An Kang)
    if (action === 'kong' && concealedKongCandidate) {
        playSound('杠');
        toast({ title: `执行操作 (杠)`, description: `您选择了暗杠。` });
        
        setPlayers(currentPlayers => {
            const updatedPlayers = [...currentPlayers];
            const playerToUpdate = updatedPlayers.find(p => p.id === playerId);
            if(playerToUpdate) {
                const tilesToMeld = playerToUpdate.hand.filter(t => t.suit === concealedKongCandidate.suit && t.value === concealedKongCandidate.value);
                playerToUpdate.hand = playerToUpdate.hand.filter(t => t.suit !== concealedKongCandidate.suit || t.value !== concealedKongCandidate.value);
                playerToUpdate.melds.push({ type: 'kong', tiles: tilesToMeld, concealed: true });
            }
            return updatedPlayers;
        });

        setConcealedKongCandidate(null);
        setActivePlayer(playerId);
        // Player must draw a tile from the end of the wall after a kong, then discard.
        // For simplicity, we'll let them draw on their next turn. This is a slight deviation.
        if (playerId === 0) {
            setHumanPlayerCanDiscard(true); // Player must discard after kong
        }
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
            }
            else if (action === 'chow') {
                 const v = parseInt(lastDiscardTile.value);
                 const tile1 = playerToUpdate.hand.find(t => t.suit === lastDiscardTile.suit && parseInt(t.value) === v - 1);
                 const tile2 = playerToUpdate.hand.find(t => t.suit === lastDiscardTile.suit && parseInt(t.value) === v + 1);
                 if (tile1 && tile2) tilesToRemoveFromHand = [tile1, tile2];
            }
            
            meldTiles.push(...tilesToRemoveFromHand);
            playerToUpdate.hand = playerToUpdate.hand.filter(tile => !tilesToRemoveFromHand.some(removed => removed.suit === tile.suit && removed.value === tile.value));
            playerToUpdate.melds.push({ type: action as 'pong' | 'kong' | 'chow', tiles: meldTiles, concealed: false });
        }
        return updatedPlayers;
    });

    setLatestDiscard(null); // The discard has been claimed
    setActivePlayer(playerId);
    if (playerId === 0) {
        setHumanPlayerCanDiscard(true);
    }
  }, [latestDiscard, getNextPlayerId, handleWin, playSound, toast, players, concealedKongCandidate, actionPossibilities]);


  const handleDiscardTile = useCallback(async (playerId: number, tileIndex: number) => {
     if (activePlayer !== playerId) return;
     if (playerId === 0 && !humanPlayerCanDiscard) return;

    setPlayers(currentPlayers => {
        let player: Player | undefined;
        let tileToDiscard: Tile;
        const updatedPlayers = currentPlayers.map(p => {
             if (p.id === playerId) {
                player = p;
                if (!player || tileIndex < 0 || tileIndex >= player.hand.length) {
                    console.error("Invalid discard attempt", {playerId, tileIndex, playerHand: player?.hand});
                    if (player && player.hand.length > 0) {
                        tileIndex = player.hand.length - 1;
                    } else {
                        return p;
                    }
                }
                const newHand = [...p.hand];
                [tileToDiscard] = newHand.splice(tileIndex, 1);
                return { ...p, hand: newHand, discards: [...p.discards, tileToDiscard] };
             }
             return p;
        });

        if (!player || !tileToDiscard) return currentPlayers;

        setLatestDiscard({ tile: tileToDiscard, playerId: playerId });
        
        setSelectedTileIndex(null);
        
        if (playerId === 0) {
            setHumanPlayerCanDiscard(false);
            setConcealedKongCandidate(null);
        }
        clearTimer(timerRef);

        const tileName = getTileName(tileToDiscard);
        playSound(tileName);
        
        setTimeout(() => {
            const potentialActions: ActionPossibility[] = [];
            updatedPlayers.forEach(p => {
                if (p.id !== playerId) {
                    const isNextPlayer = p.id === getNextPlayerId(playerId);
                    const tileCountInHand = p.hand.filter(t => t.suit === tileToDiscard.suit && t.value === tileToDiscard.value).length;
                    
                    const playerHasGolden = p.hand.some(t => t.suit === goldenTile?.suit && t.value === goldenTile?.value);

                    const canWin = !playerHasGolden && isWinningHand([...p.hand, tileToDiscard], goldenTile);
                    const canPong = tileCountInHand >= 2;
                    const canKong = tileCountInHand >= 3;

                    let canChow = false;
                    if (isNextPlayer && !['wind', 'dragon'].includes(tileToDiscard.suit)) {
                        const v = parseInt(tileToDiscard.value);
                        const hasNum = (val: number) => p.hand.some(t => t.suit === tileToDiscard.suit && parseInt(t.value) === val);
                        if ((hasNum(v-2) && hasNum(v-1)) || (hasNum(v-1) && hasNum(v+1)) || (hasNum(v+1) && hasNum(v+2))) {
                            canChow = true;
                        }
                    }

                    if (canWin || canPong || canKong || canChow) {
                        potentialActions.push({ playerId: p.id, actions: { win: canWin, pong: canPong, kong: canKong, chow: canChow } });
                    }
                }
            });

            const winActions = potentialActions.filter(p => p.actions.win);
            const pongKongActions = potentialActions.filter(p => p.actions.pong || p.actions.kong);
            const chowActions = potentialActions.filter(p => p.actions.chow);

            if (winActions.length > 0) {
                setActionPossibilities(winActions);
            } else if (pongKongActions.length > 0) {
                setActionPossibilities(pongKongActions);
            } else if (chowActions.length > 0) {
                setActionPossibilities(chowActions);
            } else {
                setActionPossibilities([]);
                const nextPlayerId = getNextPlayerId(playerId);
                if (nextPlayerId !== null) {
                    setActivePlayer(nextPlayerId);
                }
            }
        }, 500);

        return updatedPlayers;
    });
  }, [playSound, getNextPlayerId, goldenTile, activePlayer, humanPlayerCanDiscard]);

  const runGameFlow = useCallback(async () => {
    if (gameState !== 'playing' || activePlayer === null || actionPossibilities.length > 0) {
      return;
    }
    
    const currentPlayer = players.find(p => p.id === activePlayer);
    if (!currentPlayer) return;

    // AI Action on another's discard
    const aiActionTaker = actionPossibilities.find(p => players.find(pl => pl.id === p.playerId)?.isAI);
    if (aiActionTaker) {
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
    if (currentPlayer.isAI) {
        await new Promise(res => setTimeout(res, Math.random() * 1000 + 1000));
        
        // Banker starts with 14 tiles, so they discard directly.
        if (currentPlayer.hand.length % 3 === 2) {
            const discardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
            handleDiscardTile(activePlayer, discardIndex);
            return;
        }

        const wallCopy = [...wall];
        if (wallCopy.length <= 14) { // End game if wall is nearly empty
            handleEndGame(players);
            return;
        }

        const drawnTileFromWall = wallCopy.pop()!;
        setWall(wallCopy);
        
        const updatedHand = [...currentPlayer.hand, drawnTileFromWall];
        
        if (isWinningHand(updatedHand, goldenTile)) {
            handleWin(currentPlayer.id);
            return;
        }

        setPlayers(prevPlayers => prevPlayers.map(p => p.id === activePlayer ? { ...p, hand: updatedHand } : p));
        
        await new Promise(res => setTimeout(res, 500));
        
        const discardIndex = Math.floor(Math.random() * updatedHand.length);
        handleDiscardTile(activePlayer, discardIndex);

    } else { // Human player's turn
        if (currentPlayer.hand.length % 3 !== 2) {
             setHumanPlayerCanDiscard(false); // Can't discard, must draw
        } else {
             setHumanPlayerCanDiscard(true); // Can discard
        }
    }
  }, [gameState, activePlayer, players, actionPossibilities, wall, handleDiscardTile, handleEndGame, handleWin, goldenTile, handleAction]);

  useEffect(() => {
    if (actionPossibilities.length > 0) return;
    runGameFlow();
  }, [activePlayer, actionPossibilities, runGameFlow]);

  useEffect(() => {
    const runGameSetupFlow = async () => {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      const isOurTurn = (playerId: number | null) => players.find(p => p.id === playerId)?.isAI;
      switch (gameState) {
        case 'pre-roll-seating':
          await delay(1000);
          handleRollForSeating();
          break;
        case 'pre-roll-banker':
          if (isOurTurn(eastPlayerId)) {
            await delay(1500);
            handleRollForBanker();
          }
          break;
        case 'pre-roll':
          if (isOurTurn(bankerId)) {
            await delay(1500);
            handleRollDice();
          }
          break;
        case 'banker-roll-for-golden':
           if (isOurTurn(bankerId)) {
            await delay(1500);
            handleRollForGolden();
          }
          break;
      }
    };
    runGameSetupFlow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, eastPlayerId, bankerId, players]);

  useEffect(() => {
    if (gameState === 'playing' && activePlayer !== null) {
      setTurnTimer(TURN_DURATION); 
      clearTimer(timerRef);
      timerRef.current = setInterval(() => {
        setTurnTimer(prev => prev - 1);
      }, 1000);

      return () => clearTimer(timerRef);
    }
  }, [gameState, activePlayer]);

  useEffect(() => {
      const humanPlayerAction = actionPossibilities.find(p => p.playerId === 0);
      if (humanPlayerAction) {
          setActionTimer(ACTION_DURATION);
          clearTimer(actionTimerRef);
          actionTimerRef.current = setInterval(() => {
              setActionTimer(prev => prev - 1);
          }, 1000);
          return () => clearTimer(actionTimerRef);
      } else {
          clearTimer(actionTimerRef);
      }
  }, [actionPossibilities]);

  useEffect(() => {
     if (turnTimer <= 0 && activePlayer !== null) {
        const currentPlayer = players.find(p => p.id === activePlayer);
        if (!currentPlayer) return;

        if (activePlayer === 0 && humanPlayerCanDiscard) {
            toast({ title: "时间到 (Time's Up!)", description: "系统已为您开启AI托管并打出最右边的牌。(AI activated and discarded rightmost tile.)" });
            setIsAiControlled(true);
            handleDiscardTile(0, players[0].hand.length - 1);
        }
    }
     if (actionTimer <= 0 && actionPossibilities.some(p => p.playerId === 0)) {
        handleAction('skip', 0);
    }
  }, [turnTimer, actionTimer, isAiControlled, actionPossibilities, activePlayer, players, handleDiscardTile, toast, humanPlayerCanDiscard, handleAction]);

  const initializeGame = useCallback(() => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
    setGameState('pre-roll-seating');
    setRoundResult(null);
    setSeatingRolls([]);
    setActionPossibilities([]);
    setHumanPlayerCanDiscard(false);
    setLatestDiscard(null);
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
    
    if(roomTier === 'Free' && initialPlayers.length < 4) {
      const aiPlayersNeeded = 4 - initialPlayers.length;
      for(let i=1; i<=aiPlayersNeeded; i++) {
        initialPlayers.push({
          id: i,
          name: `AI 玩家 ${i}`,
          avatar: `https://placehold.co/40x40.png`,
          isAI: true,
          hand: [],
          melds: [],
          balance: INITIAL_BALANCE,
          hasLocation: Math.random() > 0.5,
          discards: [],
        })
      }
    } else if (initialPlayers.length < 4) {
       const playersNeeded = 4 - initialPlayers.length;
       for(let i=1; i<=playersNeeded; i++) {
        initialPlayers.push({
          id: i,
          name: `玩家 ${i+1}`,
          avatar: `https://placehold.co/40x40.png`,
          isAI: false,
          hand: [],
          melds: [],
          balance: INITIAL_BALANCE,
          hasLocation: Math.random() > 0.5,
          discards: [],
        })
      }
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
  }, [roomTier]);
  

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

        const windNames = ['(东)', '(南)', '(西)', '(北)'];
        
        if (playerRolls.length === 0) {
            console.error("Attempted to roll for seating with no players.");
            return; // Guard against empty player array
        }
        
        const newEastPlayer = playerRolls[0].player;
        setEastPlayerId(newEastPlayer.id);

        const finalPlayers = players.map(p => {
            const rollInfo = playerRolls.find(pr => pr.player.id === p.id);
            const windIndex = playerRolls.indexOf(rollInfo!);
            const windName = windNames[windIndex];
            const baseName = p.name.split(' ')[0].replace('(电脑)','').trim();
            const newName = p.isAI ? `${baseName} (电脑) ${windName}` : `${baseName} ${windName}`;
            return { ...p, name: newName, isEast: p.id === newEastPlayer.id };
        });

        setPlayers(finalPlayers);
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
        const bankerIndex = tempPlayers.findIndex((p: Player) => p.id === bankerId);
        const dealStartPlayerIndex = (bankerIndex + diceTotal - 1) % tempPlayers.length;

        for (let i = 0; i < 13; i++) {
            for (let j = 0; j < tempPlayers.length; j++) {
                 const playerArrayIndex = (dealStartPlayerIndex + j) % tempPlayers.length;
                 const tile = wallCopy.pop();
                 if(tile) tempPlayers[playerArrayIndex].hand.push(tile);
            }
        }
        
        const bankerTile = wallCopy.pop();
        if (bankerTile) tempPlayers[bankerIndex].hand.push(bankerTile);

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

  const handleDrawTile = () => {
    if (wall.length > 14 && activePlayer === 0 && !humanPlayerCanDiscard) {
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
    }
  };

  const handleSelectOrDiscardTile = (tileIndex: number) => {
    if (activePlayer !== 0 || !humanPlayerCanDiscard || isAiControlled) return;

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
  const humanPlayerHasGolden = humanPlayer?.hand.some(t => t.suit === goldenTile?.suit && t.value === goldenTile?.value);
  const humanPlayerAction = actionPossibilities.find(p => p.playerId === 0);
  
  const roomTierMap: Record<string, string> = {
    Free: "免费体验娱乐场",
    Novice: "新手场",
    Adept: "进阶场",
    Expert: "高手场",
    Master: "大师场",
  };

  const isGameInProgress = gameState === 'deal' || gameState === 'playing' || gameState === 'banker-roll-for-golden';
  
  return (
    <div className={cn("game-container", isLandscape && "landscape", "bg-gray-800 text-white min-h-screen")}>
      <div className={cn("relative p-4")}>
        <div className={cn("grid gap-6", !isLandscape && "lg:grid-cols-4")}>
            <div className={cn("space-y-6", !isLandscape && "lg:col-span-3")}>
                <div className={cn("flex flex-wrap justify-between items-center gap-4")}>
                    <h1 className="text-2xl font-bold font-headline text-primary">{`${roomTierMap[roomTier]} (${roomTier} Room)`}</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline"><Menu /> 菜单 (Menu)</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => setIsLandscape(!isLandscape)}>
                                <RotateCw className="mr-2" /> {isLandscape ? '切换竖屏' : '切换横屏'}
                            </DropdownMenuItem>
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem><BookOpen className="mr-2"/> 玩法说明</DropdownMenuItem>
                            </AlertDialogTrigger>
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem><Shuffle className="mr-2"/> 新对局</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem><Undo2 className="mr-2"/> 返回大厅</DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className={cn("relative", isLandscape && "h-[calc(100vh-8rem)] flex items-center justify-center")}>
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
                        seatingRolls={seatingRolls}
                        onRollForSeating={handleRollForSeating}
                        onRollForBanker={handleRollForBanker}
                        onRollForStart={handleRollDice}
                        onRollForGolden={handleRollForGolden}
                        eastPlayerId={eastPlayerId}
                        isLandscape={isLandscape}
                        latestDiscard={latestDiscard}
                    />
                </div>

                <div className={cn(isLandscape && "hidden")}>
                    <Separator />
                    <div className="space-y-4 mt-6">
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
                                {gameState === 'playing' && activePlayer === 0 && !humanPlayerCanDiscard && !humanPlayerAction && (
                                <Button onClick={handleDrawTile}>
                                    <Hand className="mr-2 h-4 w-4" />
                                    摸牌 (Draw Tile)
                                </Button>
                                )}
                                {gameState === 'playing' && activePlayer === 0 && humanPlayerCanDiscard && (
                                    <>
                                     {concealedKongCandidate && <Button onClick={() => handleAction('kong', 0)} variant="default">暗杠 (Kong)</Button>}
                                     <Button onClick={() => handleWin()} variant="destructive" disabled={!isWinningHand(humanPlayer?.hand || [], goldenTile)}>
                                        <ThumbsUp className="mr-2 h-4 w-4"/>
                                        自摸胡牌 (Win)
                                     </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="relative p-4 bg-background/50 rounded-lg min-h-[12rem] flex items-end justify-center">
                             {humanPlayerAction && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-background/80 p-2 rounded-lg backdrop-blur-sm">
                                    <div className='flex items-center gap-2'>
                                        <Progress value={(actionTimer / ACTION_DURATION) * 100} className="absolute -top-2 left-0 right-0 w-full h-1 [&>div]:bg-yellow-400" />
                                        {humanPlayerAction.actions.win && <Button onClick={() => handleAction('win', 0)} size="sm" variant="destructive" className="w-16 h-10" disabled={humanPlayerHasGolden}>胡</Button>}
                                        {humanPlayerAction.actions.kong && <Button onClick={() => handleAction('kong', 0)} size="sm" className="w-16 h-10">杠</Button>}
                                        {humanPlayerAction.actions.pong && <Button onClick={() => handleAction('pong', 0)} size="sm" className="w-16 h-10">碰</Button>}
                                        {humanPlayerAction.actions.chow && <Button onClick={() => handleAction('chow', 0)} size="sm" className="w-16 h-10">吃</Button>}
                                        <Button onClick={() => handleAction('skip', 0)} size="sm" variant="secondary" className="w-16 h-10">过 ({actionTimer}s)</Button>
                                    </div>
                                    {humanPlayerHasGolden && humanPlayerAction.actions.win && <p className="text-xs text-yellow-400 text-center mt-1">持金只能自摸，不可胡牌</p>}
                                </div>
                            )}
                            <PlayerHand 
                                hand={humanPlayer?.hand || []} 
                                onTileClick={handleSelectOrDiscardTile}
                                canInteract={humanPlayerCanDiscard && activePlayer === 0 && !isAiControlled}
                                goldenTile={goldenTile}
                                selectedTileIndex={selectedTileIndex}
                            />
                        </div>

                    </div>
                    <div className="text-xs text-muted-foreground break-all mt-4">
                        <strong>Shuffle Hash (确保公平):</strong> {shuffleHash}
                    </div>
                </div>

            </div>
            <div className={cn("lg:col-span-1", isLandscape && "hidden")}>
                <AiTutor />
            </div>
      </div>

       <AlertDialog>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>闽南游金麻将 (Minnan Golden Mahjong Rules)</AlertDialogTitle>
            <AlertDialogDescription>
                <div className="text-left max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                    <div>
                        <h3 className="font-semibold text-foreground">核心特点 (Core Feature)</h3>
                        <p>开局后随机指定一张牌为“金牌”（Wild Tile），该牌可以当做任意一张牌来使用。</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">游戏玩法 (Gameplay)</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>吃 (Chow):</strong> 只能吃您**上家**（左边的玩家）打出的牌来组成顺子。</li>
                            <li><strong>碰 (Pong):</strong> 可以碰**任何一家**打出的牌来组成刻子（三张相同的牌）。</li>
                            <li><strong>杠 (Kong):</strong> 可以杠**任何一家**打出的牌来组成杠子（四张相同的牌）。</li>
                            <li><strong>优先级 (Priority):</strong> 胡牌 &gt; 碰/杠 &gt; 吃。如果多个玩家可以对同一张牌执行操作，高优先级的操作会覆盖低优先级的。</li>
                            <li><strong>胡牌提示 (Winning Prompt)：</strong>当您摸牌或有玩家弃牌后，如果您的手牌已满足胡牌条件，系统会自动出现“胡牌”按钮。</li>
                            <li><strong>持金限制 (Golden Tile Restriction):</strong> 当您手中有“金牌”时，您只能通过**自摸**胡牌，不能胡别人打出的牌，但仍可以吃、碰、杠。</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">计分规则 (Scoring)</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>普通胡牌 (Standard Win)：</strong>赢家获得奖池内所有押金。输家均分损失。</li>
                            <li><strong>自摸 (Self-Drawn Win)：</strong>自摸胡牌的赢家，奖金翻倍。</li>
                            <li><strong>游金 (Golden Tour Win)：</strong>当您听牌且手持金牌时，若自摸了一张能胡的牌，您可以选择不胡，而是打出另一张牌进入“游金”状态。在此状态下，您之后摸到的**任何牌**都能胡，奖励翻倍（一游）。</li>
                            <li><strong>双游 (Double Tour Win)：</strong>在“一游”状态下，如果您摸到了真正的金牌并选择打出，则进入“双游”状态，奖励在“一游”基础上再次翻倍。</li>
                        </ul>
                    </div>
                </div>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction> <ThumbsUp className="mr-2"/> 明白了 (Got it)</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>开始新对局吗？ (Start a New Game?)</AlertDialogTitle>
            <AlertDialogDescription>
                {isGameInProgress ? `当前对局仍在进行中。如果现在开始新对局，您将输掉本局的入场费 ${STAKE_AMOUNT} $JIN。` : '您确定要开始一个新对局吗？'}
                {isGameInProgress ? `(The current game is still in progress. If you start a new game now, you will forfeit your entry fee of ${STAKE_AMOUNT} $JIN for this round.)` : '(Are you sure you want to start a new game?)'}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>取消 (Cancel)</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleLeaveGame(true)} className={isGameInProgress ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                确认 (Confirm)
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>

        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>确认退出吗？ (Confirm Exit?)</AlertDialogTitle>
            <AlertDialogDescription>
                {isGameInProgress ? `当前对局仍在进行中。如果现在退出，您将输掉本局的入场费 ${STAKE_AMOUNT} $JIN，并会分配给其他玩家。` : '您确定要返回大厅吗？'}
                {isGameInProgress ? `(The current game is still in progress. If you exit now, you will forfeit your entry fee of ${STAKE_AMOUNT} $JIN, which will be distributed to the other players.)` : '(Are you sure you want to return to the lobby?)'}
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
              对局结算详情如下：
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
