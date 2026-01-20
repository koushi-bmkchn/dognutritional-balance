import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NutritionBarProps {
    label: string;
    value: number; // 実際の摂取量
    min: number;   // 基準値 (これが50%位置になる)
    max: number | null; // 上限値 (これが80%位置になる)
    unit: string;
    drawValue: number; // 0.0 - 2.0 (正規化された値)
}

export const NutritionBar: React.FC<NutritionBarProps> = ({
    label,
    value,
    min,
    max,
    unit,
    drawValue,
}) => {
    // drawValue (0.0 - 2.5) -> width percentage (0% - 100%)
    // drawValue=1.0 (Min) -> 40%
    // drawValue=2.0 (Max) -> 80%
    // drawValue=2.5 (AbsMax) -> 100%
    const targetWidth = Math.min(drawValue * 40, 100);

    // Animation state
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        // Delay slighty to trigger animation
        const timer = setTimeout(() => {
            setWidth(targetWidth);
        }, 100);
        return () => clearTimeout(timer);
    }, [targetWidth]);

    // Status determination
    let status: 'deficiency' | 'optimal' | 'excess' = 'optimal';
    if (drawValue < 1.0) status = 'deficiency';
    else if (drawValue > 2.0) { // New Excess threshold
        // If there is no max limit, treat as optimal even if value is high (capped at 2.0 anyway)
        status = max === null ? 'optimal' : 'excess';
    }

    // Bar Color Logic
    let barColorClass = "bg-[#b9ce80]"; // Optimal: #b9ce80
    let isSplit = false;

    if (status === 'deficiency') {
        barColorClass = "bg-[#a3c9e8]"; // Light Blue
    } else if (status === 'excess') {
        isSplit = true;
        barColorClass = "bg-[#b9ce80]"; // Optimal
    }

    // Value display formatter
    const formatValue = (v: number) => {
        if (v === 0) return "0";
        if (v < 1) {
            // For small numbers, show up to 3 decimal places, removing trailing zeros
            return parseFloat(v.toFixed(3)).toString();
        }
        return Math.abs(v - Math.round(v)) < 0.05 ? v.toFixed(0) : v.toFixed(1);
    };

    return (
        <div className="grid grid-cols-[5rem_2.5rem_1fr_4rem] gap-2 items-center w-full mb-3 text-sm">
            {/* 1. Label */}
            <span className="font-medium text-[#3f3f3f] truncate" title={label}>
                {label}
            </span>

            {/* 2. Badge (Fixed width column for vertical alignment) */}
            <div className="flex justify-start">
                <Badge
                    variant={status === 'optimal' ? 'default' : 'secondary'}
                    className={cn(
                        "px-1 py-0 h-5 text-[10px] whitespace-nowrap min-w-[2.5rem] justify-center",
                        status === 'optimal' ? "bg-[#b9ce80] hover:bg-[#9aba60] text-[#2c5e2e]" :
                            status === 'deficiency' ? "bg-[#a3c9e8] text-[#3b6a8c] hover:bg-[#8bbddf]" :
                                "bg-[#f5a3a3] hover:bg-[#f08080] text-[#8b3a3a]"
                    )}
                >
                    {status === 'deficiency' ? '不足' : status === 'optimal' ? '適正' : '過剰'}
                </Badge>
            </div>

            {/* 3. Bar Graph */}
            <div className="relative h-4 w-full bg-white rounded-sm overflow-hidden border border-[#e0e0e0]">
                {/* Track Background: Optimal Zone (40% - 80%) */}
                {/* Min=1.0 -> 40%, Max=2.0 -> 80% */}
                <div
                    className="absolute top-0 bottom-0 bg-[#b9ce80]/30"
                    style={{ left: '40%', width: '40%' }}
                />

                {/* Standard Line (40% - Min) */}
                <div className="absolute top-0 bottom-0 border-l border-[#d5d1cd] z-10" style={{ left: '40%' }} />

                {/* Max Line (80% - Max) - Optional but helpful */}
                <div className="absolute top-0 bottom-0 border-l border-[#d5d1cd] z-10" style={{ left: '80%' }} />

                {/* Main Bar */}
                <div
                    className={cn(
                        "absolute top-0 bottom-0 h-full transition-all duration-1000 ease-out", // Slower duration for "Goon" effect
                        barColorClass,
                        isSplit ? "rounded-l-sm" : "rounded-sm"
                    )}
                    style={{ width: `${isSplit ? 80 : width}%` }}
                />

                {/* Excess Red Bar (Starts from 80%) */}
                {isSplit && (
                    <div
                        className="absolute top-0 bottom-0 h-full bg-[#f5a3a3] transition-all duration-1000 ease-out rounded-r-sm"
                        style={{ left: '80%', width: `${Math.max(0, width - 80)}%` }}
                    />
                )}
            </div>

            {/* 4. Value */}
            <span className="font-bold text-[#3f3f3f] text-right whitespace-nowrap">
                {formatValue(value)}<span className="text-xs font-normal text-[#3f3f3f] ml-0.5">{unit}</span>
            </span>
        </div>
    );
};
