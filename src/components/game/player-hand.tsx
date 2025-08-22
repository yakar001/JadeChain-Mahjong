import { MahjongTile } from './mahjong-tile';

const playerHand = [
  { suit: 'bamboo', value: '1' },
  { suit: 'bamboo', value: '2' },
  { suit: 'bamboo', value: '3' },
  { suit: 'dots', value: '4' },
  { suit: 'dots', value: '5' },
  { suit: 'dots', value: '6' },
  { suit: 'characters', value: '7' },
  { suit: 'characters', value: '8' },
  { suit: 'characters', value: '9' },
  { suit: 'wind', value: 'W' },
  { suit: 'wind', value: 'W' },
  { suit: 'dragon', value: 'G' },
];

export function PlayerHand() {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-4 bg-background rounded-lg">
      {playerHand.map((tile, index) => (
        <MahjongTile key={index} suit={tile.suit} value={tile.value as any} />
      ))}
       <div className="w-4" />
      <MahjongTile suit="dragon" value="B" />
    </div>
  );
}
