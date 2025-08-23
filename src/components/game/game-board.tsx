
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Coins, MapPin, AlertTriangle, Layers } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';

type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; discards: Tile[]; melds: Tile[][]; balance: number; hasLocation: boolean | null; };
type DiceRoll = [number, number];

interface GameBoardProps {
  players: Player[];
  activePlayerId: number;
  wallCount: number;
  dice: DiceRoll;
  gameState: 'pre-roll' | 'rolling' | 'deal' | 'playing' | 'banker-roll-for-golden' | 'game-over';
  bankerId: number | null;
  turnTimer: number;
  turnDuration: number;
  goldenTile: Tile | null;
}

const TurnTimerCircle = ({ timer, duration }: { timer: number; duration: number }) => {
    const progress = (timer / duration) * 100;
    const circumference = 2 * Math.PI * 18; // 2 * pi * r (radius is 18)
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="text-primary/10"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                />
                <circle
                    className="text-primary transition-all duration-1000 linear"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {timer}
            </span>
        </div>
    );
};


const PlayerInfo = ({ player, isActive, isBanker, turnTimer, turnDuration, goldenTile }: { player: Player; isActive: boolean, isBanker: boolean, turnTimer: number, turnDuration: number, goldenTile: Tile | null }) => {
  const showTimer = isActive && player.id === 0;

  return (
    <div className='flex items-center gap-2 z-10'>
        <div className={cn('flex items-center gap-2 p-2 bg-background/80 rounded-lg border-2', isActive ? 'border-primary' : 'border-transparent')}>
        <Avatar className={cn('h-10 w-10')}>
            <AvatarImage src={player.avatar} />
            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={cn('transition-opacity duration-300 flex items-center gap-2', isActive ? 'opacity-100' : 'opacity-70')}>
            <div className='text-center'>
                <div className='flex items-center gap-2 justify-center'>
                    <div className='flex items-center gap-1'>
                        <p className="font-semibold text-sm whitespace-nowrap">{player.name}</p>
                        {isBanker && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                {player.hasLocation === true && <MapPin className="w-4 h-4 text-green-500" />}
                                {player.hasLocation === false && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                {player.hasLocation === null && <Loader2 className="w-4 h-4 animate-spin" />}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{player.hasLocation === true ? '已开启定位 (Location Enabled)' : player.hasLocation === false ? '未开启定位 (Location Disabled)' : '正在获取定位... (Getting location...)'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className='text-xs text-primary font-mono flex items-center justify-center gap-1'><Coins size={12}/> {player.balance}</p>
            </div>
            {showTimer && <TurnTimerCircle timer={turnTimer} duration={turnDuration} />}
        </div>
        </div>
      <div className="flex items-center gap-4">
        {goldenTile && (
             <div className="flex flex-col items-center gap-1 p-2 bg-background/80 rounded-lg">
                 <Label className="text-xs text-muted-foreground">金牌 (Wild)</Label>
                 <MahjongTile suit={goldenTile.suit} value={goldenTile.value as any} size="sm" isGolden />
            </div>
        )}
        {player.melds.length > 0 && (
             <div className="flex flex-col items-center gap-1 p-2 bg-background/80 rounded-lg">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Layers /> 鸣牌区</Label>
                <div className="flex gap-1">
                    {player.melds.map((meld, i) => (
                        <div key={i} className="flex gap-px">
                            {meld.map((tile, j) => <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" />)}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const DiscardArea = ({ discards }: { discards: Tile[] }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-[20%]">
             <div className="w-full h-full flex flex-wrap items-start justify-start content-start gap-1 p-2 bg-black/10 rounded">
                {discards.map((tile, index) => (
                    <MahjongTile key={index} suit={tile.suit} value={tile.value as any} size="sm" />
                ))}
             </div>
        </div>
    );
}

const Dice = ({ value }: { value: number }) => {
    const Icon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][value - 1];
    return <Icon className="w-8 h-8 text-white" />;
}

const WallSegment = ({ count, orientation }: { count: number; orientation: 'horizontal' | 'vertical' }) => (
    <div className={cn('flex gap-px', orientation === 'horizontal' ? 'flex-row' : 'flex-col')}>
        {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
            <div key={i} className="relative">
                <div className={cn("bg-green-700 border-green-900", orientation === 'horizontal' ? 'w-[2.1vw] h-[3vh] max-w-5 max-h-7 border-b-2' : 'w-[3vh] h-[2.1vw] max-w-7 max-h-5 border-r-2')}></div>
                <div className={cn("bg-green-700 border-green-900 absolute top-0 left-0", orientation === 'horizontal' ? 'w-[2.1vw] h-[3vh] max-w-5 max-h-7 border-b-2 ml-px -mt-px' : 'w-[3vh] h-[2.1vw] max-w-7 max-h-5 border-r-2 mt-px -ml-px')}></div>
            </div>
        ))}
    </div>
);


export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration, goldenTile }: GameBoardProps) {
    const playerSouth = players.find(p => p.id === 0); // Human
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);
    
    // Total tiles = 136. Each side has 17 pairs (34 tiles).
    const tilesPerSide = 34;
    const initialWallCount = 136;
    
    const allDiscards = players.flatMap(p => p.discards);

    const getWallCounts = () => {
        let counts = { east: tilesPerSide, south: tilesPerSide, west: tilesPerSide, north: tilesPerSide };
        if (gameState === 'pre-roll' || wallCount === 0) return counts;

        let tilesToRemove = (initialWallCount - wallCount);
        
        // Banker determines start. 0:S, 1:E, 2:N, 3:W
        const sideOrder: Array<keyof typeof counts> = ['east', 'south', 'west', 'north'];
        let startIndex = (bankerId || 0); 
        
        while (tilesToRemove > 0) {
            const side = sideOrder[startIndex % 4];
            const removable = counts[side];
            
            if (tilesToRemove >= removable) {
                tilesToRemove -= removable;
                counts[side] = 0;
            } else {
                counts[side] -= tilesToRemove;
                tilesToRemove = 0;
            }
            // Move to next player (counter-clockwise)
             startIndex = (startIndex + 1);
        }
        
        return counts;
    }

    const { east, south, west, north } = getWallCounts();

  return (
    <div className="relative w-full aspect-square max-w-[80vh] mx-auto">
        {/* Player Info Areas */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          {playerSouth && <PlayerInfo player={playerSouth} isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile}/>}
        </div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
          {playerEast && <PlayerInfo player={playerEast} isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} />}
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            {playerNorth && <PlayerInfo player={playerNorth} isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} />}
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2">
            {playerWest && <PlayerInfo player={playerWest} isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} />}
        </div>


        <div className="absolute inset-[8%]">
            <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative flex items-center justify-center">
                <div className="absolute inset-4 sm:inset-8 md:inset-12 border-2 border-yellow-800/30 rounded" />
                
                {/* Walls */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2"><WallSegment count={north} orientation="horizontal" /></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2"><WallSegment count={south} orientation="horizontal" /></div>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2"><WallSegment count={west} orientation="vertical" /></div>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2"><WallSegment count={east} orientation="vertical" /></div>
                
                {/* Center Area */}
                <div className="w-full h-full flex items-center justify-center relative">
                    {(gameState === 'pre-roll' || gameState === 'banker-roll-for-golden') && (
                        <div className="text-center text-white">
                            {gameState === 'pre-roll' && <p className="font-bold text-lg">等待掷骰子开局...</p>}
                            {gameState === 'banker-roll-for-golden' && <p className="font-bold text-lg">等待庄家掷骰开金...</p>}
                        </div>
                    )}
                     {gameState === 'rolling' && (
                        <div className="flex items-center justify-center gap-4 animate-bounce">
                            <Dice value={dice[0]} />
                            <Dice value={dice[1]} />
                        </div>
                    )}
                    {(gameState === 'playing' || gameState === 'game-over') && <DiscardArea discards={allDiscards} />}
                </div>
            </div>
        </div>
    </div>
  );
}

