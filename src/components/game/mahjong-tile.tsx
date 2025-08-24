
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
           <circle cx={cx} cy={cy} r="6" fill={color} />
        );

        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(0, 10)"><circle cx="25" cy="25" r="20" fill="#F0F0E0" stroke="#888" strokeWidth="0.5"/><circle cx="25" cy="25" r="16" fill="none" stroke={greenColor} strokeWidth="2"/><circle cx="25" cy="25" r="8" fill={redColor} stroke="white" strokeWidth="1"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(45 25 25)"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(-45 25 25)"/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="25" cy="18" /><Dot color={redColor} cx="25" cy="42" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="16" cy="16" /><Dot color={redColor} cx="25" cy="30" /><Dot color={greenColor} cx="34" cy="44" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="18" cy="18" /><Dot color={blueColor} cx="32" cy="18" /><Dot color={blueColor} cx="18" cy="42" /><Dot color={greenColor} cx="32" cy="42" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="16" cy="16" /><Dot color={greenColor} cx="34" cy="16" /><Dot color={redColor} cx="25" cy="30" /><Dot color={greenColor} cx="16" cy="44" /><Dot color={blueColor} cx="34" cy="44" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={redColor} cx="18" cy="18" /><Dot color={redColor} cx="32" cy="18" /><Dot color={blueColor} cx="18" cy="30" /><Dot color={blueColor} cx="32" cy="30" /><Dot color={blueColor} cx="18" cy="42" /><Dot color={blueColor} cx="32" cy="42" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><g transform="translate(0, -2)"><Dot color={greenColor} cx="16" cy="16" /><Dot color={greenColor} cx="25" cy="22" /><Dot color={greenColor} cx="34" cy="16" /></g><g transform="translate(0, 2)"><Dot color={redColor} cx="18" cy="38" /><Dot color={redColor} cx="32" cy="38" /><Dot color={redColor} cx="18" cy="50" /><Dot color={redColor} cx="32" cy="50" /></g></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="18" cy="14" /><Dot color={blueColor} cx="32" cy="14" /><Dot color={blueColor} cx="18" cy="24" /><Dot color={blueColor} cx="32" cy="24" /><Dot color={blueColor} cx="18" cy="34" /><Dot color={blueColor} cx="32" cy="34" /><Dot color={blueColor} cx="18" cy="44" /><Dot color={blueColor} cx="32" cy="44" /></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="17" cy="15" /><Dot color={greenColor} cx="25" cy="15" /><Dot color={greenColor} cx="33" cy="15" /><Dot color={redColor} cx="17" cy="30" /><Dot color={redColor} cx="25" cy="30" /><Dot color={redColor} cx="33" cy="30" /><Dot color={blueColor} cx="17" cy="45" /><Dot color={blueColor} cx="25" cy="45" /><Dot color={blueColor} cx="33" cy="45" /></g></svg>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color = greenColor, transform, scale = 1 }: { color?: string; transform: string; scale?: number }) => (
            <g transform={`${transform} scale(${scale})`}>
                <rect x="-3" y="-10" width="6" height="20" rx="3" fill={color} />
                <rect x="-1" y="-11" width="2" height="22" fill={color} />
                <circle cx="0" cy="0" r="1.5" fill="white" />
                <path d="M -3 4 L 3 4 M -3 -4 L 3 -4" stroke="white" strokeWidth="1" />
            </g>
        );
        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(2, 5) scale(0.95)"><path d="M 23.5,12 C 22.5,11 21,11 20,11.5 C 16,13 14,17 14.5,22 C 15,28 20,31 22,32 C 24,33 27,33 29,31 C 32,29 34,26 34,23 C 34,20 33,18 31,17 C 32,15 32,13 30,12 C 28,11 25.5,11.5 23.5,12 Z M 23,17 C 24,17 25,18 25.5,19 C 26,20 25.5,21 24.5,21 C 23.5,21 22.5,20 22,19 C 21.5,18 22,17 23,17 Z" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/><path d="M 19,30 C 18,34 18,38 20,41 C 22,44 26,45 29,43 C 32,41 34,37 32,33 C 30,29 25,29 22,31" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/><path d="M 18,18 C 16,22 13,24 10,24 C 7,24 5,22 6,19 C 7,16 10,15 13,16" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/><path d="M 30,20 C 33,21 36,20 38,18 C 40,16 40,13 37,12 C 34,11 31,13 30,15" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={greenColor} transform="translate(0, -13)" /><Stick color={blueColor} transform="translate(0, 13)" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={greenColor} transform="translate(0, -18)" /><Stick color={blueColor} transform="translate(-10, 10)" /><Stick color={greenColor} transform="translate(10, 10)" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={blueColor} transform="translate(-8, -13)" /><Stick color={greenColor} transform="translate(8, -13)" /><Stick color={greenColor} transform="translate(-8, 13)" /><Stick color={blueColor} transform="translate(8, 13)" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.65)"><Stick color={greenColor} transform="translate(-10, -16)" /><Stick color={redColor} transform="translate(10, -16)" /><Stick color={blueColor} transform="translate(0, 0)" /><Stick color={redColor} transform="translate(-10, 16)" /><Stick color={greenColor} transform="translate(10, 16)" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={redColor} transform="translate(-10, -13)" /><Stick color={redColor} transform="translate(0, -13)" /><Stick color={redColor} transform="translate(10, -13)" /><Stick color={greenColor} transform="translate(-10, 13)" /><Stick color={greenColor} transform="translate(0, 13)" /><Stick color={greenColor} transform="translate(10, 13)" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.65)"><Stick color={redColor} transform="translate(0, -22)" /><Stick color={greenColor} transform="translate(-10, -2)" /><Stick color={greenColor} transform="translate(0, -2)" /><Stick color={greenColor} transform="translate(10, -2)" /><Stick color={blueColor} transform="translate(-10, 18)" /><Stick color={greenColor} transform="translate(0, 18)" /><Stick color={blueColor} transform="translate(10, 18)" /></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.65)"><g transform="translate(0, -15) scale(1.2)"><path d="M -12 -8 L -6 0 L -12 8 M 0 -8 L 6 0 L 0 8 M 12 -8 L 18 0 L 12 8" stroke={greenColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g><g transform="translate(0, 15) scale(1.2)"><path d="M -12 -8 L -6 0 L -12 8 M 0 -8 L 6 0 L 0 8 M 12 -8 L 18 0 L 12 8" stroke={greenColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={redColor} transform="translate(-10, -18)" /><Stick color={redColor} transform="translate(0, -18)" /><Stick color={redColor} transform="translate(10, -18)" /><Stick color={greenColor} transform="translate(-10, 0)" /><Stick color={greenColor} transform="translate(0, 0)" /><Stick color={greenColor} transform="translate(10, 0)" /><Stick color={blueColor} transform="translate(-10, 18)" /><Stick color={blueColor} transform="translate(0, 18)" /><Stick color={blueColor} transform="translate(10, 18)" /></g></svg>;
            default: return null;
        }
    }

    const symbolMap: Record<string, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    
    if (suit === 'characters') {
        const valueCharacter = value in symbolMap ? symbolMap[value] : ''
        return <svg viewBox="0 0 50 70" className="w-full h-full p-1" >
            <text x="50%" y="10%" dominantBaseline="hanging" textAnchor="middle" fontSize="12" fill={redColor} className="font-bold font-headline">{value}</text>
            <text x="50%" y="30%" dominantBaseline="middle" textAnchor="middle" fontSize="24" fill={blueColor} className="font-bold font-headline">{valueCharacter}</text>
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
