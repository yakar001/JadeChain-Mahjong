import { MahjongTile } from './mahjong-tile';

const discardedTiles = [
  { suit: 'dots', value: '3' },
  { suit: 'bamboo', value: '7' },
  { suit: 'characters', value: '9' },
  { suit: 'wind', value: 'E' },
  { suit: 'dragon', value: 'R' },
  { suit: 'dots', value: '5' },
  { suit: 'bamboo', value: '2' },
];

export function GameBoard() {
  return (
    <div className="bg-card-foreground/10 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
      <div className="grid grid-cols-7 gap-2">
        {discardedTiles.map((tile, index) => (
          <MahjongTile key={index} suit={tile.suit} value={tile.value as any} />
        ))}
        <div className="w-12 h-16 bg-background/50 rounded-md flex items-center justify-center text-muted-foreground italic text-sm">
          Opponent's turn...
        </div>
      </div>
    </div>
  );
}
