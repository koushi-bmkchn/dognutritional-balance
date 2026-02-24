'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getAssetPath, smoothScrollTo } from '@/lib/utils';
import { DogProfile, SelectedFood } from '@/types';
import { DogProfileForm } from '@/components/DogProfileForm';
import { FoodSearch } from '@/components/FoodSearch';
import { FoodList } from '@/components/FoodList';
import { DryFoodInput } from '@/components/DryFoodInput';
import { DiagnosticResult } from '@/components/DiagnosticResult';
import { RecommendedIngredients } from '@/components/RecommendedIngredients';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logCalculation } from '@/utils/logging';
import { SectionTitle } from '@/components/SectionTitle';
import { DRY_FOOD_NUTRIENT_TEMPLATE } from '@/data/dryFoodTemplate';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
    // Global State
    const [profile, setProfile] = useState<DogProfile>({
        name: '',
        age: '',
        weight: '',
        activity: '',
    });

    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
    const [dryFoodAmount, setDryFoodAmount] = useState(0);
    const [isCalculated, setIsCalculated] = useState(false);
    const [feedingType, setFeedingType] = useState<'homemade' | 'topping'>('homemade');

    // 手作りのみに切り替えた時、ドライフード量をリセット
    useEffect(() => {
        if (feedingType === 'homemade') {
            setDryFoodAmount(0);
        }
    }, [feedingType]);

    // ドライフードを含む全食材リスト（計算用）
    const allFoods = useMemo(() => {
        const foods = [...selectedFoods];
        if (dryFoodAmount > 0) {
            foods.push({ ...DRY_FOOD_NUTRIENT_TEMPLATE, amount: dryFoodAmount });
        }
        return foods;
    }, [selectedFoods, dryFoodAmount]);

    // Scroll to results when calculated
    const resultsRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (isCalculated && resultsRef.current) {
            // Light delay to ensuring render
            setTimeout(() => {
                smoothScrollTo(resultsRef.current!, 800, -20);
            }, 100);
        }
    }, [isCalculated]);

    const handleAddFood = (food: SelectedFood) => {
        setSelectedFoods([...selectedFoods, food]);
    };

    const handleRemoveFood = (foodId: string) => {
        setSelectedFoods(selectedFoods.filter(f => f.id !== foodId));
    };

    const handleUpdateFood = (updatedFood: SelectedFood) => {
        setSelectedFoods(selectedFoods.map(f => f.id === updatedFood.id ? updatedFood : f));
    };

    const handleCalculate = () => {
        // Send data to spreadsheet (silent, non-blocking)
        logCalculation(profile, allFoods, feedingType, dryFoodAmount);

        // Update UI state
        setIsCalculated(true);
    };

    const handleReset = () => {
        // プロフィールは維持、食材・計算状態をリセット
        setSelectedFoods([]);
        setDryFoodAmount(0);
        setFeedingType('homemade');
        setIsCalculated(false);
    };

    return (
        <main className="min-h-[120vh] bg-[#fcf2ea] font-sans">
            <div className="max-w-md mx-auto bg-[#fcf2ea] min-h-screen pb-40">
                {/* Site Header */}
                <header className="w-full h-14 bg-[#fcf2ea] flex items-center justify-start px-4 border-b border-[#f0eadd] shadow-md relative z-10">
                    <a href="https://www.wanchan-life.jp/" className="hover:opacity-80 transition-opacity">
                        <img
                            src={getAssetPath("/images/logo.png")}
                            alt="Wanchan Life"
                            className="h-6 w-auto object-contain"
                        />
                    </a>
                </header>

                {/* Header Image - Full Width */}
                <div className="w-full">
                    <img
                        src={getAssetPath("/images/header.png?v=2")}
                        alt="Header"
                        className="w-full h-auto no-drag"
                        draggable="false"
                    />
                </div>

                {/* Main Content Area - Padded */}
                <div className="px-4 pt-6 space-y-6">
                    {/* Header Text */}
                    <div className="text-center space-y-2">
                        <h1 className="text-lg font-bold text-[#e08863] leading-snug">
                            実は不足しがちな栄養を、<br />簡単チェック。
                        </h1>
                        <p className="text-sm font-medium text-[#3f3f3f] leading-relaxed text-left inline-block max-w-[95%]">
                            食材を入力するだけで、愛犬に「必要な栄養バランス」を手軽に診断できます。
                        </p>
                    </div>

                    {/* 1. Profile Section */}
                    <section>
                        <DogProfileForm profile={profile} onChange={setProfile} />
                    </section>

                    {/* 2. Food Section */}
                    <section className="space-y-4">
                        <Card className="bg-[#fcf2ea] border-none shadow-none">
                            <SectionTitle title="食材を選ぶ" english="STEP 2" />
                            <div className="border-b border-[#d5d1cd]/50 mb-4" />
                            <CardContent className="pt-0 px-0">
                                <div className="space-y-4">
                                    {/* Feeding Type Selector */}
                                    <div className="flex justify-center">
                                        <div className="relative flex p-1 bg-white rounded-md border border-[#a0b870] w-full">
                                            {/* Sliding Background Indicator */}
                                            <div
                                                className="absolute top-1 bottom-1 bg-[#6b8a3e] rounded-md transition-all duration-300 ease-out"
                                                style={{
                                                    width: 'calc(50% - 4px)',
                                                    left: feedingType === 'homemade' ? '2px' : 'calc(50% + 2px)',
                                                }}
                                            />
                                            <button
                                                onClick={() => setFeedingType('homemade')}
                                                className={`relative z-10 flex-1 py-2 text-sm rounded-md transition-all duration-200 ${feedingType === 'homemade'
                                                    ? 'text-white font-bold'
                                                    : 'text-[#6b8a3e] font-medium'
                                                    }`}
                                            >
                                                手作りのみ
                                            </button>
                                            <button
                                                onClick={() => setFeedingType('topping')}
                                                className={`relative z-10 flex-1 py-2 text-sm rounded-md transition-all duration-200 ${feedingType === 'topping'
                                                    ? 'text-white font-bold'
                                                    : 'text-[#6b8a3e] font-medium'
                                                    }`}
                                            >
                                                トッピング
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dry Food Input - トッピング時のみ表示 */}
                                    {feedingType === 'topping' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
                                            <DryFoodInput amount={dryFoodAmount} onChange={setDryFoodAmount} />
                                        </div>
                                    )}

                                    <FoodSearch onAdd={handleAddFood} />

                                    <FoodList
                                        foods={selectedFoods.filter(f => f.id !== 'supple-001')}
                                        onUpdate={setSelectedFoods}
                                    />

                                    {/* Reset Button + Note */}
                                    {isCalculated && (
                                        <div className="pt-2 space-y-2">
                                            <p className="text-xs text-[#7a8082] text-center">
                                                食材や量を変更すると自動でグラフに反映されます。
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="w-full border-[#d5d1cd] text-[#7a8082] hover:bg-[#f5ede4] hover:text-[#3f3f3f] h-12 rounded-xl transition-all duration-200"
                                                onClick={handleReset}
                                            >
                                                リセット
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Calculate Button */}
                    {!isCalculated && (selectedFoods.length > 0 || dryFoodAmount > 0) && (
                        <div className="pt-2 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Button
                                className="w-full bg-[#c8763d] hover:bg-[#e08863] text-[#ffffff] font-bold h-14 rounded-xl shadow-lg text-lg transition-transform duration-200 transform hover:scale-[1.02] active:scale-95"
                                onClick={handleCalculate}
                            >
                                計算する
                            </Button>
                        </div>
                    )}

                    {/* 3. Result Section (Conditional) */}
                    {isCalculated && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <section ref={resultsRef} className="scroll-mt-4">
                                <DiagnosticResult
                                    profile={profile}
                                    foods={allFoods}
                                    feedingType={feedingType}
                                    onAddFood={handleAddFood}
                                    onRemoveFood={handleRemoveFood}
                                    onUpdateFood={handleUpdateFood}
                                />
                            </section>
                        </div>
                    )}
                </div>

                {/* LP Banner Section - Full Width (Between Results and Recommendations) */}
                {isCalculated && (
                    <section className="mt-4 w-full animate-in fade-in slide-in-from-bottom-8 duration-900 delay-100">
                        <a href="https://shop.wanchan-life.jp/lp?u=spoonful_calculation" className="block transition-transform hover:opacity-95">
                            <img
                                src={getAssetPath("/images/banner.png")}
                                alt="Special Offer"
                                className="w-full h-auto no-drag"
                                draggable="false"
                            />
                        </a>
                    </section>
                )}

                {/* 4. Recommended Ingredients Section (After Banner, Padded) */}
                {isCalculated && (
                    <div className="px-4 pt-8 pb-6 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        <section>
                            <RecommendedIngredients />
                        </section>

                        {/* Standards Info Accordion */}
                        <section>
                            <Card className="w-full border-none shadow-none">
                                <CardHeader className="py-3 bg-[#7a8082] rounded-t-lg">
                                    <CardTitle className="text-lg text-white">基準値について</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full">
                                        <AccordionItem value="aafco" className="border-[#d5d1cd]/50">
                                            <AccordionTrigger className="text-[#7a8082]">AAFCO基準とは</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm text-[#3f3f3f] leading-relaxed">
                                                    AAFCOは、わんちゃんに必要な栄養素の目安を定めた栄養基準です。
                                                    <br />手作りごはんは食材によって栄養素が大きく変わるため、必要量を満たしているかを確認する目的で、AAFCO基準と比較しています。
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="comprehensive" className="border-[#d5d1cd]/50">
                                            <AccordionTrigger className="text-[#7a8082]">総合栄養食基準とは</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm text-[#3f3f3f] leading-relaxed">
                                                    総合栄養食は、お水とそのフードだけで栄養が整うよう設計された理想的なバランスのごはんです。
                                                    <br />トッピングを加えると栄養素の比率が変わるため、本来のバランスから崩れていないかを確認する目的で、総合栄養食基準と比較しています。
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                )}

            </div>
        </main>
    );
}
