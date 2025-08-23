
import { cn } from '@/lib/utils';
import { MahjongTile } from './mahjong-tile';

type Tile = { suit: string; value: string };

interface PlayerHandProps {
    hand: Tile[];
    onTileClick: (tileIndex: number) => void;
    canInteract: boolean;
    goldenTile: Tile | null;
    selectedTileIndex: number | null;
}

export function PlayerHand({ hand, onTileClick, canInteract, goldenTile, selectedTileIndex }: PlayerHandProps) {

  // Sort hand for better readability
  const sortOrder = ['dots', 'bamboo', 'characters', 'wind', 'dragon'];
  
  // Create an index map to handle clicks on the unsorted hand but render the sorted one
  const indexedHand = hand.map((tile, index) => ({ ...tile, originalIndex: index }));

  const sortedHand = [...indexedHand].sort((a, b) => {
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
          key={`${tile.suit}-${tile.value}-${index}`}
          onClick={() => onTileClick(tile.originalIndex)}
          disabled={!canInteract}
          className={cn(
              "disabled:cursor-not-allowed transform transition-transform duration-150",
              selectedTileIndex === tile.originalIndex ? "-translate-y-4" : "hover:-translate-y-2"
            )}
          aria-label={`Select ${tile.value} of ${tile.suit}`}
        >
          <MahjongTile 
            suit={tile.suit} 
            value={tile.value as any} 
            isClickable={canInteract}
            isGolden={isGolden(tile)}
          />
        </button>
      ))}
    </div>
  );
}

    