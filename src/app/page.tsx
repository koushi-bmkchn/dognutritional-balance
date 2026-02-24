'use client';

import React, { useState } from 'react';
import { DogProfile, SelectedFood } from '@/types';
import { DogProfileForm } from '@/components/DogProfileForm';
import { FoodSearch } from '@/components/FoodSearch';
import { FoodList } from '@/components/FoodList';
import { DiagnosticResult } from '@/components/DiagnosticResult';
import { RecommendedIngredients } from '@/components/RecommendedIngredients';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logCalculation } from '@/utils/logging';

export default function Home() {
    // Global State
    const [profile, setProfile] = useState<DogProfile>({
        name: '',
        age: '',
        weight: '',
        activity: '',
    });

    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
    const [isCalculated, setIsCalculated] = useState(false);

    // Scroll to results when calculated
    const resultsRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (isCalculated && resultsRef.current) {
            // Slight delay to ensure render completion and smooth animation start
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isCalculated]);

    const handleAddFood = (food: SelectedFood) => {
        setSelectedFoods([...selectedFoods, food]);
    };

    const handleCalculate = () => {
        // Send data to spreadsheet (silent, non-blocking)
        logCalculation(profile, selectedFoods);

        // Update UI state
        setIsCalculated(true);
    };

    return (
        <main className="min-h-screen bg-[#fcf2ea] font-sans">
            <div className="max-w-md mx-auto bg-[#fcf2ea] min-h-screen pb-40">
                {/* Header - Full Width */}
                <div className="w-full">
                    <img
                        src="/inumeshi/images/header.png"
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
                            <CardHeader className="pb-3 bg-[#fcf2ea] rounded-t-lg border-b border-[#d5d1cd]/50 px-0">
                                <CardTitle className="text-xl text-[#3f3f3f]">食材を選ぶ</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 px-0">
                                <div className="space-y-4">
                                    <FoodSearch onAdd={handleAddFood} />

                                    {isCalculated && (
                                        <div className="bg-white border border-[#d5d1cd] rounded-md p-3 text-sm text-[#3f3f3f] text-center">
                                            一度「計算する」ボタンを押した後は、食材や量を変更すると自動でグラフに反映されます。
                                        </div>
                                    )}

                                    <FoodList foods={selectedFoods} onUpdate={setSelectedFoods} />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Calculate Button */}
                    {!isCalculated && selectedFoods.length > 0 && (
                        <div className="pt-2 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Button
                                className="w-full bg-[#c8763d] hover:bg-[#e08863] text-[#ffffff] font-bold h-14 rounded-xl shadow-lg text-lg transition-all transform hover:scale-[1.02] active:scale-95"
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
                                <DiagnosticResult profile={profile} foods={selectedFoods} />
                            </section>

                            <section>
                                <RecommendedIngredients />
                            </section>
                        </div>
                    )}
                </div>

                {/* LP Banner Section - Full Width (Outside padded container) */}
                {isCalculated && (
                    <section className="mt-8 w-full">
                        <a href="#" className="block transition-transform hover:opacity-95">
                            <div className="w-full aspect-[3/1] bg-slate-200 relative">
                                <img
                                    src="/inumeshi/images/banner.png"
                                    alt="Special Offer"
                                    className="w-full h-full object-cover no-drag"
                                    draggable="false"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/0 transition-colors">
                                    <span className="sr-only">詳細はこちら</span>
                                </div>
                            </div>
                        </a>
                    </section>
                )}

            </div>
        </main>
    );
}
