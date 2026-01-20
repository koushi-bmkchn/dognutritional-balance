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

    // 3. Prepare Standards & Draw Values
    // Flatten all nutrients from all sections to calculate results
    const allStandards = standardsData.sections.flatMap(s => s.nutrients);

    const nutrientResults = allStandards.map((std) => {
        // Get intake from the dynamic totals object. If missing, default to 0.
        const intake = totals[std.id] || 0;

        const { adjustedMin, adjustedMax } = scaleStandard(std, totalWeight);
        const drawValue = calculateDrawValue(intake, adjustedMin, adjustedMax);

        return {
            ...std,
            intake,
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
            <CardHeader className="pb-2 bg-[#fcf2ea] rounded-t-lg">
                <CardTitle className="text-lg text-center text-[#3f3f3f]">栄養バランス計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-2">

                {/* Calorie Status */}
                <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="text-sm text-[#3f3f3f] font-medium">カロリー摂取量</span>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-[#3f3f3f] mb-1">摂取</span>
                            <span className="text-3xl font-bold text-[#3f3f3f]">{totalCalories}</span>
                            <span className="text-xs text-[#3f3f3f]">kcal</span>
                        </div>

                        <span className="text-2xl text-[#3f3f3f] font-light">/</span>

                        <div className="flex flex-col items-center">
                            <span className="text-xs text-[#3f3f3f] mb-1">適正</span>
                            <span className="text-2xl font-medium text-[#3f3f3f]">{der}</span>
                            <span className="text-xs text-[#3f3f3f]">kcal</span>
                        </div>
                    </div>

                </div>

                <div className="border-t border-[#d5d1cd]/50 my-4" />

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
                        <div className="w-full mb-6">
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
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
