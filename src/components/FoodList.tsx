import React from 'react';
import { SelectedFood } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, X } from 'lucide-react';

interface FoodListProps {
    foods: SelectedFood[];
    onUpdate: (foods: SelectedFood[]) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onUpdate }) => {
    // Helper for full-width conversion
    const toHalfWidth = (str: string) => {
        return str.replace(/[０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    };

    const handleAmountChange = (index: number, val: string) => {
        // Auto-convert full-width
        const normalized = toHalfWidth(val);

        // Allow digits only (and empty)
        if (normalized !== '' && !/^\d+$/.test(normalized)) return;

        const newFoods = [...foods];
        if (normalized === '') {
            newFoods[index].amount = 0;
        } else {
            newFoods[index].amount = Number(normalized);
        }
        onUpdate(newFoods);
    };

    const handleIncrement = (index: number) => {
        const newFoods = [...foods];
        newFoods[index].amount = (newFoods[index].amount || 0) + 10;
        onUpdate(newFoods);
    };

    const handleDecrement = (index: number) => {
        const newFoods = [...foods];
        const current = newFoods[index].amount || 0;
        newFoods[index].amount = Math.max(0, current - 10);
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
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-[#3f3f3f] truncate">{food.name}</div>
                        <div className="text-sm text-[#7a8082]">{Math.round(food.calories * (food.amount / 100))} kcal</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => handleDecrement(index)}
                            className="flex items-center justify-center h-8 w-8 rounded-full border border-[#a0b870] text-[#6b8a3e] hover:bg-[#c8dda0] active:bg-[#b5d080] transition-colors"
                            aria-label="10g減らす"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={food.amount}
                            placeholder="0"
                            onChange={(e) => handleAmountChange(index, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-16 text-center h-10 text-base"
                        />
                        <button
                            type="button"
                            onClick={() => handleIncrement(index)}
                            className="flex items-center justify-center h-8 w-8 rounded-full border border-[#a0b870] text-[#6b8a3e] hover:bg-[#c8dda0] active:bg-[#b5d080] transition-colors"
                            aria-label="10g増やす"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-slate-500 w-4 ml-0.5">g</span>
                        <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="flex items-center justify-center h-7 w-7 ml-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                            aria-label="削除"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
