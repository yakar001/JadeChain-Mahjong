
import { MahjongTile } from './mahjong-tile';

type Tile = { suit: string; value: string };

interface PlayerHandProps {
    hand: Tile[];
    onDiscard: (tileIndex: number) => void;
    canDiscard: boolean;
    goldenTile: Tile | null;
}

export function PlayerHand({ hand, onDiscard, canDiscard, goldenTile }: PlayerHandProps) {

  // Sort hand for better readability
  const sortOrder = ['dots', 'bamboo', 'characters', 'wind', 'dragon'];
  const sortedHand = [...hand].sort((a, b) => {
    const suitA = sortOrder.indexOf(a.suit);
    const suitB = sortOrder.indexOf(b.suit);
    if (suitA !== suitB) {
      return suitA - suitB;
    }
    return a.value.localeCompare(b.value);
  });
  
  const isGolden = (tile: Tile) => {
      return goldenTile?.suit === tile.suit && goldenTile?.value === tile.value;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4 bg-background/50 rounded-lg min-h-[8rem]">
      {sortedHand.map((tile, index) => (
        <button
          key={index}
          onClick={() => onDiscard(index)}
          disabled={!canDiscard}
          className="disabled:cursor-not-allowed"
          aria-label={`Discard ${tile.value} of ${tile.suit}`}
        >
          <MahjongTile 
            suit={tile.suit} 
            value={tile.value as any} 
            isClickable={canDiscard}
            isGolden={isGolden(tile)}
          />
        </button>
      ))}
    </div>
  );
}
