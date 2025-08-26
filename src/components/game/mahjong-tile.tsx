
'use client';
import { cn } from '@/lib/utils';
import React from 'react';

type TileSuit = 'bamboo' | 'dots' | 'characters' | 'wind' | 'dragon' | 'flower' | 'season';
type TileValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'E' | 'S' | 'W' | 'N' | 'R' | 'G' | 'B';

interface MahjongTileProps {
  suit: TileSuit;
  value: TileValue;
  className?: string;
  size?: 'md' | 'sm' | 'lg';
  isClickable?: boolean;
  isGolden?: boolean;
  isLatestDiscard?: boolean;
  isFaceDown?: boolean;
}

// SVG Components for Tiles

const TilePattern = ({ suit, value }: { suit: TileSuit, value: TileValue }) => {
    const redColor = "#D0332D";
    const greenColor = "#1A744F";
    const blueColor = "#1D1E3B";

    if (suit === 'dots') {
        const Dot = ({ color = blueColor, cx, cy }: { color?: string, cx: number, cy: number }) => (
           <circle cx={cx} cy={cy} r="6" fill={color} stroke="#000" strokeWidth="0.2" />
        );

        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(0, 10)"><circle cx="25" cy="25" r="20" fill="#F0F0E0" stroke="#888" strokeWidth="0.5"/><circle cx="25" cy="25" r="16" fill="none" stroke={greenColor} strokeWidth="2"/><circle cx="25" cy="25" r="8" fill={redColor} stroke="white" strokeWidth="1"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(45 25 25)"/><path d="M 25 9 A 16 16 0 0 1 25 41 A 16 16 0 0 1 25 9" fill="none" stroke={greenColor} strokeWidth="1" strokeDasharray="3 2" transform="rotate(-45 25 25)"/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="25" cy="18" /><Dot color={redColor} cx="25" cy="42" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="16" cy="16" /><Dot color={redColor} cx="25" cy="30" /><Dot color={greenColor} cx="34" cy="44" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="18" cy="18" /><Dot color={blueColor} cx="32" cy="18" /><Dot color={blueColor} cx="18" cy="42" /><Dot color={greenColor} cx="32" cy="42" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="16" cy="16" /><Dot color={greenColor} cx="34" cy="16" /><Dot color={redColor} cx="25" cy="30" /><Dot color={greenColor} cx="16" cy="44" /><Dot color={blueColor} cx="34" cy="44" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={redColor} cx="18" cy="15" /><Dot color={redColor} cx="32" cy="15" /><Dot color={blueColor} cx="18" cy="30" /><Dot color={blueColor} cx="32" cy="30" /><Dot color={blueColor} cx="18" cy="45" /><Dot color={blueColor} cx="32" cy="45" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><g transform="translate(2,0) rotate(10 25 18)"><Dot color={greenColor} cx="16" cy="18" /><Dot color={greenColor} cx="25" cy="18" /><Dot color={greenColor} cx="34" cy="18" /></g><g><Dot color={redColor} cx="18" cy="38" /><Dot color={redColor} cx="32" cy="38" /><Dot color={redColor} cx="18" cy="50" /><Dot color={redColor} cx="32" cy="50" /></g></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={blueColor} cx="18" cy="14" /><Dot color={blueColor} cx="32" cy="14" /><Dot color={blueColor} cx="18" cy="24" /><Dot color={blueColor} cx="32" cy="24" /><Dot color={blueColor} cx="18" cy="34" /><Dot color={blueColor} cx="32" cy="34" /><Dot color={blueColor} cx="18" cy="44" /><Dot color={blueColor} cx="32" cy="44" /></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(0, 5)"><Dot color={greenColor} cx="17" cy="15" /><Dot color={greenColor} cx="25" cy="15" /><Dot color={greenColor} cx="33" cy="15" /><Dot color={redColor} cx="17" cy="30" /><Dot color={redColor} cx="25" cy="30" /><Dot color={redColor} cx="33" cy="30" /><Dot color={blueColor} cx="17" cy="45" /><Dot color={blueColor} cx="25" cy="45" /><Dot color={blueColor} cx="33" cy="45" /></g></svg>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color = greenColor, transform, scale = 1 }: { color?: string; transform: string; scale?: number }) => (
            <g transform={`${transform} scale(${scale})`}>
                <rect x="-3" y="-10" width="6" height="20" rx="3" fill={color} stroke="#000" strokeWidth="0.2"/>
                <rect x="-1" y="-11" width="2" height="22" fill={color} />
                <circle cx="0" cy="0" r="1.5" fill="white" />
                <path d="M -3 4 L 3 4 M -3 -4 L 3 -4" stroke="white" strokeWidth="1" />
            </g>
        );
        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(25, 35) scale(0.9)"><path d="M-5,1 C-4.2,0.3 -2.2,0.3 -1.5,1.2 C-6.2,6.5 2,12 3,13 C4,14 6,14 7,13 C11,10 12,5 11,1 C10,-3 7,-3 5,-2 C7,-4 9,-4 10,-2 C12,0 12,3 11,5 C10,7 8,8 6,8 C-1,8 -9,-2 -11,-4 C-12,-5 -12,-7 -10,-8 C-8,-9 -6,-8 -5,-7 M-5,1 C-12,5 -18,13 -18,15 C-18,17 -16,18 -14,17 C-12,16 -11,14 -12,12 C-10,14 -9,16 -10,18 C-11,20 -13,20 -15,19 C-16,18 -17,16 -16,14 C-17,12 -17,9 -15,8 C-14,7 -12,8 -11,10 M3,13 C-2,18 2,24 3,25 C4,26 6,26 7,25 C12,20 16,12 15,10 C14,8 11,8 9,10" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/><path d="M-11 -4 C-16,-6 -20,-3 -20,0 C-20,3 -18,5 -15,5 C-12,5 -10,3 -11,0" fill={greenColor} stroke={blueColor} strokeWidth="0.5"/><circle cx="-13" cy="-1" r="1.5" fill="white" stroke="black" strokeWidth="0.5" /></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={blueColor} transform="translate(0, -13)" /><Stick color={greenColor} transform="translate(0, 13)" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={greenColor} transform="translate(0, -18)" /><Stick color={blueColor} transform="translate(-8, 13)" /><Stick color={greenColor} transform="translate(8, 13)" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={blueColor} transform="translate(-8, -13)" /><Stick color={greenColor} transform="translate(8, -13)" /><Stick color={greenColor} transform="translate(-8, 13)" /><Stick color={blueColor} transform="translate(8, 13)" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.65)"><Stick color={greenColor} transform="translate(-10, -16)" /><Stick color={blueColor} transform="translate(10, -16)" /><Stick color={redColor} transform="translate(0, 0)" /><Stick color={blueColor} transform="translate(-10, 16)" /><Stick color={greenColor} transform="translate(10, 16)" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={redColor} transform="translate(-10, -13)" /><Stick color={redColor} transform="translate(0, -13)" /><Stick color={redColor} transform="translate(10, -13)" /><Stick color={greenColor} transform="translate(-10, 13)" /><Stick color={greenColor} transform="translate(0, 13)" /><Stick color={greenColor} transform="translate(10, 13)" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.65)"><Stick color={redColor} transform="translate(0, -22)" /><Stick color={greenColor} transform="translate(-10, 0)" /><Stick color={greenColor} transform="translate(10, 0)" /><Stick color={blueColor} transform="translate(-10, 18)" /><Stick color={greenColor} transform="translate(0, 18)" /><Stick color={blueColor} transform="translate(10, 18)" /></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.2)"><g transform="translate(0, -10)"><path d="M -12 -5 L -6 2 L 0 -5 L 6 2 L 12 -5" stroke={greenColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g><g transform="translate(0, 10)"><path d="M -12 -2 L -6 5 L 0 -2 L 6 5 L 12 -2" stroke={blueColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(0.7)"><Stick color={redColor} transform="translate(-10, -18)" /><Stick color={redColor} transform="translate(0, -18)" /><Stick color={redColor} transform="translate(10, -18)" /><Stick color={greenColor} transform="translate(-10, 0)" /><Stick color={greenColor} transform="translate(0, 0)" /><Stick color={greenColor} transform="translate(10, 0)" /><Stick color={blueColor} transform="translate(-10, 18)" /><Stick color={blueColor} transform="translate(0, 18)" /><Stick color={blueColor} transform="translate(10, 18)" /></g></svg>;
            default: return null;
        }
    }

    const symbolMap: Record<string, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', 'E': '東', 'S': '南', 'W': '西', 'N': '北', 'R': '中', 'G': '發', 'B': '白' };
    
    if (suit === 'characters') {
        const valueCharacter = value in symbolMap ? symbolMap[value] : '';
        return <svg viewBox="0 0 50 70" className="w-full h-full p-1" >
            <text x="50%" y="28%" dominantBaseline="middle" textAnchor="middle" fontSize="24" fill={blueColor} className="font-bold font-headline">{valueCharacter}</text>
            <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontSize="32" fill={redColor} className="font-bold font-headline">萬</text>
        </svg>;
    }

    if (suit === 'wind' || suit === 'dragon') {
        const color = suit === 'dragon' && value === 'R' ? redColor : suit === 'dragon' && value === 'G' ? greenColor : blueColor;
        if (value === 'B') {
            return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><rect x="5" y="5" width="40" height="60" rx="3" fill="transparent" stroke={blueColor} strokeWidth="3"/></svg>;
        }
        return <svg viewBox="0 0 50 70" className="w-full h-full p-1">
             <text x="90%" y="10%" dominantBaseline="hanging" textAnchor="end" fontSize="12" fill={blueColor} className="font-bold font-headline">{value}</text>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fill={color} className="font-bold font-headline">{symbolMap[value]}</text>
        </svg>;
    }
    return null;
}

export function MahjongTile({ suit, value, className, size = 'md', isClickable = false, isGolden = false, isLatestDiscard = false, isFaceDown = false }: MahjongTileProps) {

  if (isFaceDown) {
    return (
       <div
          className={cn(
            'bg-green-700 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-green-900 overflow-hidden relative',
            'w-[1.5rem] h-[2rem]', // sm size
            size === 'md' && 'w-[6.5vw] h-[9vw] max-w-[65px] max-h-[90px]',
            size === 'lg' && 'w-16 h-24',
            className
          )}
        />
    )
  }

  return (
    <div
      className={cn(
        'bg-stone-50 rounded-md shadow-md flex items-center justify-center select-none border-b-4 border-stone-300 dark:border-stone-400/80 overflow-hidden relative',
        'dark:bg-gradient-to-b from-stone-50 to-stone-200',
        'w-[1.5rem] h-[2rem]', // sm size
        size === 'md' && 'w-[6.5vw] h-[9vw] max-w-[65px] max-h-[90px]',
        size === 'lg' && 'w-16 h-24',
        isClickable && 'transform transition-transform hover:-translate-y-2 cursor-pointer active:scale-95',
        isGolden && 'shadow-yellow-400/50 shadow-lg border-yellow-500 ring-2 ring-yellow-400',
        className
      )}
    >
        {isGolden && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>}
         {isLatestDiscard && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-primary animate-pulse"></div>
        )}
      <div className="w-full h-full flex items-center justify-center">
        <TilePattern suit={suit} value={value} />
      </div>
    </div>
  );
}

    