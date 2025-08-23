
import { MahjongTile } from './mahjong-tile';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Tile = { suit: string; value: string };
type Player = { id: number; name: string; avatar: string; hand: Tile[]; discards: Tile[] };

interface GameBoardProps {
  players: Player[];
  activePlayerId: number;
}

const PlayerInfo = ({ player, position, isActive }: { player: Player; position: 'bottom' | 'right' | 'top' | 'left', isActive: boolean }) => {
  const positionClasses = {
    bottom: 'bottom-0 left-1/2 -translate-x-1/2',
    right: 'top-1/2 right-0 -translate-y-1/2 -rotate-90',
    top: 'top-0 left-1/2 -translate-x-1/2 rotate-180',
    left: 'top-1/2 left-0 -translate-y-1/2 rotate-90'
  };

  return (
    <div className={cn('absolute flex items-center gap-2 p-2 bg-background/80 rounded-lg transform', positionClasses[position])}>
      <Avatar className={cn('h-8 w-8 border-2', isActive ? 'border-primary' : 'border-transparent')}>
        <AvatarImage src={player.avatar} />
        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className={cn('transition-opacity duration-300', isActive ? 'opacity-100' : 'opacity-70')}>
        <p className="font-semibold text-sm whitespace-nowrap">{player.name}</p>
      </div>
    </div>
  );
};


export function GameBoard({ players, activePlayerId }: GameBoardProps) {
    const playerSouth = players.find(p => p.id === 0);
    const playerEast = players.find(p => p.id === 1);
    const playerNorth = players.find(p => p.id === 2);
    const playerWest = players.find(p => p.id === 3);

    const allDiscards = players.flatMap(p => p.discards);

  return (
    <div className="aspect-square bg-green-800/50 border-4 border-yellow-800/50 rounded-lg p-10 relative flex items-center justify-center">
        <div className="absolute inset-8 border-2 border-yellow-800/30 rounded" />
        <p className="text-6xl font-bold text-yellow-800/20 select-none">泉</p>
        
        {/* Player Areas */}
        {playerSouth && <PlayerInfo player={playerSouth} position="bottom" isActive={activePlayerId === playerSouth.id} />}
        {playerEast && <PlayerInfo player={playerEast} position="right" isActive={activePlayerId === playerEast.id} />}
        {playerNorth && <PlayerInfo player={playerNorth} position="top" isActive={activePlayerId === playerNorth.id} />}
        {playerWest && <PlayerInfo player={playerWest} position="left" isActive={activePlayerId === playerWest.id} />}

        {/* Discard Pool */}
        <div className="w-3/5 h-3/5 grid grid-cols-8 grid-rows-4 gap-1 p-2 bg-black/10 rounded">
            {allDiscards.map((tile, index) => (
                <MahjongTile key={index} suit={tile.suit} value={tile.value as any} size="sm" />
            ))}
        </div>
    </div>
  );
}
