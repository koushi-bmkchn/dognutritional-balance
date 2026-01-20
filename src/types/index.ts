export type ActivityLevel = 'low' | 'normal' | 'high';

export type DogProfile = {
    name: string;
    age: number | '';
    weight: number | '';
    activity: ActivityLevel | '';
};

export interface Ingredient {
    id: string;
    name: string;
    kana: string | string[];
    calories: number;
    nutrients: {
        [key: string]: number;
    };
}

export interface AAFCOStandard {
    id: string;
    name: string;
    unit: string;
    min: number;
    max: number | null;
}

export interface StandardSection {
    id: string;
    name: string;
    nutrients: AAFCOStandard[];
}

export interface StandardsData {
    meta: {
        source: string;
        unit_basis: string;
    };
    sections: StandardSection[];
};

export type SelectedFood = Ingredient & {
    amount: number; // g
};
