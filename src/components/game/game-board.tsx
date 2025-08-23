
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Coins } from 'lucide-react';
import React from 'react';

type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; discards: Tile[]; balance: number; };
type DiceRoll = [number, number];

interface GameBoardProps {
  players: Player[];
  activePlayerId: number;
  wallCount: number;
  dice: DiceRoll;
  gameState: 'pre-roll' | 'rolling' | 'deal' | 'playing' | 'banker-roll-for-golden' | 'game-over';
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
        <div className='text-center'>
            <div className='flex items-center gap-1'>
                <p className="font-semibold text-sm whitespace-nowrap">{player.name}</p>
                {isBanker && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <p className='text-xs text-primary font-mono flex items-center gap-1'><Coins size={12}/> {player.balance}</p>
        </div>
      </div>
    </div>
  );
};

const DiscardArea = ({ discards, position }: { discards: Tile[]; position: 'bottom' | 'right' | 'top' | 'left' }) => {
    const gridStyles = {
        bottom: 'grid-rows-3 grid-flow-col-dense',
        top: 'grid-rows-3 grid-flow-col-dense',
        left: 'grid-cols-3 grid-flow-row-dense',
        right: 'grid-cols-3 grid-flow-row-dense',
    };
    const positionClasses = {
        bottom: 'bottom-[calc(50%+1rem)] left-1/2 -translate-x-1/2 w-3/5',
        right: 'top-1/2 right-[calc(50%+1rem)] -translate-y-1/2 h-3/5',
        top: 'top-[calc(50%+1rem)] left-1/2 -translate-x-1/2 w-3/5',
        left: 'top-1/2 left-[calc(50%+1rem)] -translate-y-1/2 h-3/5'
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
                <div className={cn("bg-green-700 border-green-900", orientation === 'horizontal' ? 'w-4 h-6 border-b-2' : 'w-6 h-4 border-r-2')}></div>
                <div className={cn("bg-green-700 border-green-900 absolute top-0 left-0", orientation === 'horizontal' ? 'w-4 h-6 border-b-2 ml-px -mt-px' : 'w-6 h-4 border-r-2 mt-px -ml-px')}></div>
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
    const initialWallCount = 136;
    const tilesDealt = 52; // 13 tiles for 4 players
    const dealtWallCount = initialWallCount - tilesDealt - 1; // 1 for banker
    const tilesDrawn = dealtWallCount - wallCount;

    const getWallCounts = () => {
        let counts = { east: tilesPerSide, south: tilesPerSide, west: tilesPerSide, north: tilesPerSide };
        if (gameState === 'pre-roll') return counts;

        let tilesToRemove = (initialWallCount - wallCount);
        const startSide = bankerId === 0 ? 'south' : bankerId === 1 ? 'east' : bankerId === 2 ? 'north' : 'west';
        
        const sides: Array<keyof typeof counts> = ['east', 'south', 'west', 'north'];
        let currentSideIndex = sides.indexOf(startSide);

        while (tilesToRemove > 0) {
            const side = sides[currentSideIndex];
            const removable = counts[side];
            if (tilesToRemove >= removable) {
                tilesToRemove -= removable;
                counts[side] = 0;
            } else {
                counts[side] -= tilesToRemove;
                tilesToRemove = 0;
            }
            currentSideIndex = (currentSideIndex + 1) % 4; // Move to next player (counter-clockwise)
        }
        
        return counts;
    }

    const { east, south, west, north } = getWallCounts();

  return (
    <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative flex items-center justify-center">
        <div className="absolute inset-16 border-2 border-yellow-800/30 rounded" />
        
        {/* Walls */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2"><WallSegment count={north} orientation="horizontal" /></div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"><WallSegment count={south} orientation="horizontal" /></div>
        <div className="absolute left-8 top-1/2 -translate-y-1/2"><WallSegment count={west} orientation="vertical" /></div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2"><WallSegment count={east} orientation="vertical" /></div>
        
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
