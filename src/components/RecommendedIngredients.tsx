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
                    <AccordionItem value="vitamins" className="border-[#d5d1cd]/50">
                        <AccordionTrigger className="text-[#c8763d]">ビタミンが摂れる食材</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 text-base text-[#3f3f3f]">
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンA:</span> レバー</p>
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンD:</span> 魚類</p>
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンE:</span> かぼちゃ、オリーブオイル、赤パプリカ</p>
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンB1:</span> 豚肉</p>
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンB2、B5:</span> レバー</p>
                                <p><span className="font-bold text-[#3f3f3f]">ビタミンB3、B6:</span> かつお、まぐろ</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="minerals" className="border-[#d5d1cd]/50">
                        <AccordionTrigger className="text-[#c8763d]">ミネラルが摂れる食材</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 text-base text-[#3f3f3f]">
                                <p><span className="font-bold text-[#3f3f3f]">ミネラル類:</span> 海藻類、ごま</p>
                                <p><span className="font-bold text-[#3f3f3f]">鉄:</span> 豚レバー、鶏レバー</p>
                                <p><span className="font-bold text-[#3f3f3f]">銅:</span> 牛レバー</p>
                                <p><span className="font-bold text-[#3f3f3f]">マンガン:</span> 海苔類</p>
                                <p><span className="font-bold text-[#3f3f3f]">亜鉛:</span> 牛肉</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
