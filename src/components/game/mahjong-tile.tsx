
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
    const redColor = "#D0332D";
    const greenColor = "#1A744F";
    const blueColor = "#1D1E3B";

    if (suit === 'dots') {
        const Dot = ({ color = blueColor, cx, cy }: { color?: string, cx: number, cy: number }) => (
           <>
            <circle cx={cx} cy={cy} r="6.5" fill="white" stroke={color} strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="3" fill={color} />
           </>
        );
        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(0, 10)"><circle cx="25" cy="25" r="20" fill="#F0F0E0" stroke="#888" strokeWidth="0.5"/><circle cx="25" cy="25" r="16" fill="none" stroke={greenColor} strokeWidth="2"/><circle cx="25" cy="25" r="8" fill={redColor} stroke="white" strokeWidth="1"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(45 25 25)"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(-45 25 25)"/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><Dot color={greenColor} cx="25" cy="20" /><Dot color={redColor} cx="25" cy="50" /></svg>;
            case '3': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="15" cy="20" /><Dot color={redColor} cx="25" cy="35" /><Dot color={greenColor} cx="35" cy="50" /></svg>;
            case '4': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="17" cy="20" /><Dot color={greenColor} cx="33" cy="20" /><Dot color={greenColor} cx="17" cy="50" /><Dot color={blueColor} cx="33" cy="50" /></svg>;
            case '5': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="17" cy="20" /><Dot color={greenColor} cx="33" cy="20" /><Dot color={redColor} cx="25" cy="35" /><Dot color={greenColor} cx="17" cy="50" /><Dot color={blueColor} cx="33" cy="50" /></svg>;
            case '6': return <svg viewBox="0 0 50 70"><Dot color={greenColor} cx="17" cy="18" /><Dot color={greenColor} cx="33" cy="18" /><Dot color={redColor} cx="17" cy="35" /><Dot color={redColor} cx="33" cy="35" /><Dot color={redColor} cx="17" cy="52" /><Dot color={redColor} cx="33" cy="52" /></svg>;
            case '7': return <svg viewBox="0 0 50 70"><Dot color={greenColor} cx="17" cy="15" /><Dot color={greenColor} cx="25" cy="22" /><Dot color={greenColor} cx="33" cy="15" /><Dot color={redColor} cx="17" cy="35" /><Dot color={redColor} cx="33" cy="35" /><Dot color={redColor} cx="17" cy="55" /><Dot color={redColor} cx="33" cy="55" /></svg>;
            case '8': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="17" cy="12" /><Dot color={blueColor} cx="33" cy="12" /><Dot color={blueColor} cx="17" cy="28" /><Dot color={blueColor} cx="33" cy="28" /><Dot color={blueColor} cx="17" cy="44" /><Dot color={blueColor} cx="33" cy="44" /><Dot color={blueColor} cx="17" cy="60" /><Dot color={blueColor} cx="33" cy="60" /></svg>;
            case '9': return <svg viewBox="0 0 50 70"><Dot color={redColor} cx="17" cy="18" /><Dot color={redColor} cx="25" cy="18" /><Dot color={redColor} cx="33" cy="18" /><Dot color={greenColor} cx="17" cy="35" /><Dot color={greenColor} cx="25" cy="35" /><Dot color={greenColor} cx="33" cy="35" /><Dot color={blueColor} cx="17" cy="52" /><Dot color={blueColor} cx="25" cy="52" /><Dot color={blueColor} cx="33" cy="52" /></svg>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color = greenColor, x, y, width = 4, height = 20 }: { color?: string, x: number, y: number, width?: number, height?: number }) => (
            <g transform={`translate(${x}, ${y})`}>
                <rect x="0" y="0" width={width} height={height} fill={color} rx="1"/>
                <rect x="0" y="4" width={width} height="1.5" fill="white" fillOpacity="0.7"/>
                <rect x="0" y="9" width={width} height="1.5" fill="white" fillOpacity="0.7"/>
                <rect x="0" y="14" width={width} height="1.5" fill="white" fillOpacity="0.7"/>
            </g>
        );
         switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(5, 12) scale(0.9)"><path d="M22.5,3 C 24,5 24.5,7 23,9 C 20,13 15,12 13,10 C 11,8 11.5,5.5 13,4 C 15,2 17,2.5 18.5,4.5 M23,9 C 25,11 30,12 33,11 C 36,10 37,7 35,5 C 33,3 30,3 27.5,4.5 M22.5,15 C 20,18 19,23 21,26 C 23,29 27,29 29.5,26 C 32,23 31.5,18 29.5,15 C 27.5,12 24.5,12 22.5,15 Z M20,28 C 17,32 18,37 21,40 C 23,42 27,42 29,39 C 32,36 31,31 28,28 M25,43 C 25,45 25,48 25,50" stroke={greenColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M22,20 C 24,20 26,22 26,24 C 26,26 24,28 22,28 C 20,28 18,26 18,24 C 18,22 20,20 22,20Z" fill={redColor}/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70" className="p-1"><path d="M25 15 L 20 25 L 25 35 M25 40 L 30 50 L 25 60" stroke={greenColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case '3': return <svg viewBox="0 0 50 70" className="p-1"><path d="M25 15 L 20 25 L 25 35 M20 40 L 25 50 L 30 50 L 25 60" stroke={greenColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case '4': return <svg viewBox="0 0 50 70" className="p-1"><path d="M18 15 L 13 25 L 18 35 M32 15 L 37 25 L 32 35 M18 40 L 13 50 L 18 60 M32 40 L 37 50 L 32 60" stroke={greenColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case '5': return <svg viewBox="0 0 50 70"><Stick color={greenColor} x="12" y="10" /><Stick color={blueColor} x="34" y="10" /><Stick color={redColor} x="23" y="25" /><Stick color={blueColor} x="12" y="40" /><Stick color={greenColor} x="34" y="40" /></svg>;
            case '6': return <svg viewBox="0 0 50 70" className="p-1"><path d="M18 15 L 13 25 L 18 35 M25 15 L 20 25 L 25 35 M32 15 L 37 25 L 32 35 M18 40 L 13 50 L 18 60 M25 40 L 20 50 L 25 60 M32 40 L 37 50 L 32 60" stroke={greenColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case '7': return <svg viewBox="0 0 50 70"><Stick color={redColor} x="23" y="8" /><Stick x="12" y="28" /><Stick x="23" y="28" /><Stick x="34" y="28" /><Stick x="12" y="48" /><Stick x="23" y="48" /><Stick x="34" y="48" /></svg>;
            case '8': return <svg viewBox="0 0 50 70" className="p-1"><path d="M12 15 L 18 25 L 12 35 M 38 15 L 32 25 L 38 35 M 12 40 L 18 50 L 12 60 M 38 40 L 32 50 L 38 60" stroke={greenColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case '9': return <svg viewBox="0 0 50 70"><Stick color={redColor} x="12" y="8" /><Stick color={redColor} x="23" y="8" /><Stick color={redColor} x="34" y="8" /><Stick color={greenColor} x="12" y="28" /><Stick color={greenColor} x="23" y="28" /><Stick color={greenColor} x="34" y="28" /><Stick color={blueColor} x="12" y="48" /><Stick color={blueColor} x="23" y="48" /><Stick color={blueColor} x="34" y="48" /></svg>;
            default: return null;
        }
    }

    const symbolMap: Record<string, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    
    if (suit === 'characters') {
        return <svg viewBox="0 0 50 70" className="w-full h-full p-1" >
            <text x="50%" y="30%" dominantBaseline="middle" textAnchor="middle" fontSize="24" fill={blueColor} className="font-bold font-headline">{symbolMap[value]}</text>
            <text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fill={redColor} className="font-bold font-headline">萬</text>
        </svg>;
    }

    if (suit === 'wind' || suit === 'dragon') {
        const color = suit === 'dragon' && value === 'R' ? redColor : suit === 'dragon' && value === 'G' ? greenColor : blueColor;
        if (value === 'B') {
            return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><rect x="5" y="5" width="40" height="60" rx="3" fill="transparent" stroke={blueColor} strokeWidth="3"/></svg>;
        }
        return <svg viewBox="0 0 50 70" className="w-full h-full p-1">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fill={color} className="font-bold font-headline">{symbolMap[value]}</text>
        </svg>;
    }
    return null;
}

export function MahjongTile({ suit, value, className, size = 'md', isClickable = false, isGolden = false }: MahjongTileProps) {

  return (
    <div
      className={cn(
        'bg-stone-50 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400/80 overflow-hidden relative',
        'dark:bg-gradient-to-b from-stone-50 to-stone-200',
        size === 'md' ? 'w-[6.5vw] h-[9vw] max-w-[65px] max-h-[90px]' : 'w-[2.5vw] h-[3.5vw] min-w-[24px] min-h-[34px]',
        isClickable && 'transform transition-transform hover:-translate-y-2 cursor-pointer active:scale-95',
        isGolden && 'shadow-yellow-400/50 shadow-lg border-yellow-500 ring-2 ring-yellow-400',
        className
      )}
    >
        {isGolden && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>}
      <div className="w-full h-full flex items-center justify-center">
        <TilePattern suit={suit} value={value} />
      </div>
    </div>
  );
}
