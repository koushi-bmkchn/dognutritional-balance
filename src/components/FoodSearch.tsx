import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
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
    const [fuse, setFuse] = useState<Fuse<Ingredient> | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Fuse
    useEffect(() => {
        // ingredientsData is any because it's imported from json, assume Type cast
        const data = ingredientsData as unknown as Ingredient[];
        const fuseInstance = new Fuse(data, {
            keys: ['name', 'kana'],
            threshold: 0.4, // Adjust for fuzziness
        });
        setFuse(fuseInstance);
    }, []);

    // Search effect
    useEffect(() => {
        if (!fuse || !query) {
            setResults([]);
            return;
        }
        const searchRes = fuse.search(query);
        setResults(searchRes.map(r => r.item).slice(0, 10)); // Top 10 results
    }, [query, fuse]);

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
        onAdd({ ...ingredient, amount: 100 }); // Default 100g
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
        // Scroll input to top of viewport after short delay for keyboard
        setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    return (
        <div className="w-full space-y-2 relative" ref={containerRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    placeholder="食材を追加 (例: とりささみ)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    className="pl-9 pr-9 text-base bg-white"
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
