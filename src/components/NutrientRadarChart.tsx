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
    A: number; // drawValue
    fullMark: number; // 2.0 (MAX)
}

interface NutrientRadarChartProps {
    data: {
        name: string;
        drawValue: number;
        adjustedMin: number;
        adjustedMax: number | null;
    }[];
}

export const NutrientRadarChart: React.FC<NutrientRadarChartProps> = ({ data }) => {
    // フォーマット変換
    const chartData: NutrientData[] = data.map((item) => ({
        subject: item.name,
        A: Math.min(item.drawValue, 2.5), // 2.5でクリップ
        fullMark: 2.0,
    }));

    // Create background data for zones
    // 1. Red Zone (2.0 - 2.5) -> Base Layer
    // 2. Green Zone (1.0 - 2.0) -> Middle Layer
    // 3. White Zone (0 - 1.0) -> Top Mask Layer

    const enhancedChartData = chartData.map(d => ({
        ...d,
        warningMark: 2.5,
        fullMark: 2.0,
        minMark: 1.0,
        grid05: 0.5,
        grid15: 1.5,
        // grid10 and grid20 are covered by background boundaries, but we can add them if we want explicit lines
        grid10: 1.0,
        grid20: 2.0,
    }));

    const gridColor = "#d5d1cd"; // natural-stone

    return (
        <div className="w-full h-[300px] flex justify-center items-center bg-white rounded-lg" style={{ pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={enhancedChartData}>
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#4a5a63', fontSize: 11, fontWeight: 600 }}
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
                    <Radar dataKey="grid05" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid10" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid15" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />
                    <Radar dataKey="grid20" stroke={gridColor} strokeWidth={1} fill="none" isAnimationActive={false} />

                    {/* PolarGrid removed as it is hidden by backgrounds */}
                    {/* PolarRadiusAxis for ticks only */}
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 2.5]}
                        tick={false}
                        axisLine={false}
                        ticks={[0.5, 1.0, 1.5, 2.0, 2.5] as any}
                    />

                    {/* Actual Data Radar */}
                    <Radar
                        name="Balance"
                        dataKey="A"
                        stroke="#68804f"
                        strokeWidth={3}
                        fill="#68804f"
                        fillOpacity={0.5}
                        isAnimationActive={true}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
