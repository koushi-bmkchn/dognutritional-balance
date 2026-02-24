import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
    title: string;
    english: string;
    className?: string;
    englishColor?: string; // Optional override for English text color
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
    title,
    english,
    className,
    englishColor = "text-gray-300" // Default to slightly darker gray
}) => {
    return (
        <div className={cn("relative py-6 text-center overflow-hidden", className)}>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-[#3f3f3f] tracking-wider">
                    {title}
                </h2>
            </div>

            {/* English Background Text */}
            <div
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black opacity-50 select-none pointer-events-none whitespace-nowrap",
                    englishColor,
                )}
            >
                {english}
            </div>
        </div>
    );
};
