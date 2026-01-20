import React from 'react';
import { SelectedFood } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface FoodListProps {
    foods: SelectedFood[];
    onUpdate: (foods: SelectedFood[]) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onUpdate }) => {
    const handleAmountChange = (index: number, val: string) => {
        // Allow digits only (and empty)
        if (val !== '' && !/^\d+$/.test(val)) return;

        const newFoods = [...foods];
        if (val === '') {
            newFoods[index].amount = 0;
        } else {
            newFoods[index].amount = Number(val);
        }
        onUpdate(newFoods);
    };

    const handleDelete = (index: number) => {
        const newFoods = foods.filter((_, i) => i !== index);
        onUpdate(newFoods);
    };

    if (foods.length === 0) return null;

    return (
        <div className="space-y-2 mt-4">
            {foods.map((food, index) => (
                <div key={`${food.id}-${index}`} className="flex items-center gap-3 p-3 bg-[#deecb8] rounded-md border border-[#deecb8]">
                    <div className="flex-1">
                        <div className="text-base font-bold text-[#3f3f3f]">{food.name}</div>
                        <div className="text-sm text-[#7a8082]">{Math.round(food.calories * (food.amount / 100))} kcal</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={food.amount}
                            placeholder="0"
                            onChange={(e) => handleAmountChange(index, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-20 text-right h-8"
                        />
                        <span className="text-xs text-slate-500 w-4">g</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => handleDelete(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
