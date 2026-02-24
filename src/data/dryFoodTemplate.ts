import { SelectedFood } from '@/types';

/**
 * ドライフード（総合栄養食）のデフォルト栄養値（100gあたり）
 * カロリー: 350kcal
 * 栄養値: 後日ユーザーから提供される値に更新予定（現在はプレースホルダー）
 */
export const DRY_FOOD_NUTRIENT_TEMPLATE: Omit<SelectedFood, 'amount'> = {
    id: 'dry-food-001',
    name: 'ドライフード',
    kana: ['どらいふーど'],
    calories: 350,
    nutrients: {
        protein: 30,
        fat: 15,
        carbohydrate: 30,
        fiber: 5,
        dha_epa: 550,
        moisture: 10,
        calcium: 1.3,
        phosphorus: 1,
        potassium: 0.8,
        sodium: 0.4,
        magnesium: 0.1,
        iron: 16,
        copper: 1.8,
        manganese: 1.8,
        zinc: 17,
        iodine: 200,
        selenium: 50,
        vitamin_a: 1500,
        vitamin_d: 200,
        vitamin_e: 17,
        vitamin_b1: 3,
        vitamin_b2: 0.6,
        vitamin_b5: 3,
        vitamin_b3: 20,
        vitamin_b6: 0.3,
        folic_acid: 0.2,
        vitamin_b12: 0.01,
    },
};
