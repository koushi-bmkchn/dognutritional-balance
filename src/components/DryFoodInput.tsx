import React from 'react';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface DryFoodInputProps {
    amount: number;
    onChange: (amount: number) => void;
}

export const DryFoodInput: React.FC<DryFoodInputProps> = ({ amount, onChange }) => {
    // Helper for full-width conversion
    const toHalfWidth = (str: string) => {
        return str.replace(/[０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    };

    const handleAmountChange = (val: string) => {
        const normalized = toHalfWidth(val);
        if (normalized !== '' && !/^\d+$/.test(normalized)) return;
        onChange(normalized === '' ? 0 : Number(normalized));
    };

    const handleIncrement = () => {
        onChange((amount || 0) + 10);
    };

    const handleDecrement = () => {
        onChange(Math.max(0, (amount || 0) - 10));
    };

    const calories = Math.round(350 * ((amount || 0) / 100));

    return (
        <div className="bg-white rounded-md border border-[#a0b870] p-3 space-y-2">
            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-[#3f3f3f] truncate">ドライフード</div>
                    <div className="text-sm text-[#7a8082]">{calories} kcal</div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        className="flex items-center justify-center h-8 w-8 rounded-full border border-[#a0b870] text-[#6b8a3e] hover:bg-[#c8dda0] active:bg-[#b5d080] transition-colors"
                        aria-label="10g減らす"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={amount || ''}
                        placeholder="0"
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-16 text-center h-10 text-base"
                    />
                    <button
                        type="button"
                        onClick={handleIncrement}
                        className="flex items-center justify-center h-8 w-8 rounded-full border border-[#a0b870] text-[#6b8a3e] hover:bg-[#c8dda0] active:bg-[#b5d080] transition-colors"
                        aria-label="10g増やす"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-slate-500 w-4 ml-0.5">g</span>
                </div>
            </div>
            <p className="text-xs text-[#7a8082] leading-relaxed">
                一般的な総合栄養食（100g / 350kcal）の栄養値で計算
            </p>
        </div>
    );
};
