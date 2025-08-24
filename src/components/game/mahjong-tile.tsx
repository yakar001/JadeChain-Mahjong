
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
        const Stick = ({ color = greenColor, transform }: { color?: string, transform: string }) => (
             <path d="M-4,0 a 4,2 0,0,1,8,0 v1 a 4,2 0,0,1,-8,0 v-1 M-4,5 a 4,2 0,0,1,8,0 v1 a 4,2 0,0,1,-8,0 v-1 M-4,10 a 4,2 0,0,1,8,0 v1 a 4,2 0,0,1,-8,0 v-1"
                  stroke="none" fill={color} transform={transform} />
        );
        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(0, 5) scale(0.9)"><path fill={greenColor} stroke={greenColor} strokeWidth="1" strokeLinejoin="round" d="M25.9,10.2c-0.6-1.3-1.3-2.6-2-3.8c-0.9-1.5-2.2-2.7-3.9-3.2c-1.1-0.3-2.3-0.2-3.4,0.2c-1.5,0.6-2.6,1.8-3,3.4 c-0.3,1.3,0,2.6,0.5,3.9c0.7,1.6,1.8,3,3.1,4c-2.8,0.3-5.5,0.4-8.3,0.4c-0.8,0-1.4,0.5-1.5,1.2c-0.1,0.7,0.4,1.4,1.1,1.5 c2.4,0.3,4.8,0.5,7.2,0.6c0.1,2.5,0.2,5,0.3,7.5c-2.4,0.1-4.8,0.2-7.2,0.2c-0.8,0-1.4,0.5-1.5,1.2c-0.1,0.7,0.4,1.4,1.1,1.5 c2.7,0,5.5-0.1,8.2-0.3c0,2.1,0,4.2,0,6.3c-1.8,0-3.6,0-5.5,0c-0.7,0-1.3,0.5-1.4,1.2c-0.1,0.7,0.4,1.3,1,1.4c1.9,0.2,3.8,0.3,5.7,0.3 c-0.1,2.8-0.2,5.6-0.4,8.4c-1.5,0.4-3,0.8-4.5,1.1c-0.7,0.2-1.2,0.8-1.2,1.5c0,0.8,0.6,1.4,1.4,1.4c3.4-0.6,6.8-1.3,10.2-2 c-2.9,2.2-5.7,4.3-8.6,6.5c-0.6,0.5-0.8,1.3-0.5,2c0.4,0.7,1.2,1,1.9,0.7c3.1-1.9,6.2-3.9,9.3-5.8c2.1,2.5,4.2,5,6.3,7.5 c0.5,0.6,1.3,0.8,2,0.5c0.7-0.4,1-1.2,0.7-1.9c-2.1-2.9-4.2-5.8-6.3-8.7c2.6-1,5.2-2,7.8-3c0.7-0.3,1.2-1,1-1.7 c-0.3-0.7-1-1.2-1.7-1c-2.9,0.7-5.8,1.4-8.7,2.1c-2.3-2.9-4.5-5.8-6.8-8.7c-0.5-0.6-1.3-0.8-2-0.5c-0.7,0.4-1,1.2-0.7,1.9 c2,2.6,4.1,5.2,6.1,7.8c-2.3,0.5-4.6,1-6.9,1.5c-0.8,0.2-1.5-0.3-1.7-1.1c-0.2-0.8,0.3-1.5,1.1-1.7c2.7-0.6,5.4-1.2,8.1-1.9 c0.2-3.2,0.4-6.4,0.6-9.6h0.1c2.1,0,4.2-0.2,6.3-0.4c0.7-0.1,1.2-0.7,1.1-1.4c-0.1-0.7-0.7-1.2-1.4-1.1c-1.9,0.2-3.9,0.3-5.8,0.3 c0.1-2.4,0.2-4.8,0.3-7.2c3.1-0.1,6.2-0.3,9.3-0.6c0.8-0.1,1.3-0.7,1.2-1.5c-0.1-0.8-0.7-1.3-1.5-1.2c-2.9,0.2-5.8,0.4-8.7,0.6 c0-2.8,0-5.6,0-8.4c2.1,0.5,4.2,1,6.3,1.5c0.7,0.2,1.5-0.1,1.8-0.8c0.3-0.7,0-1.5-0.7-1.8c-1.8-0.6-3.6-1.2-5.5-1.7 c-0.1-2.5-0.2-4.9-0.4-7.4c2.4-0.3,4.8-0.6,7.2-1c0.8-0.2,1.3-0.8,1.2-1.6c-0.2-0.8-0.8-1.3-1.6-1.2c-2.7,0.3-5.3,0.6-8,0.8 C30.9,17.1,28.4,17.2,25.9,10.2z" /><circle cx="20.5" cy="11.5" r="3" fill="#F0F0E0" /><circle cx="20.5" cy="11.5" r="1.5" fill={redColor} /></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={redColor} transform="translate(-4, -13)" /><Stick color={greenColor} transform="translate(-4, 5)" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={redColor} transform="translate(-4, -13)" /><Stick color={greenColor} transform="translate(-10, 5)" /><Stick color={greenColor} transform="translate(2, 5)" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={blueColor} transform="translate(-10, -13)" /><Stick color={greenColor} transform="translate(2, -13)" /><Stick color={greenColor} transform="translate(-10, 5)" /><Stick color={blueColor} transform="translate(2, 5)" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={greenColor} transform="translate(-10, -13)" /><Stick color={greenColor} transform="translate(2, -13)" /><Stick color={redColor} transform="translate(-4, -4)" /><Stick color={greenColor} transform="translate(-10, 5)" /><Stick color={greenColor} transform="translate(2, 5)" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={redColor} transform="translate(-10, -13)" /><Stick color={redColor} transform="translate(2, -13)" /><Stick color={greenColor} transform="translate(-10, -4)" /><Stick color={greenColor} transform="translate(2, -4)" /><Stick color={greenColor} transform="translate(-10, 5)" /><Stick color={greenColor} transform="translate(2, 5)" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.4)"><Stick color={redColor} transform="translate(-4, -18)" /><Stick color={greenColor} transform="translate(-10, -7)" /><Stick color={greenColor} transform="translate(-4, -7)" /><Stick color={greenColor} transform="translate(2, -7)" /><Stick color={greenColor} transform="translate(-10, 4)" /><Stick color={greenColor} transform="translate(-4, 4)" /><Stick color={greenColor} transform="translate(2, 4)" /></g></svg>;
            case '8': return <svg viewBox="0 0 50 70" className="w-full h-full p-1"><g transform="translate(25, 35) scale(1.5)"><g transform="translate(0, -9)"><path d="M -10 -10 l 6 8 l -6 8 M 2 -10 l -6 8 l 6 8" stroke={greenColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g><g transform="translate(0, 9)"><path d="M -10 -10 l 6 8 l -6 8 M 2 -10 l -6 8 l 6 8" stroke={blueColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={redColor} transform="translate(-10, -13)" /><Stick color={redColor} transform="translate(-4, -13)" /><Stick color={redColor} transform="translate(2, -13)" /><Stick color={greenColor} transform="translate(-10, -4)" /><Stick color={greenColor} transform="translate(-4, -4)" /><Stick color={greenColor} transform="translate(2, -4)" /><Stick color={greenColor} transform="translate(-10, 5)" /><Stick color={greenColor} transform="translate(-4, 5)" /><Stick color={greenColor} transform="translate(2, 5)" /></g></svg>;
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
