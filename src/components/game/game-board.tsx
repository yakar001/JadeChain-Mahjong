
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Coins, MapPin, AlertTriangle, Layers, Dices } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '@/components/ui/button';
import type { LayoutConfig } from '@/app/game/page';

type Tile = { suit: string; value: string };
type Discard = { tile: Tile, playerId: number };
type Meld = { type: 'pong' | 'kong' | 'chow'; tiles: Tile[], concealed?: boolean };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; melds: Meld[]; balance: number; hasLocation: boolean | null; isEast?: boolean; discards: Tile[] };
type DiceRoll = [number, number];

interface GameBoardProps {
  players: Player[];
  activePlayerId: number | null;
  wallCount: number;
  dice: DiceRoll;
  gameState: 'pre-roll-seating' | 'rolling-seating' | 'pre-roll-banker' | 'rolling-banker' | 'pre-roll' | 'rolling' | 'deal' | 'playing' | 'banker-roll-for-golden' | 'game-over';
  bankerId: number | null;
  turnTimer: number;
  turnDuration: number;
  goldenTile: Tile | null;
  seatingRolls: (DiceRoll | null)[];
  onRollForSeating: () => void;
  onRollForBanker: () => void;
  onRollForStart: () => void;
  onRollForGolden: () => void;
  eastPlayerId: number | null;
  latestDiscard: Discard | null;
  layoutConfig: LayoutConfig;
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

const PlayerInfo = ({ player, isActive, isBanker, turnTimer, turnDuration }: { player: Player; isActive: boolean, isBanker: boolean, turnTimer: number, turnDuration: number }) => {
  const showTimer = isActive;

  return (
    <div className='flex items-center gap-2 z-10 p-1.5 bg-background/80 rounded-lg border-2'
        style={{ 
            borderColor: isActive ? 'hsl(var(--primary))' : 'transparent',
        }}
    >
        <Avatar className={cn('h-8 w-8')}>
        <AvatarImage src={player.avatar} />
        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={cn('transition-opacity duration-300 flex items-center gap-2', isActive ? 'opacity-100' : 'opacity-70')}>
        <div className='text-left'>
            <div className='flex items-center gap-1'>
                <p className="font-semibold text-xs whitespace-nowrap">{player.name}</p>
                {isBanker && <Crown className="w-3 h-3 text-yellow-500" />}
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger>
                        {player.hasLocation === true && <MapPin className="w-3 h-3 text-green-500" />}
                        {player.hasLocation === false && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        {player.hasLocation === null && <Loader2 className="w-3 h-3 animate-spin" />}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{player.hasLocation === true ? '已开启定位 (Location Enabled)' : player.hasLocation === false ? '未开启定位 (Location Disabled)' : '正在获取定位... (Getting location...)'}</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <p className='text-xs text-primary font-mono flex items-center gap-1'><Coins size={12}/> {player.balance}</p>
        </div>
        {showTimer && <TurnTimerCircle timer={turnTimer} duration={turnDuration} />}
        </div>
    </div>
  );
};

const MeldsArea = ({ melds }: { melds: Meld[] }) => {
    return (
        <div className="flex items-center justify-center gap-1 p-1 h-full w-full">
            {melds.length > 0 && melds.map((meld, i) => (
            <div key={i} className={cn("flex gap-px")}>
                {meld.tiles.map((tile, j) => {
                    const isConcealed = meld.concealed && (j === 0 || j === 3);
                    return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed} />
                })}
            </div>
            ))}
        </div>
    )
}

const DiscardArea = ({ discards, latestDiscard, playerId }: { discards: Tile[], latestDiscard: Discard | null, playerId: number }) => {
    return (
         <div className="relative bg-black/20 rounded grid grid-cols-6 grid-rows-3 gap-0.5 p-1 w-full h-full">
            {discards.map((tile, index) => (
                <div key={index} className={cn("relative flex items-center justify-center")}>
                    <MahjongTile 
                        suit={tile.suit} 
                        value={tile.value as any} 
                        size="sm"
                        isLatestDiscard={latestDiscard?.tile === tile && latestDiscard?.playerId === playerId}
                    />
                </div>
            ))}
        </div>
    );
}

const Dice = ({ value }: { value: number }) => {
    const Icon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][value - 1];
    return <Icon className="w-8 h-8 text-white" />;
}

const DiceRoller = ({ dice, rolling }: { dice: DiceRoll, rolling: boolean }) => {
    return (
        <div className="flex items-center justify-center gap-4">
            <div className={cn("transition-transform duration-500", rolling && "animate-dice-tumble")}>
                <Dice value={dice[0]} />
            </div>
            <div className={cn("transition-transform duration-500", rolling && "animate-dice-tumble [animation-delay:-0.2s]")}>
                 <Dice value={dice[1]} />
            </div>
        </div>
    );
}

const WallSegment = ({ count }: { count: number }) => {
    return (
        <div className="flex items-center justify-center gap-px -space-x-4">
            {Array.from({ length: count / 2 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                    <MahjongTile suit="bamboo" value="1" size="sm" isFaceDown />
                    <MahjongTile suit="bamboo" value="1" size="sm" isFaceDown />
                </div>
            ))}
        </div>
    )
}

export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration, goldenTile, seatingRolls, onRollForSeating, onRollForBanker, onRollForStart, onRollForGolden, eastPlayerId, latestDiscard }: GameBoardProps) {
    const playerSouth = players.find(p => p.name.includes('(南)'));
    const playerEast = players.find(p => p.name.includes('(东)'));
    const playerNorth = players.find(p => p.name.includes('(北)'));
    const playerWest = players.find(p => p.name.includes('(西)'));
    
    // Distribute wall tiles visually
    const baseWallTiles = Math.floor(wallCount / 4);
    const remainder = wallCount % 4;
    const wallSegments = {
        south: baseWallTiles + (remainder > 0 ? 1 : 0),
        east: baseWallTiles + (remainder > 1 ? 1 : 0),
        west: baseWallTiles + (remainder > 2 ? 1 : 0),
        north: baseWallTiles,
    }


  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
      {/* Player Info Areas (Outermost Layer) */}
      {playerSouth && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30"><PlayerInfo player={playerSouth} isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration} /></div>}
      {playerNorth && <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30"><PlayerInfo player={playerNorth} isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration} /></div>}
      {playerWest && <div className="absolute left-1 top-1/2 -translate-y-1/2 z-30"><PlayerInfo player={playerWest} isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration} /></div>}
      {playerEast && <div className="absolute right-1 top-1/2 -translate-y-1/2 z-30"><PlayerInfo player={playerEast} isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration} /></div>}
      
      <div className="relative w-[95vw] h-[95vw] max-w-[80vh] max-h-[80vh] bg-green-800/50 border-8 border-yellow-800/50 rounded-lg p-2 flex items-center justify-center">
        {/* Wall Layer */}
        <div className="absolute inset-[8%]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-8"><WallSegment count={wallSegments.south} /></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 rotate-180"><WallSegment count={wallSegments.north} /></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 -rotate-90"><WallSegment count={wallSegments.west} /></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 rotate-90"><WallSegment count={wallSegments.east} /></div>
        </div>

        {/* Discard Layer */}
        <div className="absolute inset-[18%]">
            {playerSouth && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/4"><DiscardArea discards={playerSouth.discards} latestDiscard={latestDiscard} playerId={playerSouth.id} /></div>}
            {playerNorth && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/4 rotate-180"><DiscardArea discards={playerNorth.discards} latestDiscard={latestDiscard} playerId={playerNorth.id} /></div>}
            {playerWest && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2/3 h-1/4 -rotate-90 origin-top-left" style={{ transform: 'rotate(90deg) translateY(-100%)' }}><DiscardArea discards={playerWest.discards} latestDiscard={latestDiscard} playerId={playerWest.id} /></div>}
            {playerEast && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2/3 h-1/4 rotate-90 origin-top-right" style={{ transform: 'rotate(-90deg) translateY(-100%)' }}><DiscardArea discards={playerEast.discards} latestDiscard={latestDiscard} playerId={playerEast.id} /></div>}
        </div>

         {/* Meld Layer */}
         <div className="absolute inset-[38%]">
            {playerSouth && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3"><MeldsArea melds={playerSouth.melds} /></div>}
            {playerNorth && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/3 rotate-180"><MeldsArea melds={playerNorth.melds} /></div>}
            {playerWest && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1/3 origin-center rotate-90"><MeldsArea melds={playerWest.melds} /></div>}
            {playerEast && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-1/3 origin-center -rotate-90"><MeldsArea melds={playerEast.melds} /></div>}
        </div>

        {/* Center Info Box */}
        <div className={cn("absolute inset-0 flex items-center justify-center")}>
            <div className="bg-black/50 p-2 rounded-lg text-center text-white border-2 border-amber-600/50 flex flex-col items-center justify-center gap-2 w-24 h-24">
                 {goldenTile && (
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-muted-foreground">金牌</span>
                        <MahjongTile suit={goldenTile.suit} value={goldenTile.value as any} size="sm" isGolden />
                    </div>
                )}
                <div className='flex items-center justify-center gap-1'>
                    <Layers className="w-3 h-3"/>
                    <p className="text-sm font-bold">{wallCount}</p>
                </div>
            </div>
        </div>

        {/* Dice Rolling Overlay */}
        {(gameState.startsWith('rolling') || gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                {gameState.startsWith('rolling') && <DiceRoller dice={dice} rolling={true} />}
                {(gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && <DiceRoller dice={[1,1]} rolling={false} />}
                
                {(gameState === 'pre-roll-seating' || (gameState === 'pre-roll-banker' && playerSouth?.isEast) || (gameState === 'pre-roll' && playerSouth?.id === bankerId) || (gameState === 'banker-roll-for-golden' && playerSouth?.id === bankerId)) && (
                    <div className="absolute bottom-[15%]">
                       <Button onClick={gameState === 'pre-roll-seating' ? onRollForSeating : gameState === 'pre-roll-banker' ? onRollForBanker : gameState === 'pre-roll' ? onRollForStart : onRollForGolden}><Dices className="mr-2"/>掷骰子</Button>
                   </div>
                )}
                {((gameState === 'pre-roll-banker' && !playerSouth?.isEast) || (gameState === 'pre-roll' && playerSouth?.id !== bankerId) || (gameState === 'banker-roll-for-golden' && playerSouth?.id !== bankerId)) && (
                    <p className='text-white mt-4 font-bold'>等待其他玩家掷骰子...</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

    