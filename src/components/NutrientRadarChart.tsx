import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

interface NutrientData {
    subject: string;
    A: number; // drawValue (Total)
    baseA?: number; // baseDrawValue (Food only)
    fullMark: number; // 2.0 (MAX)
}

interface NutrientRadarChartProps {
    data: {
        name: string;
        drawValue: number;
        baseDrawValue?: number; // Add baseDrawValue
        adjustedMin: number;
        adjustedMax: number | null;
    }[];
}

export const NutrientRadarChart: React.FC<NutrientRadarChartProps> = ({ data }) => {
    // チャート表示用スケール変換（不足域を広く、適正域を圧縮）
    // 0-1.0 → 0-1.5 (×1.5)、1.0-2.0 → 1.5-2.0 (×0.5)、2.0-2.5 → 2.0-2.5 (×1.0)
    const chartScale = (v: number): number => {
        if (v <= 1.0) return v * 1.5;
        if (v <= 2.0) return 1.5 + (v - 1.0) * 0.5;
        return 2.0 + (v - 2.0);
    };

    // フォーマット変換（スケール変換適用）
    const chartData: NutrientData[] = data.map((item) => ({
        subject: item.name,
        A: chartScale(Math.min(item.drawValue, 2.5)),
        baseA: item.baseDrawValue !== undefined ? chartScale(Math.min(item.baseDrawValue, 2.5)) : undefined,
        fullMark: 2.0,
    }));

    // Create background data for zones（スケール変換適用）
    // 1. Red Zone (2.0 - 2.5) -> Base Layer
    // 2. Green Zone (1.5 - 2.0) -> Middle Layer (変換後: 1.0→1.5)
    // 3. White Zone (0 - 1.5) -> Top Mask Layer

    const enhancedChartData = chartData.map(d => ({
        ...d,
        warningMark: chartScale(2.5),  // 2.5
        fullMark: chartScale(2.0),     // 2.0
        minMark: chartScale(1.0),      // 1.5
        grid1: 0.5,
        grid2: 1.0,
        grid3: 1.5,
        grid4: 2.0,
    }));

    const gridColor = "#d5d1cd"; // natural-stone

    return (
        <div className="w-full h-[300px] flex justify-center items-center bg-white rounded-lg" style={{ pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={enhancedChartData}>
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#4a5a63', fontSize: 11, fontWeight: 600 }}
                        radius="70%"
                        tickSize={0}
                        tickLine={false}
                    />

                    {/* Background Radar 1: 2.5 (Red Warning Zone) */}
                    <Radar
                        name="Zone Warning"
                        dataKey="warningMark"
                        stroke={gridColor} // Outer boundary
                        strokeWidth={1}
                        fill="#ffdcdc" // Light Red (Excess)
                        fillOpacity={0.6}
                        isAnimationActive={false}
                    />

                    {/* Background Radar 2: 2.0 (Green Safe Zone) */}
                    <Radar
                        name="Zone Max"
                        dataKey="fullMark"
                        stroke="none"
                        fill="#deecb8" // Optimal: #deecb8
                        fillOpacity={0.8} // Slightly transparent to show lines
                        isAnimationActive={false}
                    />

                    {/* Background Radar 3: 1.0 (White Mask) */}
                    <Radar
                        name="Zone Min"
                        dataKey="minMark"
                        stroke="none"
                        fill="#ffffff"
                        fillOpacity={1} // Opaque
                        isAnimationActive={false}
                    />

                    {/* Manual Grid Lines (Overlays) */}
                    <Radar dataKey="grid1" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid2" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid3" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid4" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />

                    {/* PolarRadiusAxis for ticks only */}
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 2.5]}
                        tick={false}
                        axisLine={false}
                        ticks={[0.5, 1.0, 1.5, 2.0, 2.5] as any}
                    />

                    {/* Actual Data Radar Layer 1: Total (Food + Supplement) - Orange (Background) */}
                    <Radar
                        name="Total Balance"
                        dataKey="A"
                        stroke="#c8763d"
                        strokeWidth={2}
                        fill="#c8763d"
                        fillOpacity={0.3} // Increased transparency
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1000}
                    />

                    {/* Actual Data Radar Layer 2: Base (Food Only) - Green (Foreground) */}
                    {enhancedChartData.some(d => d.baseA !== undefined) && (
                        <Radar
                            name="Base Balance"
                            dataKey="baseA"
                            stroke="#68804f"
                            strokeWidth={2}
                            fill="#68804f"
                            fillOpacity={0.6} // Reduced transparency (Higher opacity)
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={1000}
                        />
                    )}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
