
'use client';
import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Crown, Trophy, Bot, Loader2, Minus, Plus, Eye, Smartphone, RotateCw } from 'lucide-react';
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

// 定义牌的类型
type Tile = { suit: string; value: string };
type Discard = { tile: Tile; playerId: number };
type Player = { id: number; name: string; avatar: string; isAI: boolean; hand: Tile[], melds: Tile[][]; balance: number; hasLocation: boolean | null; isEast?: boolean; };
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
const TURN_DURATION = 15; // 15 seconds per turn
const ACTION_DURATION = 7; // 7 seconds to decide on an action

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

// SIMULATED WINNING HAND CHECK
// This is a simplified check and does not cover all complex mahjong hands.
// It checks for the basic "4 melds and 1 pair" structure.
const isWinningHand = (hand: Tile[]): boolean => {
    if (hand.length % 3 !== 2) return false; // Must be 14, 11, 8, 5, or 2 tiles

    const tileToKey = (tile: Tile) => `${tile.suit}-${tile.value}`;
    const counts: Record<string, number> = {};
    for (const tile of hand) {
        const key = tileToKey(tile);
        counts[key] = (counts[key] || 0) + 1;
    }

    // Recursive function to check for melds
    function canFormMelds(currentCounts: Record<string, number>): boolean {
        let isEmpty = true;
        for (const key in currentCounts) {
            if (currentCounts[key] > 0) {
                isEmpty = false;
                break;
            }
        }
        if (isEmpty) return true; // All tiles have been formed into melds

        const firstTileKey = Object.keys(currentCounts).find(k => currentCounts[k] > 0);
        if (!firstTileKey) return true;
        
        const [suit, value] = firstTileKey.split('-');

        // Try to form a triplet (Pong)
        if (currentCounts[firstTileKey] >= 3) {
            const nextCounts = { ...currentCounts };
            nextCounts[firstTileKey] -= 3;
            if (canFormMelds(nextCounts)) return true;
        }

        // Try to form a sequence (Chow)
        if (!['wind', 'dragon'].includes(suit)) {
            const v = parseInt(value, 10);
            if (v <= 7) {
                const key2 = `${suit}-${v + 1}`;
                const key3 = `${suit}-${v + 2}`;
                if (currentCounts[key2] > 0 && currentCounts[key3] > 0) {
                    const nextCounts = { ...currentCounts };
                    nextCounts[firstTileKey] -= 1;
                    nextCounts[key2] -= 1;
                    nextCounts[key3] -= 1;
                    if (canFormMelds(nextCounts)) return true;
                }
            }
        }

        return false; // Cannot form a meld with the current first tile
    }

    // Iterate through all possible pairs
    for (const pairKey in counts) {
        if (counts[pairKey] >= 2) {
            const countsWithoutPair = { ...counts };
            countsWithoutPair[pairKey] -= 2;
            if (canFormMelds(countsWithoutPair)) {
                return true; // Found a valid combination of 4 melds and 1 pair
            }
        }
    }

    return false; // No valid winning hand found
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
  const [discards, setDiscards] = useState<Discard[]>([]);
  const [goldenTile, setGoldenTile] = useState<Tile | null>(null);
  const [activePlayer, setActivePlayer] = useState<number | null>(null); 
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);
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

  const handleWin = useCallback((winnerId?: number) => {
    const id = winnerId !== undefined ? winnerId : activePlayer;
    if (id === null) return;

    const winner = players.find(p => p.id === id);
    if (!winner) return;
    
    // STRICT WINNING HAND VALIDATION
    if (!isWinningHand(winner.hand)) {
         toast({
            variant: "destructive",
            title: "诈胡! (False Win!)",
            description: "您的手牌未满足胡牌条件。(Your hand does not meet the winning criteria.)",
        });
        return; // The win is invalid, so we stop here.
    }

    playSound("自摸胡牌");

    toast({
        title: `${winner.name} 胡牌了！ (Win!)`,
        description: `恭喜玩家 ${winner.name} 获得胜利！`,
    });

    // In a real game, the win amount would be calculated based on the hand's value.
    // For simplicity, we'll assume the win amount makes one opponent lose all chips.
    const opponent = players.find(p => p.id !== id && p.balance > 0);
    if(!opponent) { // Game ends if no opponents left
        const finalPlayers = players.map(p => p.id === id ? { ...p, balance: p.balance + STAKE_AMOUNT } : p);
        handleEndGame(finalPlayers);
        return;
    }
    
    const winAmount = opponent.balance > 0 ? opponent.balance : INITIAL_BALANCE;

    const losingPlayers = players.filter(p => p.id !== id);
    const lossAmount = winAmount / losingPlayers.length;

    // Calculate final balances
    const finalPlayers = players.map(p => {
        if (p.id === id) {
            return { ...p, balance: p.balance + winAmount };
        }
        return { ...p, balance: p.balance - lossAmount };
    });

    const hasPlayerLost = finalPlayers.some(p => p.balance <= 0);

    if (hasPlayerLost) {
        handleEndGame(finalPlayers);
    } else {
         toast({
            title: "回合结束 (Hand Over)",
            description: `${winner.name} wins ${winAmount} chips!`,
        });
        // In a real game, this would reset the hand and start a new one.
        // For now, we go to game over to show results.
        handleEndGame(finalPlayers);
    }
  }, [players, activePlayer, STAKE_AMOUNT, handleEndGame, toast, playSound]);

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

  const getNextPlayerId = useCallback((currentPlayerId: number) => {
      const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
      if (currentPlayerIndex === -1 || players.length === 0) return null;
      return players[(currentPlayerIndex + 1) % players.length].id;
  }, [players]);

  const handleDiscardTile = useCallback(async (playerId: number, tileIndex: number) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers.find(p => p.id === playerId);

    if (!player || tileIndex < 0 || tileIndex >= player.hand.length) {
      console.error("Invalid discard attempt", {playerId, tileIndex, playerHand: player?.hand});
      if (player && player.hand.length > 0) {
          tileIndex = player.hand.length - 1;
      } else {
          // Can't discard, maybe end game?
          return;
      }
    }

    const tileToDiscard = player.hand[tileIndex];
    
    player.hand.splice(tileIndex, 1);
    // Sort hand after discard for consistency
    // player.hand.sort(sortTiles); 
    setDiscards(prev => [...prev, { tile: tileToDiscard, playerId: playerId }]);
    setPlayers(updatedPlayers);
    setDrawnTile(null);
    setSelectedTileIndex(null);
    
    if (playerId === 0) {
        setHumanPlayerCanDiscard(false); // Player has discarded, lock hand.
        clearTimer(timerRef);
    }

    const tileName = getTileName(tileToDiscard);
    playSound(tileName);
    
    // Check for actions from other players
    const potentialActions: ActionPossibility[] = [];
    players.forEach(p => {
        if (p.id !== playerId) {
             const isNextPlayer = p.id === getNextPlayerId(playerId);
             
             // SIMULATION: Check if a player can perform an action.
             const canWin = Math.random() < 0.05 && isWinningHand([...p.hand, tileToDiscard]); // 5% chance to win on any discard if hand is valid
             const canPong = Math.random() < 0.2; // 20% chance
             const canKong = Math.random() < 0.1; // 10% chance
             const canChow = isNextPlayer && Math.random() < 0.3; // 30% from next player

             if (canWin || canPong || canKong || canChow) {
                 potentialActions.push({ playerId: p.id, actions: { win: canWin, pong: canPong, kong: canKong, chow: canChow && isNextPlayer } });
             }
        }
    });

    if (potentialActions.length > 0) {
        // Priority: Win > Kong/Pong > Chow
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
             setActivePlayer(getNextPlayerId(playerId));
        }
    } else {
        setActivePlayer(getNextPlayerId(playerId));
    }
    
  }, [players, playSound, getNextPlayerId]);

  const runGameFlow = useCallback(async () => {
    if (gameState !== 'playing') return;

    const currentPlayer = players.find(p => p.id === activePlayer);

    // If there are actions available for any player, pause the game flow.
    if (actionPossibilities.length > 0) {
        // AI action handling
        const aiAction = actionPossibilities.find(p => players.find(pl => pl.id === p.playerId)?.isAI);
        if (aiAction) {
            // Simple AI: always take the highest priority action, or skip with 50% chance
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    if (aiAction.actions.win) handleAction('win', aiAction.playerId);
                    else if (aiAction.actions.kong) handleAction('kong', aiAction.playerId);
                    else if (aiAction.actions.pong) handleAction('pong', aiAction.playerId);
                    else if (aiAction.actions.chow) handleAction('chow', aiAction.playerId);
                    else handleAction('skip', aiAction.playerId);
                } else {
                    handleAction('skip', aiAction.playerId);
                }
            }, 1500); // AI "thinks" for 1.5s
        }
        return; 
    }

    if (currentPlayer && currentPlayer.isAI && activePlayer !== null) {
        await new Promise(res => setTimeout(res, Math.random() * 1000 + 1000)); // Simulate 1-2s thinking

        // Banker starts with 14 tiles, so they discard directly on first turn.
        if (currentPlayer.hand.length % 3 === 2) {
            const discardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
            handleDiscardTile(activePlayer, discardIndex);
            return;
        }

        // Otherwise, draw a tile then discard.
        const wallCopy = [...wall];
        if (wallCopy.length === 0) {
            handleEndGame(players); // Wall is empty, end game in a draw
            return;
        }

        const drawnTileFromWall = wallCopy.pop()!;
        let updatedHand = [...currentPlayer.hand, drawnTileFromWall];
        
        // Check for self-drawn win
        if (isWinningHand(updatedHand)) {
          handleWin(currentPlayer.id);
          return;
        }
        
        setWall(wallCopy);
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === activePlayer ? { ...p, hand: updatedHand } : p));
        
        await new Promise(res => setTimeout(res, 500)); // Pause after drawing
        
        const discardIndex = Math.floor(Math.random() * updatedHand.length);
        // This state update can be tricky, we need to make sure handleDiscardTile has the latest players state
        setPlayers(currentPlayers => {
            handleDiscardTile(activePlayer, discardIndex);
            // handleDiscardTile will set the next player, so we just return the state it will produce
            // This is complex, a better state management might be needed (e.g., useReducer)
            return currentPlayers; 
        });

    } else if (currentPlayer && !currentPlayer.isAI && activePlayer === 0) {
        // It's human player's turn, if they don't have a drawn tile, they must draw.
        if (!drawnTile && currentPlayer.hand.length % 3 !== 2) {
             setHumanPlayerCanDiscard(false); // Can't discard before drawing
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, activePlayer, players, actionPossibilities, wall, drawnTile]);

  // Game flow and AI automation
  useEffect(() => {
    runGameFlow();
  }, [runGameFlow]);

  // Other useEffects for setup and timers
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


  // Timer for player's turn
  useEffect(() => {
    if (gameState === 'playing' && activePlayer !== null) {
      setTurnTimer(TURN_DURATION); 
      timerRef.current = setInterval(() => {
        setTurnTimer(prev => prev - 1);
      }, 1000);

      return () => clearTimer(timerRef);
    } else {
        clearTimer(timerRef);
    }
  }, [gameState, activePlayer]);

   // Timer for player's action (Chow, Pong, Kong)
    useEffect(() => {
        const humanPlayerAction = actionPossibilities.find(p => p.playerId === 0);
        if (humanPlayerAction) {
            setActionTimer(ACTION_DURATION);
            actionTimerRef.current = setInterval(() => {
                setActionTimer(prev => prev - 1);
            }, 1000);
            return () => clearTimer(actionTimerRef);
        } else {
            clearTimer(actionTimerRef);
        }
    }, [actionPossibilities]);

  // Handle auto-actions on timer expiration
  useEffect(() => {
     if (turnTimer <= 0 && activePlayer !== null) {
        const currentPlayer = players.find(p => p.id === activePlayer);
        if (!currentPlayer) return;

        // Human player auto-discard ONLY if AI controlled and it's their turn to discard
        if (activePlayer === 0 && isAiControlled && humanPlayerCanDiscard) {
            toast({ title: "时间到 (Time's Up!)", description: "AI托管为您打出最右边的牌。(AI automatically discarding rightmost tile.)" });
            handleDiscardTile(0, players[0].hand.length - 1);
        }
    }
     if (actionTimer <= 0 && actionPossibilities.some(p => p.playerId === 0)) {
        handleAction('skip', 0);
    }
  }, [turnTimer, actionTimer, isAiControlled, actionPossibilities, activePlayer, players, handleDiscardTile, toast, humanPlayerCanDiscard]);

  const initializeGame = useCallback(() => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
    setGameState('pre-roll-seating');
    setRoundResult(null);
    setSeatingRolls([]);
    setActionPossibilities([]);
    setHumanPlayerCanDiscard(false);
    const newDeck = createDeck();
    
    const deckString = JSON.stringify(newDeck.sort((a,b) => (a.suit+a.value).localeCompare(b.suit+b.value)));
    const seed = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(deckString + seed).digest('hex');
    setShuffleHash(hash);
    
    const shuffled = shuffleDeck(newDeck);
    
    setWall(shuffled);
    setDiscards([]);
    setGoldenTile(null);

    const humanPlayer: Player = { id: 0, name: 'You', avatar: `https://placehold.co/40x40.png`, isAI: false, hand: [], melds: [], balance: INITIAL_BALANCE, hasLocation: null };
    
    const initialPlayers: Player[] = [humanPlayer];
    
    if(roomTier === 'Free' && initialPlayers.length < 4) {
      const aiPlayersNeeded = 4 - initialPlayers.length;
      for(let i=1; i<=aiPlayersNeeded; i++) {
        initialPlayers.push({
          id: i,
          name: `AI 玩家 ${i+1} (电脑)`,
          avatar: `https://placehold.co/40x40.png`,
          isAI: true,
          hand: [],
          melds: [],
          balance: INITIAL_BALANCE,
          hasLocation: Math.random() > 0.5
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
          hasLocation: Math.random() > 0.5
        })
      }
    }
    
    setPlayers(initialPlayers);
    setPot(0);
    setActivePlayer(null);
    setBankerId(null);
    setEastPlayerId(null);
    setDrawnTile(null);
    setSelectedTileIndex(null);
    setIsAiControlled(false);

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: true } : p));
                },
                (error) => {
                    setPlayers(prev => prev.map(p => p.id === 0 ? { ...p, hasLocation: false } : p));
                }
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
        
        const newEastPlayer = playerRolls[0].player;
        setEastPlayerId(newEastPlayer.id);

        const finalPlayers = players.map(p => {
            const rollInfo = playerRolls.find(pr => pr.player.id === p.id);
            const windIndex = playerRolls.indexOf(rollInfo!);
            const windName = windNames[windIndex];
            const baseName = p.name.split(' ')[0];
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
    if (wall.length > 0 && activePlayer === 0 && !humanPlayerCanDiscard) {
      const newWall = [...wall];
      const tile = newWall.pop()!;
      setWall(newWall);
      setDrawnTile(tile);

      const updatedPlayers = [...players];
      const player = updatedPlayers.find(p => p.id === 0);
      if (player) {
          const newHand = [...player.hand, tile];
          player.hand = newHand;
          // Check for self-drawn win
          if (isWinningHand(newHand)) {
            // Can optionally show a win button here instead of auto-winning
          }
      }

      setPlayers(updatedPlayers);
      setHumanPlayerCanDiscard(true); // Player has drawn, can now discard.
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
  
  const handleAction = async (action: Action | 'skip', playerId: number) => {
    clearTimer(actionTimerRef);
    setActionPossibilities([]); 

    const lastDiscarderId = discards.length > 0 ? discards[discards.length - 1].playerId : null;
    if (lastDiscarderId === null) return;
    
    if (action === 'skip') {
        setActivePlayer(getNextPlayerId(lastDiscarderId));
        return;
    }

    if (action === 'win') {
        handleWin(playerId);
        return;
    }

    // SIMULATION: Check if the action is valid. 50% chance of being invalid for demo purposes.
     if (Math.random() < 0.5) {
        toast({
            variant: "destructive",
            title: `操作无效 (${action.charAt(0).toUpperCase() + action.slice(1)} Invalid)`,
            description: `您的手牌不满足'${action}'的条件。`,
        });
        // After an invalid action, the turn should pass to the next player.
        setActivePlayer(getNextPlayerId(lastDiscarderId));
        return;
    }

    const actionSoundMap = { 'pong': '碰', 'kong': '杠', 'chow': '吃' } as const;
    const soundKey = action as keyof typeof actionSoundMap;
    if (actionSoundMap[soundKey]) {
        playSound(actionSoundMap[soundKey]);
    }
    
    toast({
        title: `执行操作 (${action})`,
        description: `您选择了 ${action}。正在模拟匹配手牌...`,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedPlayers = [...players];
    const actionPlayer = updatedPlayers.find(p => p.id === playerId);
    const lastDiscard = discards[discards.length-1]?.tile;
    if(actionPlayer && lastDiscard) {
        let tilesToMeld = [lastDiscard];
        let foundCount = 0;
        const newHand = actionPlayer.hand.filter(tile => {
            if (tile.value === lastDiscard.value && tile.suit === lastDiscard.suit && foundCount < (action === 'chow' ? 1 : 2)) {
                tilesToMeld.push(tile);
                foundCount++;
                return false;
            }
            return true;
        });

        if (foundCount >= 1) { // A real game needs more checks
            actionPlayer.hand = newHand;
            actionPlayer.melds.push(tilesToMeld);
            setPlayers(updatedPlayers);
        }
    }

    toast({
        title: `匹配成功`,
        description: `已为您组成牌组。请打出一张牌。`,
    });

    setActivePlayer(playerId);
    if (playerId === 0) {
        setHumanPlayerCanDiscard(true);
    }
  };

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.play();
    }
  }, [audioSrc]);

  const humanPlayer = players.find(p => p.id === 0);
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
      {/* Landscape-specific top/bottom bars */}
      <div className={cn("landscape-top-bar", isLandscape ? "flex" : "hidden", "absolute top-0 left-0 right-0 p-2 bg-black/30 justify-between items-center z-20")}>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">菜单</Button>
            <div className="p-1 rounded bg-black/50 text-center">
                <p className="text-yellow-400 font-bold">2840</p>
                <p className="text-xs">新手福利</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <div className="p-1 rounded bg-black/50 text-center">
                <p className="text-yellow-400 font-bold">2080</p>
                <p className="text-xs">社区任务福利</p>
            </div>
            <Button variant="ghost" size="sm">...</Button>
        </div>
      </div>


      <div className={cn("relative", isLandscape ? 'pt-12 pb-24' : 'p-4')}>
        <div className={cn("grid gap-6", !isLandscape && "lg:grid-cols-4")}>
            <div className={cn("space-y-6", !isLandscape && "lg:col-span-3")}>
                <div className={cn("flex flex-wrap justify-between items-center gap-4", isLandscape && "hidden")}>
                <h1 className="text-2xl font-bold font-headline text-primary">{`${roomTierMap[roomTier]} (${roomTier} Room)`}</h1>
                <div className="flex items-center gap-2 text-xl font-bold text-primary border-2 border-primary/50 bg-primary/10 px-3 py-1 rounded-lg">
                        <Trophy />
                        <span>奖池 (Pot): {pot} $JIN</span>
                    </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button onClick={() => setIsLandscape(!isLandscape)} variant="outline"><RotateCw /> {isLandscape ? '切换竖屏' : '切换横屏'}</Button>
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
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">游戏玩法 (Gameplay)</h3>
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li><strong>吃 (Chow):</strong> 只能吃您**上家**（左边的玩家）打出的牌来组成顺子。</li>
                                            <li><strong>碰 (Pong):</strong> 可以碰**任何一家**打出的牌来组成刻子（三张相同的牌）。</li>
                                            <li><strong>杠 (Kong):</strong> 可以杠**任何一家**打出的牌来组成杠子（四张相同的牌）。</li>
                                            <li><strong>优先级 (Priority):</strong> 胡牌 > 碰/杠 > 吃。如果多个玩家可以对同一张牌执行操作，高优先级的操作会覆盖低优先级的。</li>
                                            <li><strong>胡牌提示 (Winning Prompt)：</strong>当您摸牌或有玩家弃牌后，如果您的手牌已满足胡牌条件，系统会自动出现“胡牌”按钮。</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">计分规则 (Scoring)</h3>
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li><strong>普通胡牌 (Standard Win)：</strong>赢家获得奖池内所有押金。输家均分损失。</li>
                                            <li><strong>自摸 (Self-Drawn Win)：</strong>自摸胡牌的赢家，奖金翻倍。</li>
                                            <li><strong>游金 (Golden Tour Win)：</strong>使用“金牌”作为胡牌的关键张时，称为“游金”。根据打出金牌的时机获得额外翻倍奖励。</li>
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
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline"><Shuffle />新对局 (New Game)</Button>
                        </AlertDialogTrigger>
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
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline"><Undo2 />返回大厅 (Back to Lobby)</Button>
                        </AlertDialogTrigger>
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
                </div>

                <div className={cn("relative", isLandscape && "h-[calc(100vh-8rem)] flex items-center justify-center")}>
                    <GameBoard 
                        players={players} 
                        discards={discards}
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
                        humanPlayerAction={humanPlayerAction}
                        onAction={handleAction}
                        actionTimer={actionTimer}
                        actionDuration={ACTION_DURATION}
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
                                    <Button onClick={() => handleWin()} variant="destructive">
                                        <Trophy className="mr-2 h-4 w-4 text-yellow-300"/>
                                        自摸胡牌 (Win)
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="relative p-4 bg-background/50 rounded-lg min-h-[12rem] flex items-end justify-center">
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

       {/* Landscape-specific bottom bar with hand and actions */}
        <div className={cn("landscape-bottom-bar", isLandscape ? "flex" : "hidden", "fixed bottom-0 left-0 right-0 p-2 bg-black/30 items-end justify-between z-20")}>
            <div className='flex-1'>
                 {/* Placeholder for player info or other UI */}
            </div>
            <div className="flex-grow flex items-end justify-center">
                 <PlayerHand 
                    hand={humanPlayer?.hand || []} 
                    onTileClick={handleSelectOrDiscardTile}
                    canInteract={humanPlayerCanDiscard && activePlayer === 0 && !isAiControlled}
                    goldenTile={goldenTile}
                    selectedTileIndex={selectedTileIndex}
                    isLandscape={isLandscape}
                />
            </div>
            <div className='flex-1 flex justify-end items-center gap-2'>
                {/* Right side action buttons */}
                <div className="flex flex-col gap-2 items-center">
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">聊</Button>
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">听</Button>
                </div>
            </div>
        </div>
      </div>

       <AlertDialog open={gameState === 'game-over'}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-400" />
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

    