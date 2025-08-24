
'use client';
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

const TilePattern = ({ suit, value }: { suit: TileSuit, value: TileValue }) => {
    const redColor = "#c13824";
    const greenColor = "#006A4E";
    const blueColor = "#003366";

    if (suit === 'dots') {
        const Dot = ({ color = blueColor }: { color?: string }) => (
            <div className="aspect-square w-[22%] m-[1.5%] rounded-full border-[10%]" style={{ borderColor: color, borderWidth: 'max(1px, 10%)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center transform scale-[0.85]">
                     <div className="w-[35%] h-[35%] rounded-full" style={{ backgroundColor: color }}></div>
                </div>
            </div>
        );
        switch (value) {
            case '1': return <div className="w-full h-full flex justify-center items-center p-[10%]"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#d1e4c1" stroke="#006A4E" strokeWidth="3" /><circle cx="50" cy="50" r="30" fill="none" stroke="#006A4E" strokeWidth="1" strokeDasharray="4" /><circle cx="50" cy="50" r="22" fill="#f4c3c3" stroke="#c13824" strokeWidth="2" /><circle cx="50" cy="50" r="14" fill="#f4c3c3" /><path d="M50,15 A35,35 0 0,1 50,85 A35,35 0 0,1 50,15 M35,25 A25,25 0 0,1 65,25 A25,25 0 0,1 35,25 M25,35 A15,15 0 0,1 75,35 A15,15 0 0,1 25,35" fill="none" stroke="#006A4E" strokeWidth="0.5" opacity="0.5" /></svg></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-[8%]"><Dot color={greenColor} /><Dot color={redColor} /></div>;
            case '3': return <div className="w-full h-full flex flex-col justify-between p-[8%]"><div className="flex justify-start"><Dot color={blueColor}/></div><div className="flex justify-center"><Dot color={redColor}/></div><div className="flex justify-end"><Dot color={greenColor}/></div></div>;
            case '4': return <div className="w-full h-full flex flex-col justify-between p-[8%]"><div className="flex justify-between"><Dot color={blueColor}/><Dot color={greenColor}/></div><div className="flex justify-between"><Dot color={greenColor}/><Dot color={blueColor}/></div></div>;
            case '5': return <div className="w-full h-full flex flex-col justify-between p-[8%]"><div className="flex justify-between"><Dot color={blueColor}/><Dot color={greenColor}/></div><div className="flex justify-center"><Dot color={redColor}/></div><div className="flex justify-between"><Dot color={greenColor}/><Dot color={blueColor}/></div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-around items-center p-[8%]"><div className="flex justify-around w-full"><Dot color={greenColor}/><Dot color={greenColor}/></div><div className="flex justify-around w-full"><Dot color={redColor}/><Dot color={redColor}/><Dot color={redColor}/><Dot color={redColor}/></div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-between p-[8%]"><div className="flex justify-between w-[66%] self-start"><Dot color={greenColor}/><Dot color={greenColor}/></div><div className="flex justify-between w-full"><Dot color={greenColor}/><Dot color={redColor}/></div><div className="flex justify-between w-full"><Dot color={redColor}/><Dot color={redColor}/></div></div>
            case '8': return <div className="w-full h-full flex flex-wrap justify-around content-around p-[8%]">{Array(8).fill(0).map((_, i) => <Dot key={i} color={blueColor} />)}</div>;
            case '9': return <div className="w-full h-full flex flex-wrap justify-around content-around p-[8%]">{Array(3).fill(0).map((_, i) => <Dot key={`r${i}`} color={redColor} />)}{Array(3).fill(0).map((_, i) => <Dot key={`g${i}`} color={greenColor} />)}{Array(3).fill(0).map((_, i) => <Dot key={`b${i}`} color={blueColor} />)}</div>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color }: { color: string }) => <div className="w-[10%] h-[40%] rounded-sm" style={{backgroundColor: color}}></div>
        switch (value) {
            case '1': return <div className="w-full h-full flex justify-center items-center p-[10%]"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 8C35 15, 30 38, 50 45 C70 38, 65 15, 50 8Z" fill="#508a38" /><path d="M50 43C40 50, 42 65, 50 70 C58 65, 60 50, 50 43Z" fill="#508a38" /><path d="M48 68 C35 75, 35 90, 48 95 L52 95 C65 90, 65 75, 52 68Z" fill="#c04848" /><path d="M50 44 C52 46, 52 49, 50 51 C48 49, 48 46, 50 44Z" fill="white" /><path d="M42 22 C40 20, 38 22, 40 25 C45 28, 55 28, 60 25 C62 22, 60 20, 58 22 C55 24, 45 24, 42 22Z" fill="#508a38" /></svg></div>;
            case '2': return <div className="w-full h-full flex flex-col justify-around items-center p-[8%]"><Stick color={greenColor}/><Stick color={blueColor}/></div>;
            case '3': return <div className="w-full h-full flex flex-col justify-around items-center p-[8%]"><Stick color={greenColor}/><div className="flex gap-[10%]"><Stick color={blueColor}/><Stick color={greenColor}/></div></div>;
            case '4': return <div className="w-full h-full flex justify-around items-center p-[8%]"><div className="flex flex-col gap-[10%]"><Stick color={blueColor}/><Stick color={greenColor}/></div><div className="flex flex-col gap-[10%]"><Stick color={greenColor}/><Stick color={blueColor}/></div></div>;
            case '5': return <div className="w-full h-full flex flex-col justify-between items-center p-[12%]"><div className="flex justify-between w-full"><Stick color={greenColor}/><Stick color={blueColor}/></div><Stick color={redColor}/><div className="flex justify-between w-full"><Stick color={blueColor}/><Stick color={greenColor}/></div></div>;
            case '6': return <div className="w-full h-full flex flex-col justify-center items-center gap-[10%]"><div className="flex gap-[10%] w-full justify-center"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-[10%] w-full justify-center"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            case '7': return <div className="w-full h-full flex flex-col justify-between items-center p-[10%]"><Stick color={redColor}/><div className="flex justify-between w-full"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex justify-between w-full"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            case '8': return <div className="w-full h-full flex flex-col justify-between items-center p-[10%]"><div className="flex gap-x-[12%] gap-y-2 flex-wrap w-full justify-center"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-x-[12%] gap-y-2 flex-wrap w-full justify-center"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            case '9': return <div className="w-full h-full flex flex-col justify-around items-center p-[8%]"><div className="flex gap-[10%] w-full justify-center"><Stick color={redColor}/><Stick color={redColor}/><Stick color={redColor}/></div><div className="flex gap-[10%] w-full justify-center"><Stick color={greenColor}/><Stick color={greenColor}/><Stick color={greenColor}/></div><div className="flex gap-[10%] w-full justify-center"><Stick color={blueColor}/><Stick color={blueColor}/><Stick color={blueColor}/></div></div>;
            default: return null;
        }
    }

    const symbolMap: Record<TileValue, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    
    if (suit === 'characters') {
        return <div className="relative flex flex-col items-center justify-between h-full p-1 font-bold font-headline leading-none text-[20%]"><span className='text-black text-[80%] self-end'>{symbolMap[value]}</span><span className='text-red-600 text-[100%]'>萬</span></div>;
    }
    if (suit === 'wind' || suit === 'dragon') {
        const color = suit === 'dragon' && value === 'R' ? redColor : suit === 'dragon' && value === 'G' ? greenColor : 'black';
        if (value === 'B') {
            return <div className="w-[80%] h-[90%] border-blue-600 rounded" style={{ borderWidth: 'max(1px, 8%)'}} />;
        }
        return <span className={'font-bold font-headline text-[40%]'} style={{color}}>{symbolMap[value]}</span>;
    }
    return null;
}

export function MahjongTile({ suit, value, className, size = 'md', isClickable = false, isGolden = false }: MahjongTileProps) {

  return (
    <div
      className={cn(
        'bg-stone-50 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400/80 overflow-hidden',
        'dark:bg-gradient-to-b from-stone-50 to-stone-200',
        size === 'md' ? 'w-[6.5vw] h-[9vw] max-w-[65px] max-h-[90px]' : 'w-[2.5vw] h-[3.5vw] min-w-[24px] min-h-[34px]',
        isClickable && 'transform transition-transform hover:-translate-y-2 cursor-pointer active:scale-95',
        isGolden && 'shadow-yellow-400/50 shadow-lg border-yellow-500 ring-2 ring-yellow-400',
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center">
        <TilePattern suit={suit} value={value} />
      </div>
    </div>
  );
}
