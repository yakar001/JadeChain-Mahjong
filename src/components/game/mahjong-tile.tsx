
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

const TilePattern = ({ suit, value, size }: { suit: TileSuit, value: TileValue, size: 'md' | 'sm' }) => {
    const sizeClass = size === 'md' ? { dot: "w-[1.4vh]", bamboo: "w-[0.5vh] h-[2.5vh]" } : { dot: "w-[1vw] h-[1vw] max-w-[0.5rem] max-h-[0.5rem]", bamboo: "w-[0.4vw] h-[1.8vw] max-w-[0.2rem] max-h-[0.8rem]" };
    const redColor = "#c13824";
    const greenColor = "#006A4E";
    const blueColor = "#003366";

    if (suit === 'dots') {
        const Dot = ({ color }: { color: string }) => (
            <div className="flex items-center justify-center" style={{ width: '22%', height: '22%'}}>
                <div className="w-full h-full rounded-full border-[1.5px]" style={{ borderColor: color }}>
                    <div className="w-full h-full rounded-full flex items-center justify-center transform scale-[0.85]">
                         <div className="w-[30%] h-[30%] rounded-full" style={{ backgroundColor: color }}></div>
                    </div>
                </div>
            </div>
        );
        switch (value) {
            case '1': return <div className="w-full h-full flex justify-center items-center p-1"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#d1e4c1" stroke="#006A4E" strokeWidth="3" /><circle cx="50" cy="50" r="30" fill="none" stroke="#006A4E" strokeWidth="1" strokeDasharray="4" /><circle cx="50" cy="50" r="22" fill="#f4c3c3" stroke="#c13824" strokeWidth="2" /><circle cx="50" cy="50" r="14" fill="#f4c3c3" /><path d="M50,15 A35,35 0 0,1 50,85 A35,35 0 0,1 50,15 M35,25 A25,25 0 0,1 65,25 A25,25 0 0,1 35,25 M25,35 A15,15 0 0,1 75,35 A15,15 0 0,1 25,35" fill="none" stroke="#006A4E" strokeWidth="0.5" opacity="0.5" /></svg></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1"><Dot color={greenColor} /><Dot color={redColor} /></div>;
            case '3': return <div className="w-full h-full flex flex-col justify-between p-2"><div className="flex justify-start"><Dot color={blueColor}/></div><div className="flex justify-center"><Dot color={redColor}/></div><div className="flex justify-end"><Dot color={greenColor}/></div></div>;
            case '4': return <div className="w-full h-full flex flex-col justify-between p-2"><div className="flex justify-between"><Dot color={blueColor}/><Dot color={greenColor}/></div><div className="flex justify-between"><Dot color={greenColor}/><Dot color={blueColor}/></div></div>;
            case '5': return <div className="w-full h-full flex flex-col justify-between p-2"><div className="flex justify-between"><Dot color={blueColor}/><Dot color={greenColor}/></div><div className="flex justify-center"><Dot color={redColor}/></div><div className="flex justify-between"><Dot color={greenColor}/><Dot color={blueColor}/></div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around p-2"><div className="flex justify-around"><Dot color={greenColor}/><Dot color={greenColor}/></div><div className="flex justify-around"><Dot color={redColor}/><Dot color={redColor}/><Dot color={redColor}/><Dot color={redColor}/></div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-between p-2"><div className="flex justify-between"><Dot color={greenColor}/><Dot color={greenColor}/><Dot color={greenColor}/></div><div className="flex justify-around"><Dot color={redColor}/><Dot color={redColor}/></div><div className="flex justify-around"><Dot color={redColor}/><Dot color={redColor}/></div></div>
            case '8': return <div className="w-full h-full flex flex-col justify-around p-2"><div className="flex justify-around"><Dot color={blueColor}/><Dot color={blueColor}/></div><div className="flex justify-around"><Dot color={blueColor}/><Dot color={blueColor}/></div><div className="flex justify-around"><Dot color={blueColor}/><Dot color={blueColor}/></div><div className="flex justify-around"><Dot color={blueColor}/><Dot color={blueColor}/></div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around p-2"><div className="flex justify-around"><Dot color={redColor}/><Dot color={redColor}/><Dot color={redColor}/></div><div className="flex justify-around"><Dot color={greenColor}/><Dot color={greenColor}/><Dot color={greenColor}/></div><div className="flex justify-around"><Dot color={blueColor}/><Dot color={blueColor}/><Dot color={blueColor}/></div></div>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color }: { color: string }) => <div className="w-[6px] h-[28px] rounded-sm" style={{backgroundColor: color}}></div>
        switch (value) {
            case '1': return <svg className={cn("w-full h-full p-2")} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 8C35 15, 30 38, 50 45 C70 38, 65 15, 50 8Z" fill="#508a38" /><path d="M50 43C40 50, 42 65, 50 70 C58 65, 60 50, 50 43Z" fill="#508a38" /><path d="M48 68 C35 75, 35 90, 48 95 L52 95 C65 90, 65 75, 52 68Z" fill="#c04848" /><path d="M50 44 C52 46, 52 49, 50 51 C48 49, 48 46, 50 44Z" fill="white" /><path d="M42 22 C40 20, 38 22, 40 25 C45 28, 55 28, 60 25 C62 22, 60 20, 58 22 C55 24, 45 24, 42 22Z" fill="#508a38" /></svg>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-1"><Stick color={redColor}/><Stick color={greenColor}/></div>;
            case '3': return <div className="w-full h-full flex flex-col justify-around items-center p-1"><Stick color={redColor}/><div className="flex gap-2"><Stick color={greenColor}/><Stick color={greenColor}/></div></div>;
            case '4': return <div className="w-full h-full flex justify-around items-center p-1"><div className="flex flex-col gap-2"><Stick color={blueColor}/><Stick color={greenColor}/></div><div className="flex flex-col gap-2"><Stick color={greenColor}/><Stick color={blueColor}/></div></div>;
            case '5': return <div className="w-full h-full flex flex-col justify-between items-center p-2"><div className="flex justify-between w-full"><Stick color={greenColor}/><Stick color={blueColor}/></div><Stick color={redColor}/><div className="flex justify-between w-full"><Stick color={blueColor}/><Stick color={greenColor}/></div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-center items-center gap-2"><div className="flex gap-2"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-2"><Stick color={redColor}/><Stick color={redColor}/><Stick color={redColor}/></div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-between items-center p-2"><Stick color={redColor}/><div className="flex justify-between w-full"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex justify-between w-full"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            case '8': return <div className="w-full h-full flex flex-col justify-between items-center p-2"><div className="flex gap-4"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-4"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around items-center"><div className="flex gap-4"><Stick color={redColor}/><Stick color={redColor}/><Stick color={redColor}/></div><div className="flex gap-4"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-4"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            default: return null;
        }
    }

    const symbolMap: Record<TileValue, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    const characterMap: Record<string, string> = { '1': '萬', '2': '萬', '3': '萬', '4': '萬', '5': '萬', '6': '萬', '7': '萬', '8': '萬', '9': '萬' };
    
    let baseFontSize, topFontSize;
    if (size === 'sm') {
        baseFontSize = "text-[1.8vw] leading-[1.8vw] md:text-base";
        topFontSize = "text-[1.5vw] leading-[1.5vw] md:text-sm";
    } else {
        baseFontSize = "text-[3vw] leading-[3vw]";
        topFontSize = "text-[1.8vw] leading-[1.8vw]";
    }
    
    if (suit === 'characters') {
        return <div className="relative flex flex-col items-center justify-center h-full p-1 font-bold font-headline leading-none"><span className={cn('text-black', topFontSize)}>{symbolMap[value]}</span><span className={cn('text-red-600', baseFontSize)}>{characterMap[value]}</span></div>;
    }
    if (suit === 'wind') {
        return <span className={cn('font-bold font-headline text-black', baseFontSize)}>{symbolMap[value]}</span>;
    }
    if (suit === 'dragon') {
        if (value === 'B') {
            return <div className={cn("w-4/5 h-4/5 border-blue-600 rounded", size === 'sm' ? "border-2" : "border-[0.6vh]")} />;
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
        'bg-stone-50 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400/80 overflow-hidden',
        'dark:bg-gradient-to-b from-stone-50 to-stone-200',
        size === 'md' ? 'w-[6.5vw] h-[9vw]' : 'w-[2.5vw] h-[3.5vw] min-w-[24px] min-h-[34px]',
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
