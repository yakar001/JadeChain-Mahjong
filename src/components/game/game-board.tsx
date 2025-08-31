
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

const PlayerInfo = ({ player, isActive, isBanker, turnTimer, turnDuration, layoutConfig }: { player: Player; isActive: boolean, isBanker: boolean, turnTimer: number, turnDuration: number, layoutConfig: LayoutConfig['playerInfo'] }) => {
  const showTimer = isActive;

  return (
    <div className='flex items-center gap-2 z-10 p-1.5 bg-background/80 rounded-lg border-2'
        style={{ 
            width: `${layoutConfig.width}px`, 
            height: `${layoutConfig.height}px`,
            transform: `scale(${layoutConfig.scale})`,
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

const MeldsArea = ({ melds, layoutConfig }: { melds: Meld[], layoutConfig: LayoutConfig['meldsArea'] }) => {
    return (
        <div className="flex items-center justify-center gap-1 p-1 bg-background/80 rounded-lg"
            style={{
                width: `${layoutConfig.width}px`,
                height: `${layoutConfig.height}px`,
                transform: `scale(${layoutConfig.scale})`,
            }}
        >
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

const DiscardArea = ({ discards, latestDiscard, playerId, layoutConfig }: { discards: Tile[], latestDiscard: Discard | null, playerId: number, layoutConfig: LayoutConfig['discardArea'] }) => {
    return (
         <div className="relative bg-black/20 rounded grid grid-cols-6 grid-rows-4 gap-1 p-1"
             style={{
                width: `${layoutConfig.width}px`,
                height: `${layoutConfig.height}px`,
                transform: `scale(${layoutConfig.scale})`,
            }}
         >
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

export function GameBoard({ players, activePlayerId, wallCount, dice, gameState, bankerId, turnTimer, turnDuration, goldenTile, seatingRolls, onRollForSeating, onRollForBanker, onRollForStart, onRollForGolden, eastPlayerId, latestDiscard, layoutConfig }: GameBoardProps) {
    const playerSouth = players.find(p => p.name.includes('(南)'));
    const playerEast = players.find(p => p.name.includes('(东)'));
    const playerNorth = players.find(p => p.name.includes('(北)'));
    const playerWest = players.find(p => p.name.includes('(西)'));
    
  return (
    <div className="relative w-full aspect-[9/16] max-w-[50vh] mx-auto">
        <div className="absolute inset-0 bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-4" />
        
        {/* Player Areas Outside the Board */}
        <div className="absolute top-1/2 -left-4 -translate-x-full -translate-y-1/2 flex flex-col items-center gap-2">
            {playerWest && <PlayerInfo player={playerWest} isActive={activePlayerId === playerWest.id} isBanker={bankerId === playerWest.id} turnTimer={turnTimer} turnDuration={turnDuration} layoutConfig={layoutConfig.playerInfo} />}
        </div>
        <div className="absolute top-1/2 -right-4 translate-x-full -translate-y-1/2 flex flex-col items-center gap-2">
            {playerEast && <PlayerInfo player={playerEast} isActive={activePlayerId === playerEast.id} isBanker={bankerId === playerEast.id} turnTimer={turnTimer} turnDuration={turnDuration} layoutConfig={layoutConfig.playerInfo} />}
        </div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center gap-2">
            {playerNorth && <PlayerInfo player={playerNorth} isActive={activePlayerId === playerNorth.id} isBanker={bankerId === playerNorth.id} turnTimer={turnTimer} turnDuration={turnDuration} layoutConfig={layoutConfig.playerInfo} />}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center gap-2">
            {playerSouth && <PlayerInfo player={playerSouth} isActive={activePlayerId === playerSouth.id} isBanker={bankerId === playerSouth.id} turnTimer={turnTimer} turnDuration={turnDuration} layoutConfig={layoutConfig.playerInfo} />}
        </div>

        {/* Discard & Meld Areas on the board edge */}
        <div className="absolute inset-0 p-2">
            {playerSouth && <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><DiscardArea discards={playerSouth.discards} latestDiscard={latestDiscard} playerId={playerSouth.id} layoutConfig={layoutConfig.discardArea}/></div>}
            {playerNorth && <div className="absolute top-0 left-1/2 -translate-x-1/2 rotate-180"><DiscardArea discards={playerNorth.discards} latestDiscard={latestDiscard} playerId={playerNorth.id} layoutConfig={layoutConfig.discardArea}/></div>}
            {playerWest && <div className="absolute left-0 top-1/2 -translate-y-1/2 rotate-90"><DiscardArea discards={playerWest.discards} latestDiscard={latestDiscard} playerId={playerWest.id} layoutConfig={layoutConfig.discardArea}/></div>}
            {playerEast && <div className="absolute right-0 top-1/2 -translate-y-1/2 -rotate-90"><DiscardArea discards={playerEast.discards} latestDiscard={latestDiscard} playerId={playerEast.id} layoutConfig={layoutConfig.discardArea}/></div>}

            {playerSouth && <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2"><MeldsArea melds={playerSouth.melds} layoutConfig={layoutConfig.meldsArea} /></div>}
            {playerNorth && <div className="absolute top-[30%] left-1/2 -translate-x-1/2 rotate-180"><MeldsArea melds={playerNorth.melds} layoutConfig={layoutConfig.meldsArea} /></div>}
            {playerWest && <div className="absolute left-[25%] top-1/2 -translate-y-1/2 rotate-90"><MeldsArea melds={playerWest.melds} layoutConfig={layoutConfig.meldsArea} /></div>}
            {playerEast && <div className="absolute right-[25%] top-1/2 -translate-y-1/2 -rotate-90"><MeldsArea melds={playerEast.melds} layoutConfig={layoutConfig.meldsArea} /></div>}
        </div>
        
        {/* Center Info Box */}
        <div className={cn("absolute inset-0 flex items-center justify-center")}>
            <div className="bg-black/50 p-2 md:p-4 rounded-lg text-center text-white border-2 border-amber-600/50 flex flex-col items-center justify-center"
                 style={{
                    width: `${layoutConfig.wallCounter.width}px`,
                    height: `${layoutConfig.wallCounter.height}px`,
                    transform: `scale(${layoutConfig.wallCounter.scale})`,
                }}
            >
                <h2 className="text-sm font-bold text-yellow-400 font-headline tracking-widest">牌墙</h2>
                <div className='flex items-center justify-center gap-2 mt-1'>
                    <Layers className="w-4 h-4"/>
                    <div>
                        <p className="text-base font-bold">{wallCount}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Golden Tile Info */}
        {goldenTile && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 p-2 bg-background/80 rounded-lg"
                 style={{
                    width: `${layoutConfig.goldenTile.width}px`,
                    height: `${layoutConfig.goldenTile.height}px`,
                    transform: `translate(-120%, -120%) scale(${layoutConfig.goldenTile.scale})`, // Position top-left
                }}
            >
                <span className="text-xs text-muted-foreground">金牌 (Wild)</span>
                <MahjongTile suit={goldenTile.suit} value={goldenTile.value as any} size="md" isGolden />
            </div>
        )}

        {/* Dice Rolling Overlay */}
        {(gameState.startsWith('rolling') || gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
                {gameState.startsWith('rolling') && <DiceRoller dice={dice} rolling={true} />}
                {(gameState.startsWith('pre-roll') || gameState === 'banker-roll-for-golden') && <DiceRoller dice={[1,1]} rolling={false} />}
                
                {(gameState === 'pre-roll-seating' || (gameState === 'pre-roll-banker' && playerSouth?.isEast) || (gameState === 'pre-roll' && playerSouth?.id === bankerId) || (gameState === 'banker-roll-for-golden' && playerSouth?.id === bankerId)) && (
                    <div className="absolute bottom-[10%]">
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
