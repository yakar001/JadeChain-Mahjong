
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2 } from 'lucide-react';
import React from 'react';

type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; discards: Tile[] };
type DiceRoll = [number, number];

interface GameBoardProps {
  players: Player[];
  activePlayerId: number;
  wallCount: number;
  dice: DiceRoll;
  gameState: 'pre-roll' | 'rolling' | 'deal' | 'playing';
  bankerId: number | null;
}

const PlayerInfo = ({ player, position, isActive, isBanker }: { player: Player; position: 'bottom' | 'right' | 'top' | 'left', isActive: boolean, isBanker: boolean }) => {
  const positionClasses = {
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 flex-col',
    right: 'top-1/2 right-0 -translate-y-1/2 flex-row-reverse -mr-8',
    top: 'top-0 left-1/2 -translate-x-1/2 flex-col-reverse -mt-8',
    left: 'top-1/2 left-0 -translate-y-1/2 flex-row -ml-8'
  };

  return (
    <div className={cn('absolute flex items-center gap-2 p-2 bg-background/80 rounded-lg', positionClasses[position])}>
      <Avatar className={cn('h-8 w-8 border-2', isActive ? 'border-primary' : 'border-transparent')}>
        <AvatarImage src={player.avatar} />
        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={cn('transition-opacity duration-300 flex items-center gap-1', isActive ? 'opacity-100' : 'opacity-70')}>
        <p className="font-semibold text-sm whitespace-nowrap">{player.name}</p>
        {isBanker && <Crown className="w-4 h-4 text-yellow-500" />}
      </div>
    </div>
  );
};

const Dice = ({ value }: { value: number }) => {
    const Icon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][value - 1];
    return <Icon className="w-8 h-8 text-white" />;
}

const WallSegment = ({ count, orientation }: { count: number; orientation: 'horizontal' | 'vertical' }) => (
    <div className={cn('flex gap-px', orientation === 'horizontal' ? 'flex-row' : 'flex-col')}>
        {Array.from({ length: count / 2 }).map((_, i) => (
            <div key={i} className="relative">
                <div className={cn("bg-green-700 border-green-900", orientation === 'horizontal' ? 'w-2 h-4 border-b-2' : 'w-4 h-2 border-r-2')}></div>
                <div className={cn("bg-green-700 border-green-900 absolute top-0 left-0", orientation === 'horizontal' ? 'w-2 h-4 border-b-2 ml-px -mt-px' : 'w-4 h-2 border-r-2 mt-px -ml-px')}></div>
            </div>
        ))}
    </div>
);


export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId }: GameBoardProps) {
    const playerSouth = players.find(p => p.id === 0);
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);

    const allDiscards = players.flatMap(p => p.discards);
    
    // Total tiles = 136. Each side has 17 pairs (34 tiles).
    const tilesPerSide = 34;
    const southCount = Math.min(tilesPerSide, wallCount);
    const eastCount = Math.min(tilesPerSide, Math.max(0, wallCount - tilesPerSide));
    const northCount = Math.min(tilesPerSide, Math.max(0, wallCount - tilesPerSide * 2));
    const westCount = Math.min(tilesPerSide, Math.max(0, wallCount - tilesPerSide * 3));

  return (
    <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative flex items-center justify-center">
        <div className="absolute inset-8 border-2 border-yellow-800/30 rounded" />
        
        {/* Walls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2"><WallSegment count={northCount} orientation="horizontal" /></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2"><WallSegment count={southCount} orientation="horizontal" /></div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2"><WallSegment count={westCount} orientation="vertical" /></div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2"><WallSegment count={eastCount} orientation="vertical" /></div>
        
        {/* Player Areas */}
        {playerSouth && <PlayerInfo player={playerSouth} position="bottom" isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} />}
        {playerEast && <PlayerInfo player={playerEast} position="right" isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id}/>}
        {playerNorth && <PlayerInfo player={playerNorth} position="top" isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id}/>}
        {playerWest && <PlayerInfo player={playerWest} position="left" isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id}/>}

        {/* Center Area */}
        <div className="w-4/5 h-4/5 flex items-center justify-center">
            {gameState === 'pre-roll' && (
                <div className="text-center text-background/80">
                    <p className="font-bold text-lg">等待掷骰子...</p>
                    <p className="text-sm">Click the button below to start the game.</p>
                </div>
            )}
             {gameState === 'rolling' && (
                <div className="flex items-center justify-center gap-4 animate-bounce">
                    <Dice value={dice[0]} />
                    <Dice value={dice[1]} />
                </div>
            )}
            {gameState === 'playing' && (
                <div className="w-full h-full grid grid-cols-8 grid-rows-6 gap-1 p-2 bg-black/10 rounded">
                    {allDiscards.map((tile, index) => (
                        <MahjongTile key={index} suit={tile.suit} value={tile.value as any} size="sm" />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
