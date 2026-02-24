import React, { useState } from 'react';
import { DogProfile } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Dog, Minus, Plus } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';

const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};

interface DogProfileFormProps {
    profile: DogProfile;
    onChange: (profile: DogProfile) => void;
}

export const DogProfileForm: React.FC<DogProfileFormProps> = ({ profile, onChange }) => {
    const [activeStep, setActiveStep] = useState(-1); // -1:None selected, 0:Name, 1:Age, 2:Weight, 3:Activity

    const handleChange = (field: keyof DogProfile, value: any) => {
        onChange({ ...profile, [field]: value });
    };

    const handleAgeChange = (delta: number) => {
        // Allow numeric change, min 0
        const currentAge = profile.age === '' ? 0 : profile.age;
        const newAge = Math.max(0, Math.floor(currentAge + delta));
        handleChange('age', newAge);
    };

    const handleWeightChange = (delta: number) => {
        // Allow numeric change, min 0.1
        const currentWeight = profile.weight === '' ? 0 : profile.weight;
        const newWeight = Math.max(0.1, Number((currentWeight + delta).toFixed(1)));
        handleChange('weight', newWeight);
    };

    const preventNonNumericInput = (e: React.KeyboardEvent, allowDecimal: boolean) => {
        // Allowed keys: Backspace, Delete, Tab, Escape, Enter, Arrows, Home, End
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
        ];

        if (allowedKeys.includes(e.key)) {
            return;
        }

        // Allow numbers
        if (/^[0-9]$/.test(e.key)) {
            return;
        }

        // Allow decimal point if permitted and not already present
        if (allowDecimal && e.key === '.') {
            // Get current value from target
            const target = e.target as HTMLInputElement;
            if (!target.value.includes('.')) {
                return;
            }
        }

        // Block everything else
        e.preventDefault();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Move to next step if not last
            if (activeStep < 3) {
                setActiveStep(activeStep + 1);
            }
        }
    };

    // Logic to determine if a step is accessible (unlocked)
    const isStepUnlocked = (index: number): boolean => {
        if (index === 0) return true; // Name always unlocked
        if (index === 1) return true; // Age always unlocked (name is optional)
        if (index === 2) return profile.age !== ''; // Weight unlocked if Age valid (allow 0)
        if (index === 3) return isStepUnlocked(2) && profile.weight !== ''; // Activity unlocked if Weight > 0
        return false;
    };

    // Helper to check if a step is "Completed" (has valid data)
    const isStepCompleted = (index: number) => {
        if (index === 0) return profile.name.trim().length > 0;
        if (index === 1) return profile.age !== '';
        if (index === 2) return profile.weight !== '';
        if (index === 3) return profile.activity !== '';
        return false;
    };

    const handleStepClick = (index: number) => {
        if (isStepUnlocked(index)) {
            setActiveStep(index);
        }
    };

    // Style helper
    const getStepStyle = (index: number) => {
        const isActive = activeStep === index;
        const isCompleted = isStepCompleted(index);
        const unlocked = isStepUnlocked(index);

        if (isActive) {
            // If active but already completed (has value), keep the completed border color
            if (isCompleted) {
                return "border-[#7a8082] bg-white shadow-sm";
            }
            return "border-[#d5d1cd] bg-white shadow-sm"; // Active: Default Border
        }
        if (isCompleted) {
            return "border-[#7a8082] bg-white shadow-sm"; // Completed: #7a8082
        }
        if (unlocked) {
            return "border-[#d5d1cd] bg-white hover:bg-white";
        }
        return "border-[#d5d1cd] bg-[#d5d1cd] opacity-50 pointer-events-none"; // Inactive
    };

    const getLabelStyle = (index: number) => {
        const isActive = activeStep === index;
        const isCompleted = isStepCompleted(index);

        if (isActive) return "text-[#3f3f3f] font-bold";
        if (isCompleted) return "text-[#3f3f3f] font-bold";
        return "text-[#3f3f3f]";
    };

    const getArrowStyle = (index: number) => {
        // No arrow for the last step
        if (index >= 3) return "hidden";

        const isActive = activeStep === index;
        const isCompleted = isStepCompleted(index);
        const unlocked = isStepUnlocked(index);

        let borderColor = "border-[#d5d1cd]";
        let bgColor = "bg-white";

        if (isActive) {
            borderColor = isCompleted ? "border-[#7a8082]" : "border-[#d5d1cd]";
        } else if (isCompleted) {
            borderColor = "border-[#7a8082]";
        } else if (unlocked) {
            borderColor = "border-[#d5d1cd]";
        } else {
            // Inactive
            borderColor = "border-[#d5d1cd]";
            bgColor = "bg-[#d5d1cd]";
        }

        return cn(
            "absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b-2 border-r-2 z-10",
            borderColor,
            bgColor
        );
    };








    return (
        <Card className="w-full bg-[#fcf2ea] border-none shadow-none">
            <SectionTitle title="うちの子プロフィール" english="STEP 1" />
            <div className="border-b border-[#d5d1cd]/50 mb-4" />
            <CardContent className="space-y-4 pt-0">

                {/* Step 1: Name */}
                <div
                    className={cn(
                        "relative transition-all duration-300 border-2 rounded-lg p-3 cursor-pointer",
                        getStepStyle(0)
                    )}
                    onClick={() => handleStepClick(0)}
                >
                    <Label className={cn("text-sm mb-1 block", getLabelStyle(0))}>
                        お名前
                    </Label>
                    <Input
                        value={profile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="例 ポチ"
                        className={cn(
                            "text-base text-center font-bold text-[#3f3f3f] focus-visible:ring-natural-salmon focus-visible:border-natural-salmon placeholder:text-[#9a9a9f] placeholder:font-normal",
                            activeStep !== 0 && "bg-transparent border-none p-0 h-auto text-[#3f3f3f]"
                        )}
                        onFocus={() => setActiveStep(0)}
                        onKeyDown={(e) => handleKeyDown(e, 0)}
                    />
                    {/* Arrow */}
                    <div className={getArrowStyle(0)} />
                </div>

                {/* Step 2: Age (Counter UI) */}
                <div
                    className={cn(
                        "relative transition-all duration-300 border-2 rounded-lg p-3 cursor-pointer",
                        getStepStyle(1)
                    )}
                    onClick={() => handleStepClick(1)}
                >
                    <Label className={cn("text-sm mb-1 block", getLabelStyle(1))}>
                        年齢 (歳)
                    </Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleAgeChange(-1); }}
                            className={cn("h-10 w-10 shrink-0", activeStep !== 1 && "hidden")}
                            disabled={activeStep !== 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                placeholder="-"
                                value={profile.age === '' ? '' : String(profile.age)}
                                onChange={(e) => {
                                    const val = toHalfWidth(e.target.value).replace(/[^0-9]/g, '');
                                    handleChange('age', val === '' ? '' : Number(val));
                                }}
                                className={cn(
                                    "text-center text-lg font-bold focus-visible:ring-natural-salmon focus-visible:border-natural-salmon",
                                    activeStep !== 1 && "bg-transparent border-none p-0 h-auto text-[#3f3f3f]"
                                )}
                                onFocus={() => setActiveStep(1)}
                                onKeyDown={(e) => handleKeyDown(e, 1)}
                                ref={(input) => { if (input && activeStep === 1) input.focus() }}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleAgeChange(1); }}
                            className={cn("h-10 w-10 shrink-0", activeStep !== 1 && "hidden")}
                            disabled={activeStep !== 1}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Arrow */}
                    <div className={getArrowStyle(1)} />
                </div>

                {/* Step 3: Weight (Counter UI) */}
                <div
                    className={cn(
                        "relative transition-all duration-300 border-2 rounded-lg p-3 cursor-pointer",
                        getStepStyle(2)
                    )}
                    onClick={() => handleStepClick(2)}
                >
                    <Label className={cn("text-sm mb-1 block", getLabelStyle(2))}>
                        体重 (kg)
                    </Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleWeightChange(-0.1); }}
                            className={cn("h-10 w-10 shrink-0", activeStep !== 2 && "hidden")}
                            disabled={activeStep !== 2}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="-"
                                value={profile.weight === '' ? '' : String(profile.weight)}
                                onChange={(e) => {
                                    // Convert full-width to half-width, then allow only digits and one dot
                                    let val = toHalfWidth(e.target.value).replace(/[^0-9.]/g, '');

                                    // Prevent multiple dots
                                    const dots = val.split('.').length - 1;
                                    if (dots > 1) return;

                                    handleChange('weight', val === '' ? '' : val); // Temporarily keep string to allow typing "."
                                }}
                                onBlur={() => {
                                    // Finalize as number on blur
                                    if (profile.weight !== '') {
                                        handleChange('weight', Number(profile.weight));
                                    }
                                }}
                                className={cn(
                                    "text-center text-lg font-bold focus-visible:ring-natural-salmon focus-visible:border-natural-salmon",
                                    activeStep !== 2 && "bg-transparent border-none p-0 h-auto text-[#3f3f3f]"
                                )}
                                onFocus={() => setActiveStep(2)}
                                onKeyDown={(e) => handleKeyDown(e, 2)}
                                ref={(input) => { if (input && activeStep === 2) input.focus() }}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleWeightChange(0.1); }}
                            className={cn("h-10 w-10 shrink-0", activeStep !== 2 && "hidden")}
                            disabled={activeStep !== 2}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Arrow */}
                    <div className={getArrowStyle(2)} />
                </div>

                {/* Step 4: Activity (Select) */}
                <div
                    className={cn(
                        "relative transition-all duration-300 border-2 rounded-lg p-3 cursor-pointer",
                        getStepStyle(3)
                    )}
                    onClick={() => handleStepClick(3)}
                >
                    <Label className={cn("text-sm mb-1 block", getLabelStyle(3))}>
                        活動量
                    </Label>
                    {activeStep === 3 ? (
                        <Select
                            value={profile.activity === '' ? undefined : profile.activity}
                            onValueChange={(value: any) => {
                                handleChange('activity', value);
                                setActiveStep(4);
                            }}
                            onOpenChange={() => setActiveStep(3)}
                        >
                            <SelectTrigger className="w-full text-sm font-bold text-[#3f3f3f] flex justify-between items-center">
                                <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low"><span className="text-xs">少ない（お散歩なし・室内遊びが中心）</span></SelectItem>
                                <SelectItem value="normal"><span className="text-xs">普通（1日30分前後のお散歩あり）</span></SelectItem>
                                <SelectItem value="high"><span className="text-xs">多い（1日1時間以上のお散歩あり）</span></SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="text-sm font-bold text-[#3f3f3f] pl-1 h-10 flex items-center justify-between">
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {profile.activity === '' ? '-' :
                                    profile.activity === 'low' ? '少ない（お散歩なし・室内遊びが中心）' :
                                        profile.activity === 'normal' ? '普通（1日30分前後のお散歩あり）' : '多い（1日1時間以上のお散歩あり）'}
                            </span>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
};
