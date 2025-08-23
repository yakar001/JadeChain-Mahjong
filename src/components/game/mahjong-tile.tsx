
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

const Dot = ({ color = "bg-blue-600", sizeClass = "w-2.5 h-2.5" }) => <div className={cn("rounded-full", color, sizeClass)} />;
const BambooStick = ({ color = "bg-green-600", sizeClass = "w-1 h-4" }) => <div className={cn("rounded-sm", color, sizeClass)} />;

const TilePattern = ({ suit, value, size }: { suit: TileSuit, value: TileValue, size: 'md' | 'sm' }) => {
    const sizeClass = size === 'md' ? { dot: "w-3 h-3", bamboo: "w-1.5 h-5" } : { dot: "w-[1vw] h-[1vw] max-w-[0.5rem] max-h-[0.5rem]", bamboo: "w-1 h-3" };
    const dotColor = "bg-blue-600";
    const bambooColor = "bg-green-600";
    const redColor = "bg-red-600";
    const greenColor = "bg-green-600";
    const blueColor = "bg-blue-600";

    if (suit === 'dots') {
        const dots = (count: number, color: string) => Array.from({ length: count }).map((_, i) => (
            <div key={i} className={cn("rounded-full", color, sizeClass.dot)} />
        ));
        switch (value) {
            case '1': return <div className={cn("w-10 h-10 flex justify-center items-center", size === 'sm' ? "w-full h-full p-1" : "p-2")}><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#d1e4c1" stroke="#508a38" strokeWidth="2" /><circle cx="50" cy="50" r="30" fill="none" stroke="#508a38" strokeWidth="1" strokeDasharray="4" /><circle cx="50" cy="50" r="22" fill="#f4c3c3" stroke="#c04848" strokeWidth="1.5" /><circle cx="50" cy="50" r="14" fill="#f4c3c3" /><path d="M50,15 A35,35 0 0,1 50,85 A35,35 0 0,1 50,15 M35,25 A25,25 0 0,1 65,25 A25,25 0 0,1 35,25 M25,35 A15,15 0 0,1 75,35 A15,15 0 0,1 25,35" fill="none" stroke="#508a38" strokeWidth="0.5" opacity="0.5" /></svg></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{dots(1, greenColor)}{dots(1, blueColor)}</div>;
            case '3': return <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1"><div className="col-start-1 row-start-1 self-start justify-self-start">{dots(1, redColor)}</div><div className="col-start-2 row-start-2 self-center justify-self-center">{dots(1, blueColor)}</div><div className="col-start-3 row-start-3 self-end justify-self-end">{dots(1, greenColor)}</div></div>;
            case '4': return <div className="w-full h-full flex justify-center items-center gap-4 p-1"><div className="flex flex-col gap-3">{dots(1, blueColor)}{dots(1, blueColor)}</div><div className="flex flex-col gap-3">{dots(1, greenColor)}{dots(1, greenColor)}</div></div>;
            case '5': return <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1"><div className="col-start-1 row-start-1">{dots(1, redColor)}</div><div className="col-start-3 row-start-1">{dots(1, greenColor)}</div><div className="col-start-2 row-start-2">{dots(1, blueColor)}</div><div className="col-start-1 row-start-3">{dots(1, greenColor)}</div><div className="col-start-3 row-start-3">{dots(1, redColor)}</div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-around">{dots(2, redColor)}</div><div className="flex justify-around">{dots(2, greenColor)}</div><div className="flex justify-around">{dots(2, greenColor)}</div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-center items-center gap-1 p-1"><div className="flex justify-between w-full -mb-1" style={{ transform: 'rotate(20deg) translateY(-2px)' }}><div className="translate-x-1">{dots(1, greenColor)}</div><div>{dots(1, greenColor)}</div><div className="-translate-x-1">{dots(1, greenColor)}</div></div><div className="flex justify-around w-full">{dots(2, redColor)}</div><div className="flex justify-around w-full">{dots(2, redColor)}</div></div>;
            case '8': return <div className="w-full h-full flex flex-col justify-around p-1">{dots(8, blueColor).map((d, i) => <div key={i} className='h-full flex items-center'>{d}</div>).reduce((acc, el, i) => { if (i % 2 === 0) { acc.push([el]); } else { acc[acc.length - 1].push(el); } return acc; }, [] as JSX.Element[][]).map((pair, i) => <div key={i} className="flex justify-around">{pair}</div>)}</div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-around">{dots(3, redColor)}</div><div className="flex justify-around">{dots(3, greenColor)}</div><div className="flex justify-around">{dots(3, blueColor)}</div></div>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const sticks = (count: number, color: string) => Array.from({ length: count }).map((_, i) => (
             <div key={i} className={cn("rounded-sm", color, sizeClass.bamboo )} />
        ));
        switch (value) {
            case '1': return <svg className={cn("w-10 h-10", size === 'sm' ? "w-full h-full p-1" : "p-2")} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 8C35 15, 30 38, 50 45 C70 38, 65 15, 50 8Z" fill="#508a38" /><path d="M50 43C40 50, 42 65, 50 70 C58 65, 60 50, 50 43Z" fill="#508a38" /><path d="M48 68 C35 75, 35 90, 48 95 L52 95 C65 90, 65 75, 52 68Z" fill="#c04848" /><path d="M50 44 C52 46, 52 49, 50 51 C48 49, 48 46, 50 44Z" fill="white" /><path d="M42 22 C40 20, 38 22, 40 25 C45 28, 55 28, 60 25 C62 22, 60 20, 58 22 C55 24, 45 24, 42 22Z" fill="#508a38" /></svg>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{sticks(1, blueColor)}{sticks(1, greenColor)}</div>;
            case '3': return <div className="w-full h-full flex flex-col justify-around items-center p-1">{sticks(1, blueColor)}{sticks(2, greenColor)}</div>;
            case '4': return <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-1"><div className="flex justify-center gap-2">{sticks(1, blueColor)}{sticks(1, greenColor)}</div><div className="flex justify-center gap-2">{sticks(1, greenColor)}{sticks(1, blueColor)}</div></div>;
            case '5': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-around">{sticks(2, greenColor)}</div><div className="flex justify-center">{sticks(1, redColor)}</div><div className="flex justify-around">{sticks(2, blueColor)}</div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-center gap-1"><div className="flex justify-around">{sticks(3, greenColor)}</div><div className="flex justify-around">{sticks(3, blueColor)}</div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-around p-1"><div className="flex justify-center">{sticks(1, redColor)}</div><div className="flex justify-around">{sticks(3, greenColor)}</div><div className="flex justify-around">{sticks(3, blueColor)}</div></div>;
            case '8': return <div className="w-full h-full flex flex-col justify-around items-center p-1"><div className="flex justify-between w-4/5"><div className={cn(sizeClass.bamboo, "rotate-45", greenColor)}/><div className={cn(sizeClass.bamboo, "-rotate-45", greenColor)}/></div><div className="flex justify-between w-4/5"><div className={cn(sizeClass.bamboo, "-rotate-45", blueColor)}/><div className={cn(sizeClass.bamboo, "rotate-45", blueColor)}/></div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around"><div className="flex justify-around">{sticks(3, redColor)}</div><div className="flex justify-around">{sticks(3, greenColor)}</div><div className="flex justify-around">{sticks(3, blueColor)}</div></div>;
            default: return null;
        }
    }

    const symbolMap: Record<TileValue, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    const characterMap: Record<string, string> = { '1': '萬', '2': '萬', '3': '萬', '4': '萬', '5': '萬', '6': '萬', '7': '萬', '8': '萬', '9': '萬' };
    
    let baseFontSize, topFontSize;
    if (size === 'sm') {
        baseFontSize = "text-[1.8vw] leading-[1.8vw] max-sm:text-lg";
        topFontSize = "text-[1.5vw] leading-[1.5vw] max-sm:text-base";
    } else {
        baseFontSize = "text-4xl";
        topFontSize = "text-lg";
    }
    
    if (suit === 'characters') {
        return <div className="relative flex flex-col items-center justify-center h-full p-1 font-bold font-headline leading-none"><span className={cn('text-black', topFontSize)}>{symbolMap[value]}</span><span className={cn('text-red-600', baseFontSize)}>{characterMap[value]}</span></div>;
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
        size === 'md' ? 'w-14 h-20' : 'w-[2.5vw] h-[3.5vw] max-w-10 max-h-14 min-w-[24px] min-h-[34px]',
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
