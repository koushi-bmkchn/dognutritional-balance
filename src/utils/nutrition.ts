import { DogProfile, AAFCOStandard } from '@/types';

/**
 * 安静時エネルギー要求量 (RER) を計算
 * Formula: 70 * (weight ^ 0.75)
 */
export const calculateRER = (weight: number): number => {
    if (weight <= 0) return 0;
    return 70 * Math.pow(weight, 0.75);
};

/**
 * 1日あたりのエネルギー要求量 (DER) を計算
 */
export const calculateDER = (profile: DogProfile): number => {
    // Handle empty or invalid values
    if (profile.weight === '' || profile.weight <= 0 || profile.age === '') {
        return 0;
    }

    const rer = calculateRER(profile.weight);
    let factor = 1.0;

    if (profile.age <= 7) {
        // 7歳以下
        switch (profile.activity) {
            case 'low': factor = 1.0; break;
            case 'normal': factor = 1.3; break;
            case 'high': factor = 1.6; break;
            default: factor = 1.0;
        }
    } else {
        // 8歳以上
        switch (profile.activity) {
            case 'low': factor = 1.0; break;
            case 'normal': factor = 1.1; break;
            case 'high': factor = 1.3; break;
            default: factor = 1.0;
        }
    }

    return Math.round(rer * factor);
};

/**
 * 総重量に基づいて基準値をスケーリング
 * Formula: adjusted = standard * (totalWeight / 100)
 */
export const scaleStandard = (
    standard: AAFCOStandard,
    totalWeight: number
): { adjustedMin: number; adjustedMax: number | null } => {
    if (totalWeight <= 0) {
        return { adjustedMin: 0, adjustedMax: standard.max ? 0 : null };
    }

    // 基準値は「食材100gあたり」の数値と仮定
    const ratio = totalWeight / 100;
    const adjustedMin = standard.min * ratio;
    const adjustedMax = standard.max ? standard.max * ratio : null;

    return { adjustedMin, adjustedMax };
};

/**
 * チャート描画用の正規化値 (draw_value) を計算
 * 0.0 〜 2.0 の範囲
 * 1.0 が基準値（min）達成
 */
export const calculateDrawValue = (
    input: number,
    min: number,
    max: number | null
): number => {
    // 基準値がない場合（min=0やnull）は、グラフ上で適正扱い（1.5）とする
    if (min <= 0) return 1.5;

    let val = 0;

    if (input < min) {
        // 不足: 0.0 〜 1.0未満
        val = input / min;
    } else {
        // 適正〜過剰: 1.0以上
        if (max !== null) {
            // 上限あり: min(1.0) 〜 max(2.0) にマッピング
            // (2.0 - 1.0) = 1.0 の幅を使う
            val = 1.0 + (input - min) / (max - min);
        } else {
            // 上限なし: 基準値の5倍を最大2.0とする
            // 5倍を超えたら強制的に2.0で止める
            const relative = input / min;
            if (relative >= 5.0) {
                val = 2.0;
            } else {
                val = 1.0 + (input - min) / (4 * min);
            }
        }
    }

    // 小数第2位切り捨て
    val = Math.floor(val * 100) / 100;

    // クリッピング (上限ありの場合は2.5まで、なしは上で2.0に制限済みだが念のため)
    return Math.min(val, 2.5);
};
