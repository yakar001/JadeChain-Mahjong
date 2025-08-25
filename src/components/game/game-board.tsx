
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Coins, MapPin, AlertTriangle, Layers, Dices, Compass } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

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
  isLandscape: boolean;
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


const PlayerInfo = ({ player, isActive, isBanker, turnTimer, turnDuration, goldenTile, orientation = 'horizontal' }: { player: Player; isActive: boolean, isBanker: boolean, turnTimer: number, turnDuration: number, goldenTile: Tile | null, orientation?: 'horizontal' | 'vertical' }) => {
  const showTimer = isActive;

  return (
    <div className={cn('flex items-center gap-2 z-10', orientation === 'vertical' ? 'flex-col' : 'flex-row')}>
      <div className="flex items-center gap-1 p-1 bg-background/80 rounded-lg">
        {player.melds.length > 0 && player.melds.map((meld, i) => (
          <div key={i} className="flex gap-px">
             {meld.tiles.map((tile, j) => {
                const isConcealed = meld.concealed && (j === 0 || j === 3);
                return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed} />
            })}
          </div>
        ))}
      </div>
      <div className={cn('flex items-center gap-2 p-2 bg-background/80 rounded-lg border-2', isActive ? 'border-primary' : 'border-transparent', orientation === 'vertical' ? 'flex-col' : 'flex-row')}>
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
      </div>
    </div>
  );
};

const DiscardArea = ({ discards, latestDiscard }: { discards: Tile[], latestDiscard: Discard | null }) => {
    return (
        <div className="relative grid grid-cols-8 gap-1 p-1 w-[14rem] h-[8.5rem]">
            {discards.map((tile, index) => {
                const isLatest = latestDiscard?.tile === tile && latestDiscard?.playerId === discards[index].playerId;
                return (
                    <div key={index} className="relative">
                        <MahjongTile 
                            suit={tile.suit} 
                            value={tile.value as any} 
                            size="sm"
                            isLatestDiscard={isLatest}
                        />
                    </div>
                );
            })}
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

export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration, goldenTile, seatingRolls, onRollForSeating, onRollForBanker, onRollForStart, onRollForGolden, eastPlayerId, isLandscape, latestDiscard }: GameBoardProps) {
    // Player positions are fixed: 0 is south (bottom), 1 is east (right), 2 is north (top), 3 is west (left)
    const playerSouth = players.find(p => p.id === 0);
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);
    
    const tilesPerSide = 34;
    const initialWallCount = 136 - 53; // After dealing 13 to each + 1 to banker
    
    const getWallCounts = () => {
        let counts = { east: tilesPerSide, south: tilesPerSide, west: tilesPerSide, north: tilesPerSide };
        if (gameState === 'pre-roll' || gameState === 'pre-roll-seating' || gameState === 'rolling-seating' || wallCount === 0 || wallCount > initialWallCount) return counts;

        let tilesToRemove = (initialWallCount - wallCount);
        
        const sideOrder: Array<keyof typeof counts> = ['east', 'south', 'west', 'north'];
        let startIndex = (bankerId !== null ? (bankerId + 1) % 4 : 0);
        
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
             startIndex = (startIndex + 1);
        }
        
        return counts;
    }

    const { east, south, west, north } = getWallCounts();

    const getRollButtonAction = () => {
        switch (gameState) {
            case 'pre-roll-seating': return onRollForSeating;
            case 'pre-roll-banker': return onRollForBanker;
            case 'pre-roll': return onRollForStart;
            case 'banker-roll-for-golden': return onRollForGolden;
            default: return () => {};
        }
    }
     const getRollButtonText = () => {
        switch (gameState) {
            case 'pre-roll-seating': return '掷骰子定座位';
            case 'pre-roll-banker': return '掷骰子定庄';
            case 'pre-roll': return '掷骰子开局';
            case 'banker-roll-for-golden': return '掷骰子开金';
            default: return '';
        }
    }

  return (
    <div className={cn("relative w-full aspect-square max-w-[80vh] mx-auto", isLandscape && "w-[80vh] h-[80vh] max-w-none max-h-none")}>
        {/* Player Info Areas */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform-gpu z-20">
            {playerSouth && <PlayerInfo player={playerSouth} isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile}/>}
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 transform-gpu origin-center -rotate-90 z-20">
            {playerEast && <PlayerInfo player={playerEast} isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} orientation="vertical" />}
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform-gpu z-20">
            {playerNorth && <PlayerInfo player={playerNorth} isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} />}
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 transform-gpu origin-center rotate-90 z-20">
            {playerWest && <PlayerInfo player={playerWest} isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration} goldenTile={goldenTile} orientation="vertical" />}
        </div>


        <div className={cn("absolute", isLandscape ? "inset-0" : "inset-[8%]")}>
            <div className={cn(
                "aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4 relative",
                 isLandscape && "bg-green-900/80 border-amber-700/80 [transform-style:preserve-3d] [transform:perspective(1000px)_rotateX(60deg)] w-full h-full"
            )}>
                
                {/* Walls */}
                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-full h-full flex justify-center">
                    <WallSegment count={north} orientation="horizontal" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-full flex justify-center">
                    <WallSegment count={south} orientation="horizontal" />
                </div>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-full h-full flex items-center justify-start">
                    <WallSegment count={west} orientation="vertical" />
                </div>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-full h-full flex items-center justify-end">
                    <WallSegment count={east} orientation="vertical" />
                </div>
                
                {/* Discard Areas */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[60%] h-[60%] relative">
                        {playerNorth && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center rotate-180">
                                <DiscardArea discards={playerNorth.discards} latestDiscard={latestDiscard?.playerId === playerNorth.id ? latestDiscard : null} />
                            </div>
                        )}
                        {playerWest && (
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 origin-center rotate-90">
                                <DiscardArea discards={playerWest.discards} latestDiscard={latestDiscard?.playerId === playerWest.id ? latestDiscard : null} />
                            </div>
                        )}
                        {playerEast && (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 origin-center -rotate-90">
                                <DiscardArea discards={playerEast.discards} latestDiscard={latestDiscard?.playerId === playerEast.id ? latestDiscard : null} />
                            </div>
                        )}
                        {playerSouth && (
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 origin-center">
                                <DiscardArea discards={playerSouth.discards} latestDiscard={latestDiscard?.playerId === playerSouth.id ? latestDiscard : null} />
                            </div>
                        )}

                        {/* Center Info Box */}
                        <div className={cn("absolute inset-0 flex items-center justify-center", isLandscape && "[transform:rotateX(-60deg)_translateZ(-50px)]")}>
                            <div className="bg-black/50 p-2 md:p-4 rounded-lg text-center text-white border-2 border-amber-600/50">
                                {isLandscape ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-yellow-400 font-headline tracking-widest" style={{textShadow: '0 0 5px #fde047, 0 0 10px #fde047'}}>游金</h2>
                                        <p className="text-xs font-mono uppercase tracking-wider text-yellow-200/80">ya-kar</p>
                                    </>
                                ) : (
                                    <h2 className="text-sm font-bold text-yellow-400 font-headline tracking-widest">牌墙</h2>
                                )}
                                <div className='flex items-center justify-center gap-2 md:gap-4 mt-2'>
                                    <Layers className="w-4 h-4 md:w-8 md:h-8"/>
                                    <div>
                                        <p className="text-base md:text-lg font-bold">{wallCount}</p>
                                        <p className="text-xs">剩余</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                {/* Dice Rolling Overlay */}
                {(gameState.startsWith('rolling') || gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && (
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 col-span-3 row-span-3">
                         {gameState.startsWith('rolling') && <DiceRoller dice={dice} rolling={true} />}
                         {gameState.startsWith('pre-roll') && <DiceRoller dice={[1,1]} rolling={false} />}
                         {gameState === 'banker-roll-for-golden' && <DiceRoller dice={[1,1]} rolling={false} />}
                         
                         {gameState === 'pre-roll-seating' && (
                             <div className="absolute bottom-[10%]">
                                <Button onClick={onRollForSeating}><Dices className="mr-2"/>{getRollButtonText()}</Button>
                            </div>
                         )}
                         {gameState === 'pre-roll-banker' && playerSouth?.isEast && (
                             <div className="absolute bottom-[10%]">
                                <Button onClick={onRollForBanker}><Dices className="mr-2"/>{getRollButtonText()}</Button>
                            </div>
                         )}
                          {gameState === 'pre-roll-banker' && !playerSouth?.isEast && (
                             <p className='text-white mt-4 font-bold'>等待东风位玩家掷骰子...</p>
                         )}
                         {gameState === 'pre-roll' && playerSouth?.id === bankerId && (
                             <div className="absolute bottom-[10%]">
                                <Button onClick={onRollForStart}><Dices className="mr-2"/>{getRollButtonText()}</Button>
                            </div>
                         )}
                         {gameState === 'pre-roll' && playerSouth?.id !== bankerId && (
                              <p className='text-white mt-4 font-bold'>等待庄家掷骰子...</p>
                         )}
                         {gameState === 'banker-roll-for-golden' && playerSouth?.id === bankerId && (
                              <div className="absolute bottom-[10%]">
                                <Button onClick={onRollForGolden}><Crown className="mr-2 text-yellow-400"/>{getRollButtonText()}</Button>
                            </div>
                         )}
                          {gameState === 'banker-roll-for-golden' && playerSouth?.id !== bankerId && (
                              <p className='text-white mt-4 font-bold'>等待庄家掷骰子开金...</p>
                         )}
                     </div>
                 )}
            </div>
        </div>
    </div>
  );
}
