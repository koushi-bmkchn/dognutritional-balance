import React, { useState, useEffect, useRef } from 'react';

import { Ingredient, SelectedFood } from '@/types';
import ingredientsData from '@/data/ingredients.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodSearchProps {
    onAdd: (food: SelectedFood) => void;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onAdd }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Ingredient[]>([]);
    // Search effect (Simple includes match)
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        // ingredientsData is any because it's imported from json, assume Type cast
        const data = ingredientsData as unknown as Ingredient[];

        const filtered = data.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(lowerQuery);
            const kanaMatch = Array.isArray(item.kana)
                ? item.kana.some((k: string) => k.includes(lowerQuery))
                : false;
            return nameMatch || kanaMatch;
        });

        // Sort: 3-tier priority
        // 0: kana[0] (primary reading) starts with query → highest priority
        // 1: name or kana[1+] starts with query → medium priority
        // 2: partial match only → lowest priority
        const getPriority = (item: Ingredient): number => {
            if (Array.isArray(item.kana) && item.kana[0]?.startsWith(lowerQuery)) return 0;
            if (item.name.toLowerCase().startsWith(lowerQuery)) return 1;
            if (Array.isArray(item.kana) && item.kana.slice(1).some((k: string) => k.startsWith(lowerQuery))) return 1;
            return 2;
        };

        const sorted = filtered.sort((a, b) => getPriority(a) - getPriority(b));

        setResults(sorted.slice(0, 10)); // Top 10 results
    }, [query]);

    // Click outside to close results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAdd = (ingredient: Ingredient) => {
        onAdd({ ...ingredient, amount: 10 }); // Default 10g
        setQuery('');
        setResults([]);
        setIsFocused(false);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Scroll input to near top of viewport (block: 'start') with offset via scroll-margin
        setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    };

    return (
        <div className="w-full space-y-2 relative" ref={containerRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    placeholder="食材を追加していけます (例: とりささみ)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    className="pl-9 pr-9 text-sm bg-white scroll-mt-24"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Results List - conditionally rendered */}
            {isFocused && (results.length > 0 || query.length > 0) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg border border-slate-200 shadow-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {results.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer active:bg-green-50 transition-colors"
                                    onClick={() => handleAdd(item)}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                        <span className="text-xs text-slate-500">100g / {item.calories}kcal</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 bg-green-50 rounded-full shrink-0">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        query.length > 0 && (
                            <div className="p-4 text-center text-slate-400 text-sm">
                                該当する食材が見つかりません
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
