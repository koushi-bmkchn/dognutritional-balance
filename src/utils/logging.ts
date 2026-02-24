import { DogProfile, SelectedFood } from '@/types';

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxV5G40zB3bHNJjUOKH7umRmticsacZjC1mY_BPO0BQfnLXXZctXGCQ_qA_nCxRiNxw/exec';

export interface LogData {
    name: string;
    age: number | string;
    weight: number | string;
    activity: string;
    feedingType: string;
    dryFoodAmount: number;
    foods: Array<{
        name: string;
        amount: number;
    }>;
}

/**
 * Send calculation data to Google Sheets via Google Apps Script
 * This function fails silently to avoid disrupting user experience
 */
export async function logCalculation(
    profile: DogProfile,
    foods: SelectedFood[],
    feedingType: string,
    dryFoodAmount: number
): Promise<void> {
    try {
        const data: LogData = {
            name: profile.name,
            age: profile.age,
            weight: profile.weight,
            activity: profile.activity,
            feedingType,
            dryFoodAmount,
            foods: foods
                .filter(f => f.id !== 'dry-food-001')
                .map(f => ({
                    name: f.name,
                    amount: f.amount
                }))
        };

        // Send data asynchronously without blocking UI
        fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors', // GAS requires no-cors mode
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(() => {
            // Silent fail - do not show errors to user
            console.log('Data logging failed (silent)');
        });
    } catch (error) {
        // Silent fail - do not show errors to user
        console.log('Data logging error (silent):', error);
    }
}
