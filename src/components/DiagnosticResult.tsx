import { Minus, Plus } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { DogProfile, SelectedFood, AAFCOStandard, StandardsData, Ingredient } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NutritionBar } from '@/components/NutritionBar';
import { NutrientRadarChart } from '@/components/NutrientRadarChart';
import { calculateDER, scaleStandard, calculateDrawValue, calculateTotalNutrition } from '@/utils/nutrition';
import standardsRaw from '@/data/standards.json';
import standardsToppingRaw from '@/data/standards_topping.json';
import supplementsRaw from '@/data/supplements.json';
import { cn, getAssetPath, smoothScrollTo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/SectionTitle';

// Cast the imported JSON to the correct type
const standardsData = standardsRaw as unknown as StandardsData;
const standardsToppingData = standardsToppingRaw as unknown as StandardsData;
const supplementsData = supplementsRaw as unknown as Ingredient[];

interface DiagnosticResultProps {
    profile: DogProfile;
    foods: SelectedFood[];
    feedingType: 'homemade' | 'topping';
    onAddFood: (food: SelectedFood) => void;
    onRemoveFood: (foodId: string) => void;
    onUpdateFood?: (food: SelectedFood) => void;
}

export const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ profile, foods, feedingType, onAddFood, onRemoveFood, onUpdateFood }) => {
    // 1. Calculate DER
    const der = useMemo(() => calculateDER(profile), [profile]);

    // Select standards based on feeding type
    const activeStandardsData = useMemo(() => {
        return feedingType === 'topping' ? standardsToppingData : standardsData;
    }, [feedingType]);

    // 2. Calculate Total Calories & Nutrients (Dynamic)
    const totals = useMemo(() => calculateTotalNutrition(foods), [foods]);

    // Calculate Base (Food + DryFood, excluding supplement) Nutrients
    const baseTotals = useMemo(() => {
        const baseFoods = foods.filter(f => f.id !== 'supple-001');
        return calculateTotalNutrition(baseFoods);
    }, [foods]);

    // Calculate Food Only Calories (excluding supplement and dry food) for supplement recommendation
    const foodOnlyCalories = useMemo(() => {
        const foodOnly = foods.filter(f => f.id !== 'supple-001' && f.id !== 'dry-food-001');
        return Math.round(calculateTotalNutrition(foodOnly).calories);
    }, [foods]);

    // Round calories for display
    const totalCalories = Math.round(totals.calories);
    const totalWeight = totals.weight || 0;
    const totalMoisture = totals.moisture || 0;

    // Base values (for separated display)
    const baseCalories = Math.round(baseTotals.calories);
    const baseWeight = baseTotals.weight || 0;
    const baseMoisture = baseTotals.moisture || 0;

    // 乾物量を計算 (Dry Matter)
    const dryMatterWeight = totalWeight - totalMoisture;
    const baseDryMatterWeight = baseWeight - baseMoisture;

    // Supplement Calculation Logic (Refined)
    const supplement = foods.find(f => f.id === 'supple-001');
    const recommendedBaseAmount = parseFloat((foodOnlyCalories / 100).toFixed(1));

    // Local state for manual amount when not added to list
    const [manualAmount, setManualAmount] = useState<number>(recommendedBaseAmount);

    // Sync manual amount with recommendation when base calories change (only if not customized? let's just sync for guidance)
    // We only reset manual amount if the user hasn't "locked" it, but detecting intent is hard.
    // Simple logic: If supplement is NOT added, keep manualAmount in sync with recommendation.
    useEffect(() => {
        if (!supplement) {
            setManualAmount(recommendedBaseAmount);
        }
    }, [recommendedBaseAmount, supplement]);

    // Determine current display amount
    const currentAmount = supplement ? supplement.amount : manualAmount;

    // Handle Amount Change
    const handleAmountChange = (delta: number) => {
        const newAmount = Math.max(0, parseFloat((currentAmount + delta).toFixed(1)));

        if (supplement) {
            // If already added, update the food directly
            if (onUpdateFood) {
                onUpdateFood({ ...supplement, amount: newAmount });
            }
        } else {
            // If not added, update local state
            setManualAmount(newAmount);
        }
    };

    // Long Press Logic
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const isLongPress = React.useRef(false);

    const startPress = (delta: number) => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            // Continuous change starts
            // Step size for long press: 1.0g (as requested)
            const step = delta > 0 ? 1.0 : -1.0;
            // Fire once immediately
            handleAmountChange(step);
            // Then repeat
            intervalRef.current = setInterval(() => {
                handleAmountChange(step);
            }, 100); // 100ms interval for "click-click-click"
        }, 500); // 500ms hold to trigger
    };

    const endPress = (delta: number, e?: React.TouchEvent) => {
        // Prevent default touch behavior if needed (optional)
        if (e) e.preventDefault();

        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        if (!isLongPress.current) {
            // If released before long press, trigger single click (0.1g)
            handleAmountChange(delta);
        }
        isLongPress.current = false;
    };


    // 3. Prepare Standards & Draw Values
    const nutrientResults = useMemo(() => {
        const allStandards = activeStandardsData.sections.flatMap(s => s.nutrients);
        return allStandards.map((std) => {
            // --- Total Calculation (Food + Supplement) ---
            const rawIntake = totals[std.id] || 0;
            let intake: number;
            let displayUnit = std.unit;

            if (std.id === 'moisture') {
                intake = totalWeight > 0 ? (rawIntake / totalWeight) * 100 : 0;
                displayUnit = '%';
            } else {
                if (totalWeight > 0 && dryMatterWeight > 0) {
                    const moistureRate = totalMoisture / totalWeight;
                    intake = rawIntake / (1 - moistureRate);
                } else {
                    intake = rawIntake;
                }
            }
            const intakeForChart = std.id === 'moisture' ? rawIntake : intake;
            const { adjustedMin, adjustedMax } = scaleStandard(std, totalWeight);
            const drawValue = calculateDrawValue(intakeForChart, adjustedMin, adjustedMax);

            // --- Base Calculation (Food Only) ---
            const rawBaseIntake = baseTotals[std.id] || 0;
            let baseIntake: number;

            if (std.id === 'moisture') {
                baseIntake = baseWeight > 0 ? (rawBaseIntake / baseWeight) * 100 : 0;
            } else {
                // Using Base Dry Matter Weight
                if (baseDryMatterWeight > 0) {
                    baseIntake = (rawBaseIntake / baseWeight) / (baseDryMatterWeight / baseWeight) * baseWeight;
                } else {
                    baseIntake = rawBaseIntake;
                }
            }
            const baseIntakeForChart = std.id === 'moisture' ? rawBaseIntake : baseIntake;
            const baseDrawValue = calculateDrawValue(baseIntakeForChart, adjustedMin, adjustedMax);

            return {
                ...std,
                intake: std.id === 'moisture' ? intake : rawIntake, // Display value: % for moisture, Raw sum (As-Fed) for others
                unit: displayUnit,
                adjustedMin,
                adjustedMax,
                drawValue, // Chart value: Dry Matter Basis
                baseDrawValue, // Base Draw Value
            };
        });
    }, [foods, supplement, profile, totals, baseTotals, totalWeight, baseWeight, dryMatterWeight, baseDryMatterWeight, JSON.stringify(foods), JSON.stringify(supplement), JSON.stringify(profile)]);

    // 4. Categorize Nutrients... (Already done by filtering nutrientResults)
    const categories = useMemo(() => {
        return activeStandardsData.sections.map(section => {
            const sectionData = nutrientResults.filter(res =>
                section.nutrients.some(n => n.id === res.id)
            );
            return {
                id: section.id,
                name: section.name,
                data: sectionData,
                hasChart: true
            };
        }).sort((a, b) => {
            const order = ['macronutrients', 'vitamins', 'minerals'];
            return order.indexOf(a.id) - order.indexOf(b.id);
        });
    }, [nutrientResults]);

    const tabsRef = React.useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(categories.find(c => c.id === 'vitamins') ? 'vitamins' : categories[0]?.id || 'macronutrients');
    const activeCategory = categories.find(c => c.id === activeTab) || categories[0];

    // Animation Delay State: Starts at 1200ms (for initial scroll), resets to 0ms after initial animation
    const [animationDelay, setAnimationDelay] = useState(1200);

    // Data Staging for Animation
    // We hold "displayed" data separately from "actual" data.
    // If animationDelay > 0:
    //   - On Mount: Init with Zero values invisible or empty? Better to use "Zeroed" data so structure exists.
    //   - On Update: Keep old values?
    //   - Then update to New values after delay.

    // Helper to create zero-value version of categories structure for initial mount
    const createZeroCategories = (cats: typeof categories) => {
        return cats.map(c => ({
            ...c,
            data: c.data.map(d => ({ ...d, drawValue: 0, baseDrawValue: 0, intake: 0 }))
        }));
    };

    const [displayedCategories, setDisplayedCategories] = useState(() => {
        // Initial state: If delay exists (1200), start with Zero values to show "waiting" state.
        // Actually, if we start with Zero, Recharts will animate 0 -> 0 (nothing).
        // Then update to Real -> Recharts animates 0 -> Real.
        // This is perfect.
        return createZeroCategories(categories);
    });

    useEffect(() => {
        if (animationDelay > 0) {
            // Delay exists (Calculate or Add Supplement)
            // Wait, then show real data
            const timer = setTimeout(() => {
                setDisplayedCategories(categories);
            }, animationDelay);
            return () => clearTimeout(timer);
        } else {
            // No delay (Remove Supplement or Tab Switch)
            // Show real data immediately
            setDisplayedCategories(categories);
        }
    }, [categories, animationDelay]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationDelay(0);
        }, 2500); // 1200ms delay + 1000ms animation + buffer
        return () => clearTimeout(timer);
    }, []);

    const activeDisplayedCategory = displayedCategories.find(c => c.id === activeTab) || displayedCategories[0];

    // Ensure we have data before rendering
    if (!activeDisplayedCategory) return null;

    return (
        <Card className="w-full bg-[#fcf2ea] border-none shadow-none">
            <SectionTitle title="栄養バランス計算結果" english="CHECK" />
            <div className="border-b border-[#d5d1cd]/50 mb-6" />
            <CardContent className="space-y-6 pt-0 px-2 no-select" onCopy={(e) => e.preventDefault()}>

                {/* Calorie Status Meter */}
                <div className="flex flex-col items-center justify-center space-y-1">
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
                        {der === 0 ? (
                            <p className="absolute -bottom-1 left-0 w-full text-center text-[10px] text-[#e05d5d] font-bold whitespace-nowrap">
                                ※プロフィールを入力することで適正カロリーが表示されます。
                            </p>
                        ) : (
                            <p className="absolute -bottom-1 left-0 w-full text-center text-[10px] text-[#3f3f3f] font-bold whitespace-nowrap">
                                ※1日あたりの適正カロリーとなります。
                            </p>
                        )}
                    </div>
                </div>


                {/* Segmented Control Tabs with Sliding Indicator */}

                {/* Segmented Control Tabs with Sliding Indicator */}
                <div ref={tabsRef} className="flex justify-center mb-6">
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

                {/* Standard Annotation */}
                <p className="text-xs text-[#7a8082] text-right pr-2 mt-2 mb-1">
                    {feedingType === 'topping' ? '※総合栄養食基準' : '※AAFCO基準'}
                </p>

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
                                baseDrawValue={item.baseDrawValue}
                            />
                        ))}

                    </div>

                    <div className="mt-8 p-4 bg-white rounded-xl border border-[#d5d1cd] text-center space-y-3">
                        <div className="space-y-1 relative z-10">
                            <p className="text-[13px] font-medium text-[#555555]">不足する栄養を手軽に足せる</p>
                            <h4 className="text-lg font-bold text-[#c8763d]">わんこのひとさじ 適正量</h4>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                            {/* Layout: Left Spoon Image | Right Controls */}
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                {/* Left: Single Spoon Visualization (Dynamic Fill) */}
                                <div className="w-20 h-20 sm:w-28 sm:h-28 relative flex-shrink-0 -ml-1 -mt-2 sm:-ml-2 sm:-mt-6 z-0">
                                    {/* Background (Empty Spoon) */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={getAssetPath("/images/spoon_bg.png")}
                                            alt="spoon-bg"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {/* Foreground (Filled Spoon) - Clipped from Top */}
                                    {(() => {
                                        // 1 spoon = 1.5g
                                        // "1.0杯の時は満タン、1.1になったらまた0.1杯の表示になるように"
                                        const spoonUnit = 1.5;
                                        const spoons = currentAmount / spoonUnit;

                                        // Get fractional part (e.g., 1.1 spoons -> 0.1)
                                        let ratio = spoons - Math.floor(spoons);

                                        // Edge case: Exact integer multiples (1.0, 2.0...) should show FULL, not empty.
                                        // Use a small epsilon for float precision, though inputs are typically 0.1 steps.
                                        // 1.5g / 1.5 = 1.0. ratio = 0.
                                        if (ratio < 0.001 && spoons > 0.001) {
                                            ratio = 1.0;
                                        }

                                        // 0g case
                                        if (currentAmount === 0) ratio = 0;

                                        // Clip path calculation (0% to 100% of bowl height)
                                        const topMargin = 25; // % from top where bowl starts
                                        const bowlHeight = 40; // % height of the bowl
                                        const insetTop = topMargin + (1 - ratio) * bowlHeight;

                                        return (
                                            <div
                                                className="absolute inset-0"
                                                style={{ clipPath: `inset(${insetTop}% 0 0 0)` }}
                                            >
                                                <img
                                                    src={getAssetPath("/images/spoon_full.png")}
                                                    alt="spoon-full"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Right: Controls & Text */}
                                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                                    {/* Controls */}
                                    <div className="flex items-center gap-2 sm:gap-4 text-[#3f3f3f] bg-[#fcf2ea] px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm">
                                        <button
                                            onMouseDown={() => startPress(-0.1)}
                                            onMouseUp={() => endPress(-0.1)}
                                            onMouseLeave={() => endPress(-0.1)}
                                            onTouchStart={() => startPress(-0.1)}
                                            onTouchEnd={(e) => endPress(-0.1, e)}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-[#e08863]/20 active:scale-95 transition-colors text-[#c8763d]"
                                        >
                                            <Minus className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                        </button>

                                        <div className="flex items-baseline min-w-[3.5rem] sm:min-w-[4rem] justify-center">
                                            <span className="text-xl sm:text-2xl font-bold">{currentAmount.toFixed(1)}</span>
                                            <span className="text-xs font-bold ml-1">g</span>
                                        </div>

                                        <button
                                            onMouseDown={() => startPress(0.1)}
                                            onMouseUp={() => endPress(0.1)}
                                            onMouseLeave={() => endPress(0.1)}
                                            onTouchStart={() => startPress(0.1)}
                                            onTouchEnd={(e) => endPress(0.1, e)}
                                            className="p-1.5 sm:p-2 rounded-full hover:bg-[#e08863]/20 active:scale-95 transition-colors text-[#c8763d]"
                                        >
                                            <Plus className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Spoon Count Text */}
                                    <div className="text-[#3f3f3f] text-sm sm:text-base font-bold">
                                        スプーン {(Math.ceil((currentAmount / 1.5) * 10) / 10).toFixed(1)} 杯分
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Supplement Button */}
                        <div className="pt-2">
                            {(() => {
                                const isAdded = !!supplement;

                                return (
                                    <Button
                                        onClick={() => {
                                            if (isAdded) {
                                                setAnimationDelay(0); // No delay for removing
                                                onRemoveFood('supple-001');
                                            } else {
                                                setAnimationDelay(1200); // 1.2s delay for adding
                                                const suppleData = supplementsData.find(s => s.id === 'supple-001');
                                                if (suppleData) {
                                                    // Add with the currently displayed manual value
                                                    onAddFood({
                                                        ...suppleData,
                                                        amount: currentAmount,
                                                    });
                                                    // Scroll to tabs
                                                    setTimeout(() => {
                                                        if (tabsRef.current) {
                                                            smoothScrollTo(tabsRef.current, 800, -80);
                                                        }
                                                    }, 100);

                                                    // Reset delay after animation
                                                    setTimeout(() => setAnimationDelay(0), 2500);
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "font-bold rounded-full px-6 w-52 shadow-md transition-all duration-200 transform active:scale-95",
                                            isAdded
                                                ? "bg-[#c8763d] hover:bg-[#e08863] text-white"
                                                : "bg-white text-[#c8763d] border-2 border-[#c8763d] hover:bg-[#fcf2ea]"
                                        )}
                                    >
                                        {isAdded ? '元に戻す' : 'ひとさじ足してみる'}
                                    </Button>
                                );
                            })()}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
