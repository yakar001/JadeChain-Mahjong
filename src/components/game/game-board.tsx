
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
  gameState: 'pre-roll' | 'rolling' | 'deal' | 'playing' | 'banker-roll-for-golden';
  bankerId: number | null;
}

const PlayerInfo = ({ player, position, isActive, isBanker }: { player: Player; position: 'bottom' | 'right' | 'top' | 'left', isActive: boolean, isBanker: boolean }) => {
  const positionClasses = {
    bottom: 'bottom-2 left-1/2 -translate-x-1/2 flex-col',
    right: 'top-1/2 right-2 -translate-y-1/2 flex-row-reverse',
    top: 'top-2 left-1/2 -translate-x-1/2 flex-col-reverse',
    left: 'top-1/2 left-2 -translate-y-1/2 flex-row'
  };

  return (
    <div className={cn('absolute flex items-center gap-2 p-1 bg-background/80 rounded-lg z-10', positionClasses[position])}>
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

const DiscardArea = ({ discards, position }: { discards: Tile[]; position: 'bottom' | 'right' | 'top' | 'left' }) => {
    const positionClasses = {
        bottom: 'bottom-[20%] left-1/2 -translate-x-1/2 w-3/5 h-1/4',
        right: 'top-1/2 right-[20%] -translate-y-1/2 h-3/5 w-1/4',
        top: 'top-[20%] left-1/2 -translate-x-1/2 w-3/5 h-1/4',
        left: 'top-1/2 left-[20%] -translate-y-1/2 h-3/5 w-1/4'
    }
    return (
        <div className={cn('absolute flex flex-wrap-reverse gap-1 p-1 justify-center items-center', positionClasses[position])}>
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
                <div className={cn("bg-green-700 border-green-900", orientation === 'horizontal' ? 'w-3 h-5 border-b-2' : 'w-5 h-3 border-r-2')}></div>
                <div className={cn("bg-green-700 border-green-900 absolute top-0 left-0", orientation === 'horizontal' ? 'w-3 h-5 border-b-2 ml-px -mt-px' : 'w-5 h-3 border-r-2 mt-px -ml-px')}></div>
            </div>
        ))}
    </div>
);


export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId }: GameBoardProps) {
    const playerSouth = players.find(p => p.id === 0);
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);
    
    // Total tiles = 136. Each side has 17 pairs (34 tiles).
    const tilesPerSide = 34;

    // Simulate wall reduction based on banker position
    // For simplicity, let's assume banker is always East (player 1) for wall breaking
    // This part can get very complex, so we simplify for visuals
    const totalTiles = 136;
    const tilesDealt = (13 * 4) + 1;
    const remainingAfterDeal = totalTiles - tilesDealt;
    const wallTilesToShow = Math.max(0, wallCount - (remainingAfterDeal - wallCount));

    const eastCount = Math.min(tilesPerSide, wallTilesToShow);
    const southCount = Math.min(tilesPerSide, Math.max(0, wallTilesToShow - tilesPerSide));
    const westCount = Math.min(tilesPerSide, Math.max(0, wallTilesToShow - tilesPerSide * 2));
    const northCount = Math.min(tilesPerSide, Math.max(0, wallTilesToShow - tilesPerSide * 3));

  return (
    <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative flex items-center justify-center">
        <div className="absolute inset-12 border-2 border-yellow-800/30 rounded" />
        
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
