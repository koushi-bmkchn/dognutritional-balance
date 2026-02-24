import React, { useMemo, useState } from 'react';
import { DogProfile, SelectedFood, AAFCOStandard, StandardsData } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NutritionBar } from '@/components/NutritionBar';
import { NutrientRadarChart } from '@/components/NutrientRadarChart';
import { calculateDER, scaleStandard, calculateDrawValue } from '@/utils/nutrition';
import standardsRaw from '@/data/standards.json';
import { cn } from '@/lib/utils';

// Cast the imported JSON to the correct type
const standardsData = standardsRaw as unknown as StandardsData;

interface DiagnosticResultProps {
    profile: DogProfile;
    foods: SelectedFood[];
}

export const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ profile, foods }) => {
    // 1. Calculate DER
    const der = useMemo(() => calculateDER(profile), [profile]);

    // 2. Calculate Total Calories & Nutrients (Dynamic)
    const totals = useMemo(() => {
        return foods.reduce(
            (acc, food) => {
                const ratio = food.amount / 100;

                // Update calories & weight
                acc.calories = (acc.calories || 0) + food.calories * ratio;
                acc.weight = (acc.weight || 0) + food.amount;

                // Update all nutrients present in the food data
                if (food.nutrients) {
                    Object.entries(food.nutrients).forEach(([key, value]) => {
                        acc[key] = (acc[key] || 0) + value * ratio;
                    });
                }

                return acc;
            },
            { calories: 0, weight: 0 } as Record<string, number>
        );
    }, [foods]);

    // Round calories for display
    const totalCalories = Math.round(totals.calories);
    const totalWeight = totals.weight || 0;
    const totalMoisture = totals.moisture || 0;

    // 乾物量を計算 (Dry Matter)
    const dryMatterWeight = totalWeight - totalMoisture;

    // 3. Prepare Standards & Draw Values
    // Flatten all nutrients from all sections to calculate results
    const allStandards = standardsData.sections.flatMap(s => s.nutrients);

    const nutrientResults = allStandards.map((std) => {
        // Get raw intake from the dynamic totals object. If missing, default to 0.
        const rawIntake = totals[std.id] || 0;

        let intake: number;
        let displayUnit = std.unit;

        if (std.id === 'moisture') {
            // 水分は%表示に変換
            intake = totalWeight > 0 ? (rawIntake / totalWeight) * 100 : 0;
            displayUnit = '%';
        } else {
            // その他の栄養素は乾物ベースに変換
            // 乾物ベース値 = rawIntake * totalWeight / (totalWeight - totalMoisture)
            if (dryMatterWeight > 0) {
                intake = (rawIntake / totalWeight) / (dryMatterWeight / totalWeight) * totalWeight;
                // 簡略化: intake = rawIntake * totalWeight / dryMatterWeight
            } else {
                intake = rawIntake; // 乾物量が0の場合はそのまま
            }
        }

        // グラフ計算用: 乾物ベースの値を使用（水分はgで計算）
        const intakeForChart = std.id === 'moisture' ? rawIntake : intake;

        const { adjustedMin, adjustedMax } = scaleStandard(std, totalWeight);
        const drawValue = calculateDrawValue(intakeForChart, adjustedMin, adjustedMax);

        return {
            ...std,
            intake,
            unit: displayUnit,
            adjustedMin,
            adjustedMax,
            drawValue,
        };
    });

    // 4. Categorize Nutrients based on JSON sections
    const categories = standardsData.sections.map(section => {
        // Filter the calculated results to match this section's nutrients
        const sectionData = nutrientResults.filter(res =>
            section.nutrients.some(n => n.id === res.id)
        );

        return {
            id: section.id,
            name: section.name,
            data: sectionData,
            hasChart: true // Enable chart for all sections for now, or customize based on ID
        };
    }).sort((a, b) => {
        // Enforce order: macronutrients -> vitamins -> minerals
        const order = ['macronutrients', 'vitamins', 'minerals'];
        return order.indexOf(a.id) - order.indexOf(b.id);
    });

    const [activeTab, setActiveTab] = useState(categories.find(c => c.id === 'vitamins') ? 'vitamins' : categories[0]?.id || 'macronutrients');
    const activeCategory = categories.find(c => c.id === activeTab) || categories[0];

    // Ensure we have data before rendering
    if (!activeCategory) return null;

    return (
        <Card className="w-full bg-[#fcf2ea] border-none shadow-none">
            <CardHeader className="pb-3 bg-[#fcf2ea] rounded-t-lg border-b border-[#d5d1cd]/50">
                <CardTitle className="text-lg text-center text-[#3f3f3f]">栄養バランス計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-2 no-select" onCopy={(e) => e.preventDefault()}>

                {/* Calorie Status Meter */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <span className="text-sm text-[#3f3f3f] font-bold">カロリー摂取量</span>

                    {/* Semicircle Gauge Meter (Filled Arc) */}
                    <div className="relative w-64 h-40 overflow-visible">
                        <svg viewBox="0 0 200 130" className="w-full h-full">
                            {/* 1. Background Arc (Gray) */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="#e5e5e5"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />

                            {/* 2. Filled Progress Arc - Renders BEFORE Target Line to be BEHIND it */}
                            {(() => {
                                // Max Gauge Value = DER * 1.25 (Since 80% is Target)
                                const maxGaugeValue = der * 1.25;

                                // Current Ratio (0 to 1)
                                const ratio = Math.min(Math.max(totalCalories / maxGaugeValue, 0), 1);

                                // Arc Length = r * PI
                                const r = 80;
                                const arcLength = r * Math.PI;
                                const dashArray = `${arcLength * ratio} ${arcLength}`;

                                const isExcess = totalCalories > der;
                                const strokeColor = isExcess ? "#f5a3a3" : "#b9ce80"; // Red if excess, Green otherwise

                                return (
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth="20"
                                        strokeLinecap="round"
                                        strokeDasharray={dashArray}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                );
                            })()}

                            {/* 3. Target Line at 80% - Renders AFTER Fill to be ON TOP */}
                            {(() => {
                                const angleRad = 36 * (Math.PI / 180); // 36 degrees

                                // Inner/Outer points for tick mark
                                const rInner = 68;
                                const rOuter = 92;
                                const x1 = 100 + rInner * Math.cos(angleRad);
                                const y1 = 100 - rInner * Math.sin(angleRad);
                                const x2 = 100 + rOuter * Math.cos(angleRad);
                                const y2 = 100 - rOuter * Math.sin(angleRad);

                                return (
                                    <line
                                        x1={x1} y1={y1}
                                        x2={x2} y2={y2}
                                        stroke="#68804f"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                );
                            })()}
                        </svg>

                        {/* Meter Text Content (Absolute Overlay) */}
                        <div className="absolute inset-x-0 bottom-0 top-[20%] flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-[#3f3f3f] font-bold mb-0.5">摂取</span>
                            <div className="flex items-baseline mb-2">
                                <span className="text-3xl font-bold text-[#3f3f3f] leading-none">
                                    {totalCalories}
                                </span>
                                <span className="text-sm font-medium text-[#3f3f3f] ml-1">kcal</span>
                            </div>

                            <div className="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-[#b9ce80] transform translate-y-1">
                                <span className="text-xs text-[#68804f] font-bold">適正</span>
                                <span className="text-lg font-bold text-[#68804f] leading-none">
                                    {der} <span className="text-xs font-medium">kcal</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Segmented Control Tabs with Sliding Indicator */}

                {/* Segmented Control Tabs with Sliding Indicator */}
                <div className="flex justify-center mb-6">
                    <div className="relative flex p-1 bg-white rounded-md border border-[#d5d1cd]">
                        {/* Sliding Background Indicator */}
                        <div
                            className="absolute top-1 bottom-1 bg-[#c8763d] rounded-md transition-all duration-300 ease-out"
                            style={{
                                width: `calc(${100 / categories.length}% - 4px)`,
                                left: `calc(${categories.findIndex(c => c.id === activeTab) * (100 / categories.length)}% + 2px)`,
                            }}
                        />
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "relative z-10 px-4 py-2 text-sm rounded-md transition-all duration-200",
                                    activeTab === cat.id
                                        ? "text-white font-bold"
                                        : "text-[#c8763d] font-medium hover:text-[#a55f2a]"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full px-2 animate-in fade-in slide-in-from-bottom-2 duration-300 transform-gpu" key={activeTab}>
                    {activeCategory.hasChart && (
                        <div className="w-full mb-6 relative">
                            <NutrientRadarChart data={activeCategory.data} />
                        </div>
                    )}

                    <div className="space-y-1">
                        {activeCategory.data.map((item) => (
                            <NutritionBar
                                key={item.id}
                                label={item.name}
                                value={item.intake}
                                min={item.adjustedMin}
                                max={item.adjustedMax}
                                unit={item.unit}
                                drawValue={item.drawValue}
                            />
                        ))}
                        {/* Note about Dry Matter Calculation */}
                        <div className="text-right mt-1 pr-1">
                            <p className="text-[10px] text-[#7a8082]">※水分以外は乾物計算での値となっています。</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white rounded-xl border border-[#d5d1cd] text-center space-y-3">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#c8763d]">ビタミンサプリ わんこのひとさじ 適正量</h4>
                            <p className="text-xs text-[#7a8082]">※推奨量 100kcalあたり1g</p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="text-[#3f3f3f]">
                                <span className="text-2xl font-bold">{(totalCalories / 100).toFixed(1)}</span>
                                <span className="text-sm font-medium ml-1">g</span>
                                <span className="text-sm mx-2">/</span>
                                <span className="text-base font-bold">スプーン {(Math.ceil((totalCalories / 100 / 1.5) * 10) / 10).toFixed(1)}</span>
                                <span className="text-sm font-medium ml-1">杯</span>
                            </div>

                            {/* Spoon Icons Visualization */}
                            {/* Spoon Icons Visualization */}
                            <div className="flex flex-wrap justify-center gap-1 -mt-2">
                                {(() => {
                                    // 1 spoon = 150kcal
                                    const spoonCountExact = totalCalories / 150;
                                    const fullSpoons = Math.floor(spoonCountExact);
                                    const partialSpoon = spoonCountExact - fullSpoons;

                                    const spoons = [];

                                    // Full spoons
                                    for (let i = 0; i < fullSpoons; i++) {
                                        spoons.push(
                                            <div key={`spoon-full-${i}`} className="w-16 h-16">
                                                <img
                                                    src="/inumeshi/images/spoon_full.png"
                                                    alt="spoon"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        );
                                    }

                                    // Partial spoon
                                    if (partialSpoon > 0) {
                                        // User specification (Refined):
                                        // Top 25% is margin (empty)
                                        // Bottom 35% is margin (handle, empty)
                                        // Active bowl area = 100% - 25% - 35% = 40%
                                        // Fill logic:
                                        // partial = 1.0 (Full) -> Inset 25%
                                        // partial = 0.0 (Empty) -> Inset 65%
                                        const topMargin = 25;
                                        const bowlHeight = 40;
                                        const insetTop = topMargin + (1 - partialSpoon) * bowlHeight;

                                        spoons.push(
                                            <div key="spoon-partial" className="w-16 h-16 relative">
                                                {/* Background (Empty Spoon) */}
                                                <div className="absolute inset-0">
                                                    <img
                                                        src="/inumeshi/images/spoon_bg.png"
                                                        alt="spoon-bg"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                {/* Foreground (Filled Spoon) - Clipped from Top */}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{ clipPath: `inset(${insetTop}% 0 0 0)` }}
                                                >
                                                    <div className="w-16 h-16">
                                                        <img
                                                            src="/inumeshi/images/spoon_full.png"
                                                            alt="spoon-fill"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (spoons.length === 0) {
                                        // Show nothing if 0
                                    }

                                    return spoons;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
