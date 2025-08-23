import { cn } from '@/lib/utils';
import React from 'react';

type TileSuit = 'bamboo' | 'dots' | 'characters' | 'wind' | 'dragon' | 'flower' | 'season';
type TileValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'E' | 'S' | 'W' | 'N' | 'R' | 'G' | 'B';

interface MahjongTileProps {
  suit: TileSuit;
  value: TileValue;
  className?: string;
}

export function MahjongTile({ suit, value, className }: MahjongTileProps) {
  const symbolMap: Record<TileValue, string> = {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
    'E': '東', 'S': '南', 'W': '西', 'N': '北',
    'R': '中', 'G': '發', 'B': '白'
  };
  
  const characterMap: Record<string, string> = {
    '1': '壹', '2': '貳', '3': '叄', '4': '肆', '5': '伍', '6': '陸', '7': '柒', '8': '捌', '9': '萬'
  }

  const suitColor: Record<TileSuit, string> = {
    bamboo: 'text-green-600',
    dots: 'text-blue-600',
    characters: 'text-red-600',
    wind: 'text-gray-800 dark:text-gray-200',
    dragon: 'text-gray-800 dark:text-gray-200',
    flower: 'text-orange-500',
    season: 'text-teal-500',
  }
  
  const dragonColor: Record<string, string> = {
    'R': 'text-red-600',
    'G': 'text-green-600',
    'B': 'border-2 border-blue-500'
  }

  const renderContent = () => {
    if (suit === 'characters') {
      return (
        <div className="flex flex-col items-center justify-between h-full w-full p-1 text-center">
            <span className={cn('text-xs font-bold', suitColor[suit])}>{symbolMap[value]}</span>
            <span className={cn('text-2xl font-bold', suitColor[suit])}>{characterMap[value]}</span>
        </div>
      )
    }
    if (suit === 'wind') {
      return <span className={cn('text-3xl font-bold', suitColor[suit])}>{symbolMap[value]}</span>;
    }
    if (suit === 'dragon') {
      return <span className={cn('text-3xl font-bold', dragonColor[value])}>{symbolMap[value]}</span>;
    }
    if(suit === 'dots') {
      return <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 items-center">
        {Array.from({ length: parseInt(value, 10) }).map((_, i) => (
          <div key={i} className="bg-blue-600 rounded-full w-2 h-2 mx-auto" />
        ))}
      </div>
    }
    if(suit === 'bamboo') {
      return <div className="flex flex-col items-center justify-center gap-0.5 h-full p-1">
        {Array.from({ length: parseInt(value, 10) }).map((_, i) => (
          <div key={i} className="bg-green-600 rounded-sm w-1 h-3" />
        ))}
      </div>
    }
    return null;
  };

  return (
    <div
      className={cn(
        'w-12 h-16 bg-stone-100 dark:bg-stone-200 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400 transform transition-transform hover:-translate-y-1',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center">{renderContent()}</div>
    </div>
  );
}
