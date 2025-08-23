
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Coins, MapPin, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; discards: Tile[]; balance: number; hasLocation: boolean | null; };
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


const PlayerInfo = ({ player, position, isActive, isBanker, turnTimer, turnDuration }: { player: Player; position: 'bottom' | 'right' | 'top' | 'left', isActive: boolean, isBanker: boolean, turnTimer: number, turnDuration: number }) => {
  const positionClasses = {
    bottom: 'bottom-2 left-1/2 -translate-x-1/2 flex-col',
    right: 'top-1/2 right-2 -translate-y-1/2 flex-row-reverse',
    top: 'top-2 left-1/2 -translate-x-1/2 flex-col-reverse',
    left: 'top-1/2 left-2 -translate-y-1/2 flex-row'
  };
  
  const showTimer = isActive && player.id === 0;

  return (
    <div className={cn('absolute flex items-center gap-2 p-1 bg-background/80 rounded-lg z-10', positionClasses[position])}>
      <Avatar className={cn('h-8 w-8 border-2', isActive ? 'border-primary' : 'border-transparent')}>
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
  );
};

const DiscardArea = ({ discards, position }: { discards: Tile[]; position: 'bottom' | 'right' | 'top' | 'left' }) => {
    const gridStyles = {
        bottom: 'grid-rows-3 grid-flow-col-dense',
        top: 'grid-rows-3 grid-flow-col-dense',
        left: 'grid-cols-3 grid-flow-row-dense h-3/5',
        right: 'grid-cols-3 grid-flow-row-dense h-3/5',
    };
    const positionClasses = {
        bottom: 'bottom-[52%] left-1/2 -translate-x-1/2 w-2/5',
        right: 'top-1/2 right-[52%] -translate-y-1/2 w-1/5',
        top: 'top-[52%] left-1/2 -translate-x-1/2 w-2/5',
        left: 'top-1/2 left-[52%] -translate-y-1/2 w-1/5'
    }

    return (
        <div className={cn('absolute grid gap-1 p-1 justify-center items-center', positionClasses[position], gridStyles[position])}>
            {discards.map((tile, index) => (
                <MahjongTile key={index} suit={tile.suit} value={tile.value as any} size="sm" />
            ))}
        </div>
    )
}

const Dice = ({ value }: { value: number }) => {
    const Icon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][value - 1];
    return <Icon className="w-8 h-8 text-white" />;
}

const WallSegment = ({ count, orientation }: { count: number; orientation: 'horizontal' | 'vertical' }) => (
    <div className={cn('flex gap-px', orientation === 'horizontal' ? 'flex-row' : 'flex-col')}>
        {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
            <div key={i} className="relative">
                <div className={cn("bg-green-700 border-green-900", orientation === 'horizontal' ? 'w-[1.25vw] h-[1.75vw] max-w-5 max-h-7 border-b-2' : 'w-[1.75vw] h-[1.25vw] max-w-7 max-h-5 border-r-2')}></div>
                <div className={cn("bg-green-700 border-green-900 absolute top-0 left-0", orientation === 'horizontal' ? 'w-[1.25vw] h-[1.75vw] max-w-5 max-h-7 border-b-2 ml-px -mt-px' : 'w-[1.75vw] h-[1.25vw] max-w-7 max-h-5 border-r-2 mt-px -ml-px')}></div>
            </div>
        ))}
    </div>
);


export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration }: GameBoardProps) {
    const playerSouth = players.find(p => p.id === 0);
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);
    
    // Total tiles = 136. Each side has 17 pairs (34 tiles).
    const tilesPerSide = 34;
    const initialWallCount = 136;

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
    <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative flex items-center justify-center">
        <div className="absolute inset-4 sm:inset-8 md:inset-16 border-2 border-yellow-800/30 rounded" />
        
        {/* Walls */}
        <div className="absolute top-2 sm:top-4 md:top-8 left-1/2 -translate-x-1/2"><WallSegment count={north} orientation="horizontal" /></div>
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"><WallSegment count={south} orientation="horizontal" /></div>
        <div className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2"><WallSegment count={west} orientation="vertical" /></div>
        <div className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2"><WallSegment count={east} orientation="vertical" /></div>
        
        {/* Player Areas */}
        {playerSouth && <PlayerInfo player={playerSouth} position="bottom" isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration}/>}
        {playerEast && <PlayerInfo player={playerEast} position="right" isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration}/>}
        {playerNorth && <PlayerInfo player={playerNorth} position="top" isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration}/>}
        {playerWest && <PlayerInfo player={playerWest} position="left" isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration}/>}

        {/* Center Area */}
        <div className="w-3/5 h-3/5 flex items-center justify-center relative">
            {(gameState === 'pre-roll' || gameState === 'banker-roll-for-golden') && (
                <div className="text-center text-background/80">
                    {gameState === 'pre-roll' && <p className="font-bold text-lg">等待掷骰子开局...</p>}
                    {gameState === 'banker-roll-for-golden' && <p className="font-bold text-lg">等待庄家掷骰开金...</p>}
                    <p className="text-sm">Please click the button below to continue.</p>
                </div>
            )}
             {gameState === 'rolling' && (
                <div className="flex items-center justify-center gap-4 animate-bounce">
                    <Dice value={dice[0]} />
                    <Dice value={dice[1]} />
                </div>
            )}
            {gameState === 'playing' && (
               <>
                {playerSouth && <DiscardArea discards={playerSouth.discards} position="bottom" />}
                {playerEast && <DiscardArea discards={playerEast.discards} position="right" />}
                {playerNorth && <DiscardArea discards={playerNorth.discards} position="top" />}
                {playerWest && <DiscardArea discards={playerWest.discards} position="left" />}
               </>
            )}
        </div>
    </div>
  );
}
