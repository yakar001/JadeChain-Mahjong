
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

// SVG Components for Tiles

const Dot = ({ color = "text-blue-600", sizeClass = "w-2.5 h-2.5" }) => <div className={cn("rounded-full", color, sizeClass)} />;
const BambooStick = ({ color = "text-green-600", sizeClass = "w-1 h-4" }) => <div className={cn("rounded-sm", color, sizeClass)} />;

const TilePattern = ({ suit, value, size }: { suit: TileSuit, value: TileValue, size: 'md' | 'sm' }) => {
    const sizeClass = size === 'md' ? { dot: "w-3 h-3", bamboo: "w-1.5 h-5" } : { dot: "w-2 h-2", bamboo: "w-1 h-3" };
    const dotColor = "bg-blue-600";
    const bambooColor = "bg-green-600";
    const redColor = "bg-red-600";
    const greenColor = "bg-green-600";

    if (suit === 'dots') {
        const dots = Array.from({ length: parseInt(value, 10) }).map((_, i) => (
            <div key={i} className={cn("rounded-full", dotColor, sizeClass.dot)} />
        ));
        switch (value) {
            case '1': return <div className="w-full h-full flex justify-center items-center"><div className={cn("w-8 h-8 rounded-full border-4 border-green-600 flex justify-center items-center", size === 'sm' && "w-6 h-6 border-2")}><div className={cn("rounded-full bg-red-600", sizeClass.dot)} /></div></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{dots}</div>;
            case '3': return <div className="w-full h-full flex flex-col justify-between items-center p-1"><div className="self-start">{dots[0]}</div>{dots[1]}<div className="self-end">{dots[2]}</div></div>;
            case '4': return <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-1 gap-1">{dots}</div>;
            case '5': return <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1"><div className="col-start-1 row-start-1">{dots[0]}</div><div className="col-start-3 row-start-1">{dots[1]}</div><div className="col-start-2 row-start-2">{dots[2]}</div><div className="col-start-1 row-start-3">{dots[3]}</div><div className="col-start-3 row-start-3">{dots[4]}</div></div>;
            case '6': return <div className="w-full h-full flex justify-around"><div className="flex flex-col justify-around">{dots.slice(0,3)}</div><div className="flex flex-col justify-around">{dots.slice(3,6)}</div></div>;
            case '7': return <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1"><div className="col-start-1 row-start-1" style={{color: greenColor}}>{dots[0]}</div><div className="col-start-2 row-start-1" style={{color: greenColor}}>{dots[1]}</div><div className="col-start-3 row-start-1" style={{color: greenColor}}>{dots[2]}</div><div className="col-start-1 row-start-2">{dots[3]}</div><div className="col-start-3 row-start-2">{dots[4]}</div><div className="col-start-1 row-start-3">{dots[5]}</div><div className="col-start-3 row-start-3">{dots[6]}</div></div>;
            case '8': return <div className="w-full h-full flex justify-around"><div className="flex flex-col justify-around">{dots.slice(0,4)}</div><div className="flex flex-col justify-around">{dots.slice(4,8)}</div></div>;
            case '9': return <div className="w-full h-full flex justify-around"><div className="flex flex-col justify-around">{dots.slice(0,3)}</div><div className="flex flex-col justify-around">{dots.slice(3,6)}</div><div className="flex flex-col justify-around">{dots.slice(6,9)}</div></div>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const sticks = Array.from({ length: parseInt(value, 10) }).map((_, i) => {
            const isRed = (value === '5' && i === 2) || (value === '7' && i === 3) || (value === '9' && i === 4);
            const isBlue = (value === '5' && (i === 0 || i === 4));
            return <div key={i} className={cn("rounded-sm", bambooColor, sizeClass.bamboo, isRed && redColor, isBlue && dotColor )} />;
        });
        switch (value) {
            case '1': return <svg className={cn("w-10 h-10", size === 'sm' && "w-8 h-8")} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4CAF50"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#4CAF50"/><path d="M16.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7.5 8.5c-.83 0-1.5.67-1.5 1.5S6.67 11.5 7.5 11.5 9 10.83 9 10s-.67-1.5-1.5-1.5z" fill="#4CAF50"/><path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z" fill="#4CAF50"/></svg>;
            case '2': case '3': case '4': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{sticks}</div>;
            case '5': return <div className="w-full h-full flex justify-around items-center"><div className="flex flex-col justify-around h-3/5">{sticks.slice(0,2)}</div> {sticks[2]} <div className="flex flex-col justify-around h-3/5">{sticks.slice(3,5)}</div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{sticks.slice(0,3)}</div><div className="flex justify-around">{sticks.slice(3,6)}</div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-center">{sticks[0]}</div><div className="flex justify-around">{sticks.slice(1,4)}</div><div className="flex justify-around">{sticks.slice(4,7)}</div></div>
            case '8': return <div className="w-full h-full flex justify-around"><div className="flex flex-col justify-around">{sticks.slice(0,4)}</div><div className="flex flex-col justify-around">{sticks.slice(4,8)}</div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{sticks.slice(0,3)}</div><div className="flex justify-around">{sticks.slice(3,6)}</div><div className="flex justify-around">{sticks.slice(6,9)}</div></div>;
            default: return null;
        }
    }

    const symbolMap: Record<TileValue, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    const characterMap: Record<string, string> = { '1': '萬', '2': '萬', '3': '萬', '4': '萬', '5': '萬', '6': '萬', '7': '萬', '8': '萬', '9': '萬' };
    const baseFontSize = size === 'md' ? 'text-4xl' : 'text-2xl';
    
    if (suit === 'characters') {
        return <div className="flex flex-col items-center justify-between h-full p-1 font-bold"><span className={cn('text-red-600 self-end', size === 'md' ? 'text-xs' : 'text-[10px]')}>{symbolMap[value]}</span><span className={cn('text-black', baseFontSize)}>{characterMap[value]}</span></div>;
    }
    if (suit === 'wind') {
        return <span className={cn('font-bold', baseFontSize)}>{symbolMap[value]}</span>;
    }
    if (suit === 'dragon') {
        if (value === 'B') {
            return <div className={cn("w-4/5 h-4/5 border-4 border-blue-600 rounded", size === 'sm' && "border-2")} />;
        }
        const color = value === 'R' ? 'text-red-600' : 'text-green-600';
        return <span className={cn('font-bold', color, baseFontSize)}>{symbolMap[value]}</span>;
    }
    return null;
}

export function MahjongTile({ suit, value, className, size = 'md', isClickable = false, isGolden = false }: MahjongTileProps) {

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
      <div className="w-full h-full flex items-center justify-center">
        <TilePattern suit={suit} value={value} size={size} />
      </div>
    </div>
  );
}
