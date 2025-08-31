
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Loader2, Coins, MapPin, AlertTriangle, Layers, Dices } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
    <div className={cn('flex items-center gap-2 z-10 p-1.5 bg-background/80 rounded-lg border-2')}
        style={{ 
            borderColor: isActive ? 'hsl(var(--primary))' : 'transparent',
        }}
    >
        <Avatar className='h-8 w-8'>
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
        <div className="flex items-center justify-start gap-1 p-1 h-full w-full">
            {melds.length > 0 && melds.map((meld, i) => (
            <div key={i} className="flex gap-px">
                {meld.tiles.map((tile, j) => {
                    const isConcealed = meld.concealed && (j === 0 || j === 3);
                    return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed} />
                })}
            </div>
            ))}
        </div>
    )
}

const DiscardRow = ({ player, latestDiscard }: { player: Player; latestDiscard: Discard | null }) => {
    const wind = player.name.split(' ')[2]?.replace(/[()]/g, '');
    return (
        <div className="flex items-center w-full">
            <div className="w-10 text-center font-bold text-sm text-muted-foreground">{wind}</div>
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex w-max space-x-1 p-1">
                    {player.discards.map((tile, index) => (
                        <MahjongTile
                            key={index}
                            suit={tile.suit}
                            value={tile.value as any}
                            size="sm"
                            isLatestDiscard={latestDiscard?.playerId === player.id && index === player.discards.length - 1}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration, goldenTile, seatingRolls, onRollForSeating, onRollForBanker, onRollForStart, onRollForGolden, latestDiscard }: GameBoardProps) {
    const playerSouth = players.find(p => p.name.includes('(南)'));
    const playerEast = players.find(p => p.name.includes('(东)'));
    const playerNorth = players.find(p => p.name.includes('(北)'));
    const playerWest = players.find(p => p.name.includes('(西)'));

    const orderedPlayers = [playerEast, playerSouth, playerWest, playerNorth].filter(Boolean) as Player[];

    const TOTAL_TILES = 136;
    const tilesPerWall = TOTAL_TILES / 4;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
      {/* Player Info Areas (Top and Bottom) */}
      <div className="w-full flex justify-between items-start z-10">
        {playerWest && <PlayerInfo player={playerWest} isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration} />}
        {playerNorth && <PlayerInfo player={playerNorth} isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration} />}
        {playerEast && <PlayerInfo player={playerEast} isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration} />}
      </div>
      
      {/* Game Table */}
      <div className="relative w-full h-[70vh] max-h-[800px] bg-green-800/50 border-8 border-yellow-800/50 rounded-lg flex flex-col items-center justify-between p-2">
        
        {/* Visual Wall Area */}
        <div className="w-full h-[35%] bg-black/20 rounded-t-md p-2 flex flex-col justify-center gap-1">
            {Array.from({ length: 4 }).map((_, wallIndex) => (
                <div key={wallIndex} className="flex justify-center gap-0.5">
                    {Array.from({ length: tilesPerWall }).map((_, tileIndex) => {
                         const tileNumber = (wallIndex * tilesPerWall) + tileIndex;
                         const isTaken = tileNumber < (TOTAL_TILES - wallCount);
                         return (
                            <div
                                key={tileIndex}
                                className={cn(
                                    "w-[1.1vw] h-[2vh] max-w-[8px] max-h-[14px] bg-green-700 rounded-sm transition-opacity",
                                    isTaken ? 'opacity-20' : 'opacity-100'
                                )}
                            />
                         )
                    })}
                </div>
            ))}
        </div>

        {/* Central Discard Pool */}
        <div className="w-full h-[65%] bg-black/10 rounded-b-md p-2 flex flex-col items-center justify-start relative">
             {/* Center Info Box */}
            <div className="bg-black/50 p-2 rounded-lg text-center text-white border-2 border-amber-600/50 flex items-center justify-center gap-4 mb-2">
                <div className='flex items-center justify-center gap-1'>
                    <Layers className="w-4 h-4"/>
                    <p className="text-lg font-bold">{wallCount}</p>
                </div>
                 {goldenTile && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">金牌:</span>
                        <MahjongTile suit={goldenTile.suit} value={goldenTile.value as any} size="sm" isGolden />
                    </div>
                )}
            </div>
            
            <div className="w-full flex-grow space-y-1">
                 {orderedPlayers.map(player => (
                    <DiscardRow key={player.id} player={player} latestDiscard={latestDiscard} />
                 ))}
            </div>
        </div>

        {/* Player Melds */}
         <div className="absolute top-0 right-full mr-2 w-48 h-full flex flex-col justify-center">
            {playerWest && <MeldsArea melds={playerWest.melds} />}
        </div>
        <div className="absolute top-0 left-full ml-2 w-48 h-full flex flex-col justify-center">
            {playerEast && <MeldsArea melds={playerEast.melds} />}
        </div>
        <div className="absolute bottom-full mb-2 w-full h-12 flex justify-center">
            {playerNorth && <MeldsArea melds={playerNorth.melds} />}
        </div>
      </div>
       <div className="w-full flex justify-between items-end z-10">
          {playerSouth && <PlayerInfo player={playerSouth} isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration} />}
          {playerSouth && <div className="w-48 h-12"><MeldsArea melds={playerSouth.melds} /></div>}
      </div>

       {/* Dice Rolling Overlay */}
        {(gameState.startsWith('rolling') || gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                 {gameState.startsWith('rolling') && <div><Dices className="w-16 h-16 text-white animate-pulse" /></div>}
                
                {(gameState === 'pre-roll-seating' || (gameState === 'pre-roll-banker' && playerSouth?.isEast) || (gameState === 'pre-roll' && playerSouth?.id === bankerId) || (gameState === 'banker-roll-for-golden' && playerSouth?.id === bankerId)) && (
                    <div className="absolute bottom-[20%]">
                       <Button onClick={gameState === 'pre-roll-seating' ? onRollForSeating : gameState === 'pre-roll-banker' ? onRollForBanker : gameState === 'pre-roll' ? onRollForStart : onRollForGolden}><Dices className="mr-2"/>掷骰子</Button>
                   </div>
                )}
                {((gameState === 'pre-roll-banker' && !playerSouth?.isEast) || (gameState === 'pre-roll' && playerSouth?.id !== bankerId) || (gameState === 'banker-roll-for-golden' && playerSouth?.id !== bankerId)) && (
                    <p className='text-white mt-4 font-bold'>等待其他玩家掷骰子...</p>
                )}
            </div>
        )}
    </div>
  );
}

