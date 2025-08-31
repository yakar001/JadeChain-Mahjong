
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

const DiscardRow = ({ player, latestDiscard, orientation = 'horizontal' }: { player: Player | undefined; latestDiscard: Discard | null, orientation?: 'horizontal' | 'vertical' }) => {
    if (!player) return <div className="h-8" />; 
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
                             className={cn(
                                orientation === 'vertical-left' && 'transform rotate-90',
                                orientation === 'vertical-right' && 'transform -rotate-90',
                                orientation === 'horizontal-top' && 'transform rotate-180'
                            )}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

const MeldRow = ({ player, orientation = 'horizontal' }: { player: Player | undefined, orientation?: 'horizontal' | 'vertical' }) => {
    if (!player) return <div className="h-8" />; 
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
                            return <MahjongTile key={j} suit={tile.suit} value={tile.value as any} size="sm" isFaceDown={isConcealed}  className={cn(
                                orientation === 'vertical-left' && 'transform rotate-90',
                                orientation === 'vertical-right' && 'transform -rotate-90',
                                orientation === 'horizontal-top' && 'transform rotate-180'
                            )} />
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
        <div className="w-full h-full bg-green-900/80 rounded-lg p-2 flex flex-col justify-between">
            {/* Top Wall Area */}
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
            <div className="flex-grow bg-black/10 rounded-md p-2 flex flex-col relative justify-center gap-2">
                
                {/* Discard & Meld Container */}
                <div className="space-y-1">
                    <p className="text-xs text-center font-semibold text-muted-foreground">弃牌区 (Discards)</p>
                    <DiscardRow player={playerEast} latestDiscard={latestDiscard} orientation="vertical-right" />
                    <DiscardRow player={playerSouth} latestDiscard={latestDiscard} orientation="horizontal" />
                    <DiscardRow player={playerWest} latestDiscard={latestDiscard} orientation="vertical-left" />
                    <DiscardRow player={playerNorth} latestDiscard={latestDiscard} orientation="horizontal-top" />
                </div>

                <div className="border-t border-primary/20 my-1"></div>

                <div className="space-y-1">
                    <p className="text-xs text-center font-semibold text-muted-foreground">明牌区 (Melds)</p>
                    <MeldRow player={playerEast} orientation="vertical-right" />
                    <MeldRow player={playerSouth} orientation="horizontal" />
                    <MeldRow player={playerWest} orientation="vertical-left" />
                    <MeldRow player={playerNorth} orientation="horizontal-top" />
                </div>
            </div>
        </div>
    );
}

    