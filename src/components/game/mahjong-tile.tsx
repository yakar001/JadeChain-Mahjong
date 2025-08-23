
import { cn } from '@/lib/utils';
import React from 'react';

type TileSuit = 'bamboo' | 'dots' | 'characters' | 'wind' | 'dragon' | 'flower' | 'season';
type TileValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'E' | 'S' | 'W' | 'N' | 'R' | 'G' | 'B';

interface MahjongTileProps {
  suit: TileSuit;
  value: TileValue;
  className?: string;
  size?: 'md' | 'sm';
  isClickable?: boolean;
  isGolden?: boolean;
}

export function MahjongTile({ suit, value, className, size = 'md', isClickable = false, isGolden = false }: MahjongTileProps) {
  const symbolMap: Record<TileValue, string> = {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
    'E': '東', 'S': '南', 'W': '西', 'N': '北',
    'R': '中', 'G': '發', 'B': '白'
  };
  
  const characterMap: Record<string, string> = {
    '1': '萬', '2': '萬', '3': '萬', '4': '萬', '5': '萬', '6': '萬', '7': '萬', '8': '萬', '9': '萬'
  }

  const suitColor: Record<TileSuit, string> = {
    bamboo: 'text-green-700',
    dots: 'text-blue-700',
    characters: 'text-red-700',
    wind: 'text-gray-900',
    dragon: 'text-gray-900',
    flower: 'text-orange-600',
    season: 'text-teal-600',
  }
  
  const dragonColor: Record<string, string> = {
    'R': 'text-red-700',
    'G': 'text-green-700',
    'B': 'border-2 border-blue-600'
  }

  const renderContent = () => {
    if (suit === 'characters') {
      return (
        <div className="flex flex-col items-center justify-between h-full w-full p-1 text-center font-bold">
            <span className={cn('text-sm', size === 'sm' && 'hidden', suitColor[suit])}>{symbolMap[value]}</span>
            <span className={cn('text-3xl', size === 'sm' && 'text-xl', suitColor[suit])}>{characterMap[value]}</span>
        </div>
      )
    }
    if (suit === 'wind') {
      return <span className={cn('text-4xl font-bold', size === 'sm' && 'text-2xl', suitColor[suit])}>{symbolMap[value]}</span>;
    }
    if (suit === 'dragon') {
      return <span className={cn('text-4xl font-bold', size === 'sm' && 'text-2xl', dragonColor[value])}>{symbolMap[value]}</span>;
    }
    if(suit === 'dots') {
      return <div className="grid grid-cols-2 gap-0.5 w-full h-full p-1 items-center justify-items-center">
        {Array.from({ length: parseInt(value, 10) }).map((_, i) => (
          <div key={i} className={cn("bg-blue-700 rounded-full", size === 'md' ? 'w-3 h-3' : 'w-2 h-2')} />
        ))}
      </div>
    }
    if(suit === 'bamboo') {
      return <div className="flex flex-col items-center justify-center gap-0.5 h-full p-1">
        {Array.from({ length: parseInt(value, 10) }).map((_, i) => (
          <div key={i} className={cn("bg-green-700 rounded-sm", size === 'md' ? 'w-2 h-5' : 'w-1.5 h-3')} />
        ))}
      </div>
    }
    return null;
  };

  return (
    <div
      className={cn(
        'bg-stone-50 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400/80',
        'dark:bg-gradient-to-b from-stone-50 to-stone-200',
        size === 'md' ? 'w-14 h-20' : 'w-10 h-14',
        isClickable && 'transform transition-transform hover:-translate-y-2 cursor-pointer active:scale-95',
        isGolden && 'shadow-yellow-400/50 shadow-lg border-yellow-500 ring-2 ring-yellow-400',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center">{renderContent()}</div>
    </div>
  );
}
