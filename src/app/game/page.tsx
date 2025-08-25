
'use client';
import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/game/game-board';
import { PlayerHand } from '@/components/game/player-hand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Undo2, Hand, Shuffle, Dices, Volume2, VolumeX, BookOpen, ThumbsUp, Crown, Trophy, Bot, Loader2, Minus, Plus, Eye } from 'lucide-react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);


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
    
    // SIMULATION: Check if the hand is actually a winning hand.
    // In a real game, this would involve complex logic. Here, we'll use a 70% chance of success.
    if (Math.random() < 0.3) {
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


  const handleDiscardTile = useCallback(async (playerId: number, tileIndex: number) => {
    const updatedPlayers = [...players];
    const player = updatedPlayers.find(p => p.id === playerId);

    if (!player || tileIndex < 0 || tileIndex >= player.hand.length) {
      console.error("Invalid discard attempt", {playerId, tileIndex, playerHand: player?.hand});
      // As a fallback, if index is invalid, discard last tile
      if (player && player.hand.length > 0) {
          tileIndex = player.hand.length - 1;
      } else {
          // No tiles to discard, maybe game should end?
          handleEndGame(players);
          return;
      }
    }

    const tileToDiscard = player.hand[tileIndex];
    
    player.hand.splice(tileIndex, 1);
    setDiscards(prev => [...prev, { tile: tileToDiscard, playerId: playerId }]);
    
    setPlayers(updatedPlayers);
    setDrawnTile(null);
    setSelectedTileIndex(null); // Reset selection for human player
    
    if (player.id === 0) {
        clearTimer(timerRef); // Human player made a move, clear timer
    }

    // Play audio for discarded tile
    const tileName = getTileName(tileToDiscard);
    playSound(tileName);
    
    // Check for actions from other players
    const potentialActions: ActionPossibility[] = [];
    players.forEach(p => {
        if (p.id !== playerId) {
             const previousPlayerId = (playerId + players.length - 1) % players.length;
             // SIMULATION: Check if a player can perform an action.
             const canWin = Math.random() < 0.05; // 5% chance to win on any discard
             const canPong = Math.random() < 0.2; // 20% chance
             const canKong = Math.random() < 0.1; // 10% chance
             const canChow = (p.id === (playerId + 1) % players.length) && Math.random() < 0.3; // 30% from previous player

             if (canWin || canPong || canKong || canChow) {
                 potentialActions.push({ playerId: p.id, actions: { win: canWin, pong: canPong, kong: canKong, chow: canChow } });
             }
        }
    });

    if (potentialActions.length > 0) {
        // Priority: Win > Kong/Pong > Chow
        const winAction = potentialActions.find(p => p.actions.win);
        const pongKongAction = potentialActions.find(p => p.actions.pong || p.actions.kong);
        const chowAction = potentialActions.find(p => p.actions.chow);

        if (winAction) {
             setActionPossibilities([winAction]);
        } else if (pongKongAction) {
             setActionPossibilities([pongKongAction]);
        } else if (chowAction) {
             setActionPossibilities([chowAction]);
        } else {
            setActionPossibilities(potentialActions);
        }
    } else {
        const currentPlayerIndexInArray = players.findIndex(p => p.id === playerId);
        const nextPlayer = players[(currentPlayerIndexInArray + 1) % players.length];
        setActivePlayer(nextPlayer.id);
    }
    
  }, [players, playSound, handleEndGame]);

  // Game flow and AI automation
  useEffect(() => {
    const isOurTurn = (playerId: number | null) => players.find(p => p.id === playerId)?.isAI;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const runGameFlow = async () => {
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
        case 'playing':
          const currentPlayer = players.find(p => p.id === activePlayer);
          if (currentPlayer && currentPlayer.isAI && !actionPossibilities.length) {
            await delay(Math.random() * 1000 + 1000); // Simulate 1-2s thinking

            // Banker starts with 14 tiles, so they discard directly on first turn.
            if (currentPlayer.hand.length % 3 === 2) {
                const discardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
                handleDiscardTile(activePlayer, discardIndex);
                return;
            }

            // Otherwise, draw a tile then discard.
            // Check for self-drawn win
            if (Math.random() < 0.05) { // 5% chance for AI to win on its turn
              handleWin(currentPlayer.id);
              return;
            }

            const wallCopy = [...wall];
            const drawnTileFromWall = wallCopy.pop();

            if (drawnTileFromWall) {
              const updatedPlayers = players.map(p => {
                if (p.id === activePlayer) {
                  return { ...p, hand: [...p.hand, drawnTileFromWall] };
                }
                return p;
              });
              setWall(wallCopy);
              setPlayers(updatedPlayers);
              
              await delay(500);
              
              const handSize = updatedPlayers.find(p=>p.id === activePlayer)!.hand.length;
              const discardIndex = Math.floor(Math.random() * handSize);
              handleDiscardTile(activePlayer, discardIndex);

            } else {
              // Wall is empty, end game in a draw
              handleEndGame(players);
            }
          }
          break;
        case 'game-over':
        case 'rolling-seating':
        case 'rolling-banker':
        case 'rolling':
        case 'deal':
            // No automatic actions needed in these states
            break;
      }
    };
    
    runGameFlow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, eastPlayerId, bankerId, activePlayer, actionPossibilities, players]);


  // Timer for player's turn
  useEffect(() => {
    if (gameState === 'playing' && activePlayer === 0 && drawnTile) {
      setTurnTimer(TURN_DURATION); 
      timerRef.current = setInterval(() => {
        setTurnTimer(prev => prev - 1);
      }, 1000);

      return () => clearTimer(timerRef);
    } else {
        clearTimer(timerRef);
    }
  }, [gameState, activePlayer, drawnTile]);

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
    if (turnTimer <= 0 && activePlayer === 0 && drawnTile) {
      toast({ title: "时间到 (Time's Up!)", description: "自动为您打出最右边的牌。(Automatically discarding rightmost tile.)" });
      handleDiscardTile(0, players[0].hand.length - 1);
      return;
    }
     if (actionTimer <= 0 && actionPossibilities.length > 0) {
        handleAction('skip', 0);
        return;
    }

    if (isAiControlled && activePlayer === 0 && drawnTile) {
      const aiThinkTime = Math.random() * 1000 + 500;
      const timeout = setTimeout(() => {
        handleDiscardTile(0, players[0].hand.length - 1);
      }, aiThinkTime);
      return () => clearTimeout(timeout);
    }
  }, [turnTimer, actionTimer, isAiControlled, actionPossibilities, activePlayer, drawnTile, players, handleDiscardTile, toast]);

  const initializeGame = useCallback(() => {
    clearTimer(timerRef);
    clearTimer(actionTimerRef);
    setGameState('pre-roll-seating');
    setRoundResult(null);
    setSeatingRolls([]);
    setActionPossibilities([]);
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
     const newDice: DiceRoll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
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

        if (bankerId === 0) { 
            setDrawnTile(players.find(p => p.id === 0)!.hand.slice(-1)[0]);
        }
        
    }, 5500); 
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
      handleDiscardTile(0, tileIndex);
    } else {
      setSelectedTileIndex(tileIndex);
    }
  };
  
  const handleAction = async (action: Action, playerId: number) => {
    clearTimer(actionTimerRef);
    if (activePlayer === null) return;
    
    const lastDiscarderId = discards[discards.length-1]?.playerId;
    if(lastDiscarderId === undefined) return;

    // SIMULATION: Check if the action is valid. 50% chance of being invalid for demo purposes.
     if (Math.random() < 0.5 && action !== 'skip') {
        toast({
            variant: "destructive",
            title: `操作无效 (${action.charAt(0).toUpperCase() + action.slice(1)} Invalid)`,
            description: `您的手牌不满足'${action}'的条件。`,
        });
        setActionPossibilities([]);
        // After an invalid action, the turn should pass to the next player.
        const currentPlayerIndexInArray = players.findIndex(p => p.id === lastDiscarderId);
        const nextPlayer = players[(currentPlayerIndexInArray + 1) % players.length];
        setActivePlayer(nextPlayer.id);
        return;
    }

    const actionSoundMap = {
      'pong': '碰',
      'kong': '杠',
      'chow': '吃',
      'win': '胡牌',
    } as const;
    
    const soundKey = action as keyof typeof actionSoundMap;
    if (actionSoundMap[soundKey]) {
        playSound(actionSoundMap[soundKey]);
    }
    
    setActionPossibilities([]); 
    
    if (action !== 'skip') {
        toast({
            title: `执行操作 (${action})`,
            description: `您选择了 ${action}。正在模拟匹配手牌...`,
        });

        // SIMULATION: Wait and simulate forming a meld.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedPlayers = [...players];
        const actionPlayer = updatedPlayers.find(p => p.id === playerId);
        const lastDiscard = discards[discards.length-1]?.tile;
        if(actionPlayer && lastDiscard) {
            // Find two matching tiles from hand for Pong/Kong. This is a simple simulation.
            let tilesToMeld = [lastDiscard];
            let foundCount = 0;
            const newHand = actionPlayer.hand.filter(tile => {
                if (tile.value === lastDiscard.value && tile.suit === lastDiscard.suit && foundCount < 2) {
                    tilesToMeld.push(tile);
                    foundCount++;
                    return false;
                }
                return true;
            });

            if (foundCount >= 1) { // A real game needs 2 for pong, 3 for kong
                actionPlayer.hand = newHand;
                actionPlayer.melds.push(tilesToMeld);
                setPlayers(updatedPlayers);
            }
        }

        toast({
            title: `匹配成功`,
            description: `已为您组成牌组。请打出一张牌。`,
        });

        // After action, it's this player's turn to discard.
        setActivePlayer(playerId);
        if (playerId === 0) {
            setDrawnTile({suit: 'placeholder', value: 'placeholder'}); // Use a placeholder to enable discard for human player
        }
    }

    if (action === 'skip') {
        const currentPlayerIndexInArray = players.findIndex(p => p.id === lastDiscarderId);
        const nextPlayer = players[(currentPlayerIndexInArray + 1) % players.length];
        setActivePlayer(nextPlayer.id);
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

        <Card>
          <CardContent className="p-2 md:p-4">
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
                    {gameState === 'playing' && activePlayer === 0 && !drawnTile && !humanPlayerAction && (
                      <Button onClick={handleDrawTile}>
                          <Hand className="mr-2 h-4 w-4" />
                          摸牌 (Draw Tile)
                      </Button>
                    )}
                    {gameState === 'playing' && activePlayer === 0 && drawnTile && (
                        <Button onClick={() => handleWin()} variant="destructive">
                            <Trophy className="mr-2 h-4 w-4 text-yellow-300"/>
                            自摸胡牌 (Win)
                        </Button>
                    )}
                 </div>
            </div>
            
            <div className="relative p-4 bg-background/50 rounded-lg min-h-[12rem] flex items-end justify-center">
               
                 {/* Action Buttons Area */}
                {humanPlayerAction && (
                    <div className="absolute bottom-4 left-4 z-20 space-y-2">
                        <div className='w-full mb-1'>
                            <Progress value={(actionTimer / ACTION_DURATION) * 100} className="h-1 [&>div]:bg-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                            {humanPlayerAction.actions.win && <Button onClick={() => handleWin(0)} size="sm" variant="destructive">胡 (Win)</Button>}
                            {humanPlayerAction.actions.chow && <Button onClick={() => handleAction('chow', 0)} size="sm">吃 (Chow)</Button>}
                            {humanPlayerAction.actions.pong && <Button onClick={() => handleAction('pong', 0)} size="sm">碰 (Pong)</Button>}
                            {humanPlayerAction.actions.kong && <Button onClick={() => handleAction('kong', 0)} size="sm">杠 (Kong)</Button>}
                            <Button onClick={() => handleAction('skip', 0)} size="sm" variant="secondary">跳过 ({actionTimer}s)</Button>
                        </div>
                    </div>
                )}
                
                {/* Hand Area */}
                <PlayerHand 
                    hand={humanPlayer?.hand || []} 
                    onTileClick={handleSelectOrDiscardTile}
                    canInteract={!!drawnTile && activePlayer === 0 && !isAiControlled}
                    goldenTile={goldenTile}
                    selectedTileIndex={selectedTileIndex}
                />
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
 

    