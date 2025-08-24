
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
            case '2': return <svg viewBox="0 0 50 70"><Dot color={greenColor} cx="25" cy="20" /><Dot color={redColor} cx="25" cy="50" /></svg>;
            case '3': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="15" cy="18" /><Dot color={redColor} cx="25" cy="35" /><Dot color={greenColor} cx="35" cy="52" /></svg>;
            case '4': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="17" cy="20" /><Dot color={greenColor} cx="33" cy="20" /><Dot color={greenColor} cx="17" cy="50" /><Dot color={blueColor} cx="33" cy="50" /></svg>;
            case '5': return <svg viewBox="0 0 50 70"><Dot color={blueColor} cx="17" cy="20" /><Dot color={greenColor} cx="33" cy="20" /><Dot color={redColor} cx="25" cy="35" /><Dot color={greenColor} cx="17" cy="50" /><Dot color={blueColor} cx="33" cy="50" /></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(0, -2)"><Dot color={greenColor} cx="18" cy="18" /><Dot color={greenColor} cx="32" cy="18" /><Dot color={redColor} cx="18" cy="37" /><Dot color={redColor} cx="32" cy="37" /><Dot color={redColor} cx="18" cy="56" /><Dot color={redColor} cx="32" cy="56" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(2, -2)"><g transform="translate(0, 2) rotate(15 25 25)"><Dot color={greenColor} cx="15" cy="18" /><Dot color={greenColor} cx="25" cy="25" /><Dot color={greenColor} cx="35" cy="32" /></g><Dot color={redColor} cx="18" cy="46" /><Dot color={redColor} cx="32" cy="46" /><Dot color={redColor} cx="18" cy="60" /><Dot color={redColor} cx="32" cy="60" /></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(0, 2)"><Dot color={blueColor} cx="17" cy="12" /><Dot color={blueColor} cx="33" cy="12" /><Dot color={blueColor} cx="17" cy="26" /><Dot color={blueColor} cx="33" cy="26" /><Dot color={blueColor} cx="17" cy="40" /><Dot color={blueColor} cx="33" cy="40" /><Dot color={blueColor} cx="17" cy="54" /><Dot color={blueColor} cx="33" cy="54" /></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(0, 2)"><Dot color={greenColor} cx="17" cy="15" /><Dot color={greenColor} cx="25" cy="15" /><Dot color={greenColor} cx="33" cy="15" /><Dot color={redColor} cx="17" cy="34" /><Dot color={redColor} cx="25" cy="34" /><Dot color={redColor} cx="33" cy="34" /><Dot color={blueColor} cx="17" cy="53" /><Dot color={blueColor} cx="25" cy="53" /><Dot color={blueColor} cx="33" cy="53" /></g></svg>;
            default: return null;
        }
    }

    if (suit === 'bamboo') {
        const Stick = ({ color = greenColor, transform }: { color?: string, transform: string }) => (
            <g transform={transform}>
                 <rect x="-3.5" y="-6" width="7" height="12" rx="3.5" fill={color}/>
                 <rect x="-1.5" y="-7" width="3" height="14" fill={color}/>
                 <circle cx="0" cy="0" r="1.5" fill="white"/>
                 <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="white" strokeWidth="1.5"/>
            </g>
        );
        switch (value) {
            case '1': return <svg viewBox="0 0 50 70" className="w-full h-full p-2"><g transform="translate(1, 4) scale(0.9)"><path d="M25.8,11.5c-2.4-0.1-4.2,1.1-5.5,2.7c-1,1.3-2,2.7-3.1,4c-1.2,1.5-2.6,2.9-4.3,3.8 c-1.1,0.6-2.3,0.9-3.6,0.7c-1.5-0.2-2.8-1-3.6-2.3c-0.8-1.3-0.9-2.8-0.5-4.3c0.5-1.7,1.6-3.1,3.2-4.1 c-0.2-3,0-5.9,0.3-8.9c0-0.9,0.8-1.7,1.7-1.7c0.9,0,1.7,0.8,1.7,1.7c-0.2,2.6-0.4,5.2-0.3,7.8c2.1-1.1,4.5-1.7,6.9-1.7 c3,0,5.9,0.9,8.4,2.5c2.9-3.2,5.7-6.3,8.6-9.4c0.6-0.6,1.6-0.7,2.3-0.1c0.7,0.6,0.7,1.6,0.1,2.3c-2.9,3.1-5.7,6.2-8.6,9.4 c1.3,0.5,2.6,1.1,3.8,1.7c2.6,1.4,4.8,3.3,6.5,5.6c0.6,0.8,0.4,1.9-0.4,2.4c-0.8,0.6-1.9,0.4-2.4-0.4c-1.5-2-3.4-3.7-5.8-4.9 c-1.2-0.6-2.4-1.1-3.7-1.5c-3.5,3.9-7,7.8-10.5,11.7c-0.6,0.7-1.7,0.7-2.3,0.1c-0.7-0.6-0.7-1.7-0.1-2.3 C19.9,33.5,23.4,29.6,26.9,25.7c-0.6-0.2-1.2-0.4-1.8-0.7c-2.1-0.8-4.1-2-5.7-3.6c-0.1,2.5-0.1,5,0,7.5c0,0.9-0.8,1.7-1.7,1.7 c-0.9,0-1.7-0.8-1.7-1.7c-0.1-2.6-0.1-5.2,0-7.8c-1.2,0.8-2.2,1.8-2.9,3c-0.7,1.2-0.9,2.5-0.6,3.8c0.3,1.3,1.1,2.4,2.3,2.9 c1.2,0.5,2.5,0.4,3.7-0.1c1.5-0.7,2.8-1.7,3.8-3c1-1.3,1.9-2.7,2.8-4.1c0.9-1.4,1.7-2.8,3.4-3.4c0.9-0.3,1.8-0.3,2.7,0 C24.4,11.1,25.1,11.3,25.8,11.5z" fill={greenColor}/><circle cx="11" cy="10" r="2.5" fill="white" stroke={greenColor} strokeWidth="1"/><circle cx="11" cy="10" r="1.2" fill={redColor}/></g></svg>;
            case '2': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={greenColor} transform="translate(0, -9)" /><Stick color={redColor} transform="translate(0, 9)" /></g></svg>;
            case '3': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={greenColor} transform="translate(0, -12)" /><Stick color={redColor} transform="translate(-7, 9)" /><Stick color={redColor} transform="translate(7, 9)" /></g></svg>;
            case '4': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={blueColor} transform="translate(-7, -9)" /><Stick color={greenColor} transform="translate(7, -9)" /><Stick color={greenColor} transform="translate(-7, 9)" /><Stick color={blueColor} transform="translate(7, 9)" /></g></svg>;
            case '5': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={greenColor} transform="translate(-8, -12)" /><Stick color={redColor} transform="translate(8, -12)" /><Stick color={blueColor} transform="translate(0, 0)" /><Stick color={redColor} transform="translate(-8, 12)" /><Stick color={greenColor} transform="translate(8, 12)" /></g></svg>;
            case '6': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={greenColor} transform="translate(-7, -12)" /><Stick color={greenColor} transform="translate(7, -12)" /><Stick color={redColor} transform="translate(-7, 0)" /><Stick color={redColor} transform="translate(7, 0)" /><Stick color={redColor} transform="translate(-7, 12)" /><Stick color={redColor} transform="translate(7, 12)" /></g></svg>;
            case '7': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><Stick color={redColor} transform="translate(0, -18)" /><Stick color={greenColor} transform="translate(-8, -3)" /><Stick color={greenColor} transform="translate(0, -3)" /><Stick color={greenColor} transform="translate(8, -3)" /><Stick color={blueColor} transform="translate(-8, 12)" /><Stick color={blueColor} transform="translate(0, 12)" /><Stick color={blueColor} transform="translate(8, 12)" /></g></svg>;
            case '8': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.5)"><g transform="translate(0, -11)"><path d="M -10 -8 l 5 8 l -5 8 M 0 -8 l 5 8 l -5 8 M 10 -8 l 5 8 l -5 8" stroke={greenColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g><g transform="translate(0, 11)"><path d="M -10 -8 l 5 8 l -5 8 M 0 -8 l 5 8 l -5 8 M 10 -8 l 5 8 l -5 8" stroke={blueColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g></g></svg>;
            case '9': return <svg viewBox="0 0 50 70"><g transform="translate(25, 35) scale(1.6)"><Stick color={redColor} transform="translate(-8, -13)" /><Stick color={redColor} transform="translate(0, -13)" /><Stick color={redColor} transform="translate(8, -13)" /><Stick color={greenColor} transform="translate(-8, 0)" /><Stick color={greenColor} transform="translate(0, 0)" /><Stick color={greenColor} transform="translate(8, 0)" /><Stick color={blueColor} transform="translate(-8, 13)" /><Stick color={blueColor} transform="translate(0, 13)" /><Stick color={blueColor} transform="translate(8, 13)" /></g></svg>;
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
