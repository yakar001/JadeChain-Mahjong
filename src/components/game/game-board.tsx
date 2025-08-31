
import { MahjongTile } from './mahjong-tile';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
}

const DiscardRow = ({ player, latestDiscard }: { player: Player | undefined; latestDiscard: Discard | null }) => {
    if (!player) return <div className="h-8" />; // Placeholder for missing player
    const wind = player.name.match(/\(([^)]+)\)/)?.[1] || '?';
    
    return (
        <div className="flex items-center w-full">
            <div className="w-10 text-center font-bold text-sm text-primary">{wind}</div>
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

const MeldRow = ({ player }: { player: Player | undefined }) => {
    if (!player) return <div className="h-8" />; // Placeholder for missing player
    const wind = player.name.match(/\(([^)]+)\)/)?.[1] || '?';
    
    return (
        <div className="flex items-center w-full">
            <div className="w-10 text-center font-bold text-sm text-primary">{wind}</div>
             <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex w-max space-x-2 p-1">
                    {player.melds.map((meld, i) => (
                    <div key={i} className="flex gap-px bg-background/50 p-0.5 rounded">
                        {meld.tiles.map((tile, j) => {
                            const isConcealed = meld.concealed && (j === 0 || j === 3);
                            return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed} />
                        })}
                    </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export function GameBoard({ players, wallCount, goldenTile, latestDiscard, activePlayerId }: GameBoardProps) {
    const playerEast = players.find(p => p.name.includes('(东)'));
    const playerSouth = players.find(p => p.name.includes('(南)'));
    const playerWest = players.find(p => p.name.includes('(西)'));
    const playerNorth = players.find(p => p.name.includes('(北)'));
    
    const orderedPlayers = [playerEast, playerSouth, playerWest, playerNorth];

    const TOTAL_TILES = 136;
    const tilesPerWall = TOTAL_TILES / 4;

    return (
        <div className="w-full h-full bg-green-900/80 rounded-lg p-2 flex flex-col gap-2">
            {/* Wall Area */}
            <div className="h-[25%] bg-black/20 rounded-md p-2 flex flex-col justify-center gap-1">
                {Array.from({ length: 4 }).map((_, wallIndex) => (
                    <div key={wallIndex} className="flex justify-center gap-0.5">
                        {Array.from({ length: tilesPerWall }).map((_, tileIndex) => {
                            const tileNumber = (wallIndex * tilesPerWall) + tileIndex;
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
            
            {/* Central Info and Discard/Meld Pool */}
            <div className="flex-grow bg-black/10 rounded-md p-2 flex flex-col relative">
                {/* Center Info Box */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-lg text-center text-white border border-amber-600/50 flex items-center justify-center gap-4 z-10">
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
                
                {/* Discard & Meld Container */}
                <div className="h-full flex flex-col justify-center gap-2">
                    {/* Discard Pool */}
                    <div className="space-y-1">
                        <p className="text-xs text-center font-semibold text-muted-foreground">弃牌区 (Discards)</p>
                        {orderedPlayers.map((player, index) => (
                            <DiscardRow key={index} player={player} latestDiscard={latestDiscard} />
                        ))}
                    </div>

                    <div className="border-t border-primary/20 my-1"></div>

                    {/* Meld Pool */}
                    <div className="space-y-1">
                        <p className="text-xs text-center font-semibold text-muted-foreground">明牌区 (Melds)</p>
                        {orderedPlayers.map((player, index) => (
                           <MeldRow key={index} player={player} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
