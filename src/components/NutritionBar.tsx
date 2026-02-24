import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NutritionBarProps {
    label: string;
    value: number; // 実際の摂取量
    min: number;   // 基準値 (これが50%位置になる)
    max: number | null; // 上限値 (これが80%位置になる)
    unit: string;
    drawValue: number; // Total (0.0 - 2.5)
    baseDrawValue?: number; // Base (0.0 - 2.5)
}

export const NutritionBar: React.FC<NutritionBarProps> = ({
    label,
    value,
    min,
    max,
    unit,
    drawValue,
    baseDrawValue,
}) => {
    // Helper to calculate width percentage from drawValue
    // drawValue (0.0 - 2.5) -> width percentage (0% - 100%)
    // 1.0 -> 40%, 2.0 -> 80%
    const calculateWidth = (val: number) => Math.min(val * 40, 100);

    const totalWidth = calculateWidth(drawValue);
    const baseWidth = calculateWidth(baseDrawValue !== undefined ? baseDrawValue : drawValue);

    // Animation state for Total Width (or strictly the visible total)
    const [animatedTotalWidth, setAnimatedTotalWidth] = React.useState(0);
    const [animatedBaseWidth, setAnimatedBaseWidth] = React.useState(0);

    React.useEffect(() => {
        setAnimatedTotalWidth(totalWidth);
        setAnimatedBaseWidth(baseWidth);
    }, [totalWidth, baseWidth]);

    // Status determination (Based on Total)
    let status: 'deficiency' | 'optimal' | 'excess' = 'optimal';
    if (drawValue < 1.0) status = 'deficiency';
    else if (drawValue > 2.0) {
        status = max === null ? 'optimal' : 'excess';
    }

    // Status Badge Logic
    // If Deficiency -> Blue, Optimal -> Green, Excess -> Red
    const badgeColorClass = status === 'optimal' ? "bg-[#b9ce80] hover:bg-[#9aba60] text-[#2c5e2e]" :
        status === 'deficiency' ? "bg-[#a3c9e8] text-[#3b6a8c] hover:bg-[#8bbddf]" :
            "bg-[#f5a3a3] hover:bg-[#f08080] text-[#8b3a3a]";

    // Bar Colors
    // Base Bar: Standard logic (Blue if deficiency, Green otherwise)
    // Supplement Bar: Orange (#c8763d)

    // Base Status (independent check) based on baseDrawValue
    const baseVal = baseDrawValue !== undefined ? baseDrawValue : drawValue;
    const baseStatus = baseVal < 1.0 ? 'deficiency' : 'optimal'; // Simplification: Base won't be excess usually, but if it is, render Green?
    const baseBarColor = baseStatus === 'deficiency' ? "bg-[#a3c9e8]" : "bg-[#b9ce80]";

    return (
        <div className="grid grid-cols-[5rem_2.5rem_1fr_4rem] gap-2 items-center w-full mb-3 text-sm">
            {/* 1. Label */}
            <span className="font-medium text-[#3f3f3f] truncate text-[13px]" title={label}>
                {label}
            </span>

            {/* 2. Badge (Fixed width column for vertical alignment) */}
            <div className="flex justify-start">
                <Badge
                    variant={status === 'optimal' ? 'default' : 'secondary'}
                    className={cn(
                        "px-1 py-0 h-5 text-[10px] whitespace-nowrap min-w-[2.5rem] justify-center",
                        badgeColorClass
                    )}
                >
                    {status === 'deficiency' ? '不足' : status === 'optimal' ? '適正' : '過剰'}
                </Badge>
            </div>

            {/* 3. Bar Graph */}
            <div className="relative h-4 w-full bg-white rounded-[1.5px] overflow-hidden border border-[#e0e0e0]">
                {/* Track Background: Optimal Zone (40% - 80%) */}
                <div
                    className="absolute top-0 bottom-0 bg-[#b9ce80]/30"
                    style={{ left: '40%', width: '40%' }}
                />

                {/* Standard Line (40% - Min) */}
                <div className="absolute top-0 bottom-0 border-l border-[#d5d1cd] z-10" style={{ left: '40%' }} />

                {/* Max Line (80% - Max) */}
                <div className="absolute top-0 bottom-0 border-l border-[#d5d1cd] z-10" style={{ left: '80%' }} />

                {/* Base Bar (Green/Blue) */}
                <div
                    className={cn(
                        "absolute top-0 bottom-0 h-full transition-all duration-1000 ease-out z-20",
                        baseBarColor,
                        "rounded-[1.5px]"
                    )}
                    style={{ width: `${animatedBaseWidth}%` }}
                />

                {/* Layer 1 (Background): Total Bar (Orange) */}
                {/* Grows from 0 to Total. Hidden behind Base. */}
                <div
                    className={cn(
                        "absolute top-0 bottom-0 h-full transition-all duration-1000 ease-out z-10 bg-[#c8763d]",
                        "rounded-[1.5px]"
                    )}
                    style={{ width: `${animatedTotalWidth}%` }}
                />
            </div>

            {/* 4. Value */}
            <span className="font-bold text-[#3f3f3f] text-right whitespace-nowrap">
                {typeof value === 'number' && formatValue(value)}<span className="text-xs font-normal text-[#3f3f3f] ml-0.5">{unit}</span>
            </span>
        </div>
    );
};



// ... formatValue function needs to be inside or reused ...
// I removed formatValue in the replacement above, need to include it.
const formatValue = (v: number) => {
    if (v === 0) return "0";
    if (v < 0.001) {
        return parseFloat(v.toFixed(5)).toString();
    }
    if (v < 1) {
        return parseFloat(v.toFixed(3)).toString();
    }
    return Math.abs(v - Math.round(v)) < 0.05 ? v.toFixed(0) : v.toFixed(1);
};
