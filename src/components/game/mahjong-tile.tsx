
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
        const dots = (count: number, color: string) => Array.from({ length: count }).map((_, i) => (
            <div key={i} className={cn("rounded-full", color, sizeClass.dot)} />
        ));
        switch (value) {
            case '1': return <div className="w-full h-full flex justify-center items-center"><div className={cn("w-8 h-8 rounded-full border-4 border-green-600 flex justify-center items-center", size === 'sm' && "w-6 h-6 border-2")}><div className={cn("rounded-full bg-red-600", sizeClass.dot)} /></div></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{dots(1, redColor)}{dots(1, greenColor)}</div>;
            case '3': return <div className="w-full h-full flex flex-col justify-between items-center p-1"><div className="self-start">{dots(1, redColor)}</div>{dots(1, dotColor)}<div className="self-end">{dots(1, greenColor)}</div></div>;
            case '4': return <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-1 gap-1">{dots(2, dotColor)}{dots(2, greenColor)}</div>;
            case '5': return <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1"><div className="col-start-1 row-start-1">{dots(1, redColor)}</div><div className="col-start-3 row-start-1">{dots(1, greenColor)}</div><div className="col-start-2 row-start-2">{dots(1, dotColor)}</div><div className="col-start-1 row-start-3">{dots(1, greenColor)}</div><div className="col-start-3 row-start-3">{dots(1, redColor)}</div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{dots(2, redColor)}</div><div className="flex justify-around">{dots(4, greenColor)}</div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-between -mb-1"><div className="translate-x-1">{dots(1, greenColor)}</div><div className="-translate-y-1">{dots(1, greenColor)}</div><div className="-translate-x-1">{dots(1, greenColor)}</div></div><div className="flex justify-around">{dots(2, redColor)}</div><div className="flex justify-around">{dots(2, redColor)}</div></div>;
            case '8': return <div className="w-full h-full flex flex-col justify-around p-1">{dots(8, dotColor).map((d, i) => <div key={i} className='h-full flex items-center'>{d}</div>).reduce((acc, el, i) => { if (i % 2 === 0) { acc.push([el]); } else { acc[acc.length - 1].push(el); } return acc; }, [] as JSX.Element[][]).map((pair, i) => <div key={i} className="flex justify-around">{pair}</div>)}</div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-around">{dots(3, redColor)}</div><div className="flex justify-around">{dots(3, greenColor)}</div><div className="flex justify-around">{dots(3, dotColor)}</div></div>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const sticks = Array.from({ length: parseInt(value, 10) }).map((_, i) => (
             <div key={i} className={cn("rounded-sm", bambooColor, sizeClass.bamboo )} />
        ));
        switch (value) {
            case '1': return <svg className={cn("w-10 h-10", size === 'sm' && "w-8 h-8")} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#508a38" d="M512 512m-384 0a384 384 0 1 0 768 0 384 384 0 1 0-768 0Z"></path><path fill="#fff" d="M512 512m-292.266667 0a292.266667 292.266667 0 1 0 584.533334 0 292.266667 292.266667 0 1 0-584.533334 0Z"></path><path fill="#508a38" d="M512 512m-256 0a256 256 0 1 0 512 0 256 256 0 1 0-512 0Z"></path><path fill="#fff" d="M682.666667 554.666667c0 94.293333-76.373333 170.666667-170.666667 170.666666s-170.666667-76.373333-170.666667-170.666666c0-62.293333 33.28-116.906667 83.2-145.92l42.666667-29.013334h89.6l42.666667 29.013334c49.92 29.013333 83.2 83.626667 83.2 145.92z"></path><path fill="#508a38" d="M512 546.133333c-20.48 0-39.253333-4.266667-56.32-12.8l-42.666667-20.48V480h2.133334c34.133333 0 65.28 11.093333 90.453333 30.293333l20.48 15.36 20.48-15.36c25.173333-19.2 56.32-30.293333 90.453333-30.293334h2.133334v32.853334l-42.666667 20.48c-17.066667 8.533333-35.84 12.8-56.32 12.8z m-85.333333-134.826666v53.333333a179.2 179.2 0 0 0 57.173333 124.586667l28.16 21.333333 28.16-21.333333a179.2 179.2 0 0 0 57.173333-124.586667V411.306667h-23.893333c-30.293333 0-58.88 9.386667-81.493333 26.026666l-5.12 4.266667-5.12-4.266667c-22.613333-16.64-51.2-26.026667-81.493334-26.026666H426.666667z"></path></svg>;
            case '2': case '3': case '4': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{sticks}</div>;
            case '5': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-around">{sticks.slice(0,2)}</div><div className="flex justify-center"><div className={cn(sizeClass.bamboo, redColor)} /></div><div className="flex justify-around">{sticks.slice(3,5)}</div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{sticks.slice(0,3)}</div><div className="flex justify-around">{sticks.slice(3,6)}</div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-center"><div className={cn(sizeClass.bamboo, redColor)} /></div><div className="flex justify-around">{sticks.slice(1,4)}</div><div className="flex justify-around">{sticks.slice(4,7)}</div></div>
            case '8': return <div className="w-full h-full flex flex-col justify-center items-center gap-1.5"><div className="flex gap-4"><div className={cn(sizeClass.bamboo, "rotate-45")}/><div className={cn(sizeClass.bamboo, "-rotate-45")}/></div><div className="flex gap-2"><div className={cn(sizeClass.bamboo, "-rotate-45")}/><div className={cn(sizeClass.bamboo, "rotate-45")}/></div><div className="flex gap-4"><div className={cn(sizeClass.bamboo, "rotate-45")}/><div className={cn(sizeClass.bamboo, "-rotate-45")}/></div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{sticks.slice(0,3)}</div><div className="flex justify-around">{sticks.slice(3,6)}</div><div className="flex justify-around">{sticks.slice(6,9)}</div></div>;
            default: return null;
        }
    }

    const symbolMap: Record<TileValue, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    const characterMap: Record<string, string> = { '1': '萬', '2': '萬', '3': '萬', '4': '萬', '5': '萬', '6': '萬', '7': '萬', '8': '萬', '9': '萬' };
    const baseFontSize = size === 'md' ? 'text-4xl' : 'text-2xl';
    
    if (suit === 'characters') {
        return <div className="flex flex-col items-center justify-center h-full p-1 font-bold font-headline"><span className={cn('text-black', size === 'md' ? 'text-xl' : 'text-lg')}>{symbolMap[value]}</span><span className={cn('text-red-600', baseFontSize)}>{characterMap[value]}</span></div>;
    }
    if (suit === 'wind') {
        return <span className={cn('font-bold font-headline text-black', baseFontSize)}>{symbolMap[value]}</span>;
    }
    if (suit === 'dragon') {
        if (value === 'B') {
            return <div className={cn("w-4/5 h-4/5 border-4 border-blue-600 rounded", size === 'sm' && "border-2")} />;
        }
        const color = value === 'R' ? 'text-red-600' : 'text-green-600';
        return <span className={cn('font-bold font-headline', color, baseFontSize)}>{symbolMap[value]}</span>;
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
