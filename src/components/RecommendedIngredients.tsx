import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const RecommendedIngredients: React.FC = () => {
    return (
        <Card className="w-full mt-6 border-none shadow-none">
            <CardHeader className="py-3 bg-[#e08863] rounded-t-lg">
                <CardTitle className="text-lg text-white">おすすめ食材</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="macronutrients" className="border-[#d5d1cd]/50">
                        <AccordionTrigger className="text-[#c8763d]">主要栄養素が摂れる食材</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 text-base text-[#3f3f3f]">
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">タンパク質</span><div>きな粉、鶏ささみ、鹿肉</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">脂質</span><div>油類、ごま、豚バラ</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">炭水化物</span><div>砂糖、穀物、いも類</div></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="vitamins" className="border-[#d5d1cd]/50">
                        <AccordionTrigger className="text-[#c8763d]">ビタミンが摂れる食材</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 text-base text-[#3f3f3f]">
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンA</span><div>レバー（全般）、焼きのり、にんじん</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンD</span><div>鮭、いわし、さんま</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンE</span><div>植物油脂、アーモンド、卵黄</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB1</span><div>豚肉、えごま、焼きのり</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB2</span><div>レバー（全般）、卵、あおさ</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB5</span><div>レバー（全般）、納豆、鶏肉</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB3</span><div>まぐろ、かつお、焼きのり</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB6</span><div>まぐろ、かつお、黒砂糖</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">葉酸</span><div>レバー（全般）、焼きのり、えだまめ</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ビタミンB12</span><div>貝類、炒り子、レバー（全般）</div></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="minerals" className="border-[#d5d1cd]/50">
                        <AccordionTrigger className="text-[#c8763d]">ミネラルが摂れる食材</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 text-base text-[#3f3f3f]">
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">カルシウム</span><div>炒り子、海藻類、ごま</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">リン</span><div>炒り子、かつお節、ごま</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">カリウム</span><div>海藻類、炒り子、きな粉</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ナトリウム</span><div>味噌、海藻類、チーズ</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">マグネシウム</span><div>海藻類、穀物、炒り子</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">鉄</span><div>レバー（鶏、豚）、炒り子、ごま</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">マンガン</span><div>あおさ、生姜、ごま</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">亜鉛</span><div>炒り子、レバー（豚）、牛肉</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">ヨウ素</span><div>海藻類、タラ、卵黄</div></div>
                                <div><span className="inline-block font-bold text-[#3f3f3f] text-sm bg-white border border-[#3f3f3f] rounded-full px-4 py-1 mb-1">セレン</span><div>レバー（全般）、青魚、卵</div></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
