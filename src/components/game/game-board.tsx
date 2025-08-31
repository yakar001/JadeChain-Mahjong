
import { MahjongTile } from './mahjong-tile';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type Tile = { suit: string; value: string };
type Discard = { tile: Tile, playerId: number };
type Meld = { type: 'pong' | 'kong' | 'chow'; tiles: Tile[], concealed?: boolean };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; melds: Meld[]; balance: number; hasLocation: boolean | null; isEast?: boolean; discards: Tile[] };

interface GameBoardProps {
  players: Player[];
  wallCount: number;
  goldenTile: Tile | null;
  latestDiscard: Discard | null;
  activePlayerId: number | null;
  children: React.ReactNode;
}

const InfoRow = ({ label, children }: { label: string | React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="w-10 text-center font-bold text-sm text-primary flex-shrink-0 pt-1">{label}</div>
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-1 p-1">
            {children}
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
);


export function GameBoard({ players, wallCount, goldenTile, latestDiscard, activePlayerId, children }: GameBoardProps) {
    const playerEast = players.find(p => p.name.includes('(东)'));
    const playerSouth = players.find(p => p.name.includes('(南)'));
    const playerWest = players.find(p => p.name.includes('(西)'));
    const playerNorth = players.find(p => p.name.includes('(北)'));
    
    const orderedPlayers = [playerEast, playerSouth, playerWest, playerNorth];
    const playerWindMap: { [key: string]: Player | undefined } = {
        '东': playerEast,
        '南': playerSouth,
        '西': playerWest,
        '北': playerNorth,
    };

    const TOTAL_TILES = 136;
    
    return (
        <div className="w-full h-full bg-green-900/80 rounded-lg p-2 flex flex-col justify-between relative">
            {children}
            {/* Top Area: Wall */}
            <div className="h-[25%] bg-black/20 rounded-md p-2 flex flex-col justify-center gap-1">
                 {Array.from({ length: 4 }).map((_, wallIndex) => (
                    <div key={wallIndex} className="flex justify-center gap-0.5">
                        {Array.from({ length: TOTAL_TILES / 4 }).map((_, tileIndex) => {
                            const tileNumber = (wallIndex * (TOTAL_TILES / 4)) + tileIndex;
                            const isTaken = tileNumber < (TOTAL_TILES - wallCount);
                            return (
                                <div
                                    key={tileIndex}
                                    className={cn(
                                        "w-[1.2vw] h-[2.2vh] max-w-[9px] max-h-[15px] bg-green-700 rounded-sm transition-opacity",
                                        isTaken ? 'opacity-20' : 'opacity-100'
                                    )}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            
            {/* Center Area: Central Info & Discard/Meld Pool */}
            <div className="flex-grow bg-black/10 rounded-md p-2 flex flex-col relative justify-center gap-2 mt-2">
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 p-2 rounded-lg text-center text-white border border-amber-600/50 flex items-center justify-center gap-4 z-10">
                    <div className='flex items-center justify-center gap-1'>
                        <Layers className="w-4 h-4"/>
                        <p className="text-lg font-bold">{wallCount}</p>
                    </div>
                    {goldenTile && (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-muted-foreground">金:</span>
                            <MahjongTile suit={goldenTile.suit} value={goldenTile.value as any} size="sm" isGolden />
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col justify-center flex-grow space-y-2 pt-12">
                     <div>
                        <p className="text-xs text-center font-semibold text-muted-foreground mb-1">弃牌区 (Discards)</p>
                        {['东', '南', '西', '北'].map(wind => {
                            const player = playerWindMap[wind];
                            if (!player) return null;
                            return (
                                <InfoRow key={`discard-${wind}`} label={wind}>
                                {player.discards.map((tile, index) => (
                                    <MahjongTile
                                        key={index}
                                        suit={tile.suit}
                                        value={tile.value as any}
                                        size="sm"
                                        isLatestDiscard={latestDiscard?.playerId === player.id && index === player.discards.length - 1}
                                    />
                                ))}
                                </InfoRow>
                            );
                        })}
                     </div>

                    <Separator className="bg-primary/20" />

                     <div>
                        <p className="text-xs text-center font-semibold text-muted-foreground mb-1">明牌区 (Melds)</p>
                         {['东', '南', '西', '北'].map(wind => {
                            const player = playerWindMap[wind];
                            if (!player) return null;
                            return (
                                <InfoRow key={`meld-${wind}`} label={wind}>
                                    {player.melds.map((meld, i) => (
                                    <div key={i} className="flex gap-px bg-background/50 p-0.5 rounded ml-2">
                                        {meld.tiles.map((tile, j) => {
                                            const isConcealed = meld.concealed && (j === 0 || j === 3);
                                            return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed} />
                                        })}
                                    </div>
                                    ))}
                                </InfoRow>
                            );
                        })}
                     </div>
                </div>
            </div>
        </div>
    );
}

  