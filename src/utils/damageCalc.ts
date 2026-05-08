/**
 * ダメージ計算ユーティリティ
 *
 * 第5世代以降の公式ダメージ計算式を実装する（簡易版）。
 * ※ 特性・もちもの・天候・場の効果は未対応（拡張ポイント）
 *
 * 【ダメージ計算式（第5世代以降）】
 *   Step1: base = floor(floor(floor(2×Lv/5+2) × 威力 × 攻撃 / 防御) / 50) + 2
 *   Step2: base に STAB・タイプ相性・急所・乱数 を順番にかける
 *
 * 【倍率】
 *   STAB（タイプ一致）: ×1.5
 *   急所（第6世代以降）: ×1.5
 *   乱数: 0.85〜1.00（0.01刻みの16段階）
 */

import type { PokemonType, Stats } from '@/src/types/pokemon';
import { getTypeMultiplier } from '@/src/data/typeChart';

/** calcDamage に渡す入力パラメータ */
export interface DamageInput {
  level: number;                      // 攻撃側のレベル
  attackerTypes: PokemonType[];       // 攻撃側のタイプ（STAB判定に使用）
  defenderTypes: PokemonType[];       // 防御側のタイプ（タイプ相性判定に使用）
  moveType: PokemonType;              // 技のタイプ
  power: number;                      // 技の威力
  category: 'physical' | 'special';  // 物理（A/B使用）or 特殊（C/D使用）
  attackerStats: Stats;               // 攻撃側の実数値
  defenderStats: Stats;               // 防御側の実数値
  critical: boolean;                  // 急所かどうか
}

/** calcDamage の返り値 */
export interface DamageResult {
  min: number;                 // ダメージ最小値（乱数 0.85 のとき）
  max: number;                 // ダメージ最大値（乱数 1.00 のとき）
  rolls: number[];             // 16通りの乱数別ダメージ値
  hpPercentMin: number;        // 最小ダメージの相手HP割合 (%)
  hpPercentMax: number;        // 最大ダメージの相手HP割合 (%)
  knockoutDescription: string; // 確定数の説明文（例: "確定1発"、"乱数2発"）
  typeMultiplier: number;      // タイプ相性倍率 (0 / 0.25 / 0.5 / 1 / 2 / 4)
  stab: boolean;               // STAB（タイプ一致）が適用されているか
}

/**
 * 単発ダメージを計算して結果を返す。
 *
 * 乱数は 0.85〜1.00 の16段階を全て計算し、
 * 最小・最大・全ロール値を返す。
 */
export function calcDamage(input: DamageInput): DamageResult {
  const {
    level,
    attackerTypes,
    defenderTypes,
    moveType,
    power,
    category,
    attackerStats,
    defenderStats,
    critical,
  } = input;

  // 物理技は 攻撃/防御 の実数値、特殊技は 特攻/特防 を使う
  const attack  = category === 'physical' ? attackerStats.atk : attackerStats.spa;
  const defense = category === 'physical' ? defenderStats.def : defenderStats.spd;

  // STAB: 攻撃側のタイプと技のタイプが一致すれば ×1.5
  const stab = attackerTypes.includes(moveType);

  // タイプ相性倍率（無効0 〜 4倍）
  const typeMultiplier = getTypeMultiplier(moveType, defenderTypes);

  // ─── Step1: 基礎ダメージ計算 ─────────────────────────
  // floor(floor(floor(2×Lv/5+2) × 威力 × 攻撃 / 防御) / 50) + 2
  const baseDamage = Math.floor(
    Math.floor(
      (Math.floor((2 * level) / 5 + 2) * power * attack) / defense
    ) / 50
  ) + 2;

  // ─── Step2: 倍率適用 ─────────────────────────────────
  const stabMul = stab     ? 1.5 : 1;
  const critMul = critical ? 1.5 : 1;

  // 乱数 0.85〜1.00 の16段階（0.01刻み）を全て計算
  const rolls: number[] = [];
  for (let i = 0; i < 16; i++) {
    const randomFactor = (85 + i) / 100; // 0.85, 0.86, ... 1.00
    // STAB → タイプ相性 → 急所 → 乱数 の順に floor をかける
    const dmg = Math.floor(
      Math.floor(
        Math.floor(baseDamage * stabMul) * typeMultiplier
      ) * critMul * randomFactor
    );
    rolls.push(dmg);
  }

  const min = rolls[0];  // 最小（乱数 0.85）
  const max = rolls[15]; // 最大（乱数 1.00）

  // 相手の最大HPに対する割合
  const hpPercentMin = (min / defenderStats.hp) * 100;
  const hpPercentMax = (max / defenderStats.hp) * 100;

  const knockoutDescription = describeKnockout(rolls, defenderStats.hp);

  return {
    min,
    max,
    rolls,
    hpPercentMin,
    hpPercentMax,
    knockoutDescription,
    typeMultiplier,
    stab,
  };
}

/**
 * 確定数の説明文を生成する。
 *
 * 【確定数の定義】
 *   - 確定N発: 最小ダメージ × N がHP以上（どの乱数でも N 発以内で倒せる）
 *   - 乱数N発: 最大ダメージ × N がHP以上（運が良ければ N 発で倒せる）
 *
 * 【簡略化している点】
 *   2発以降の確定判定は「平均ダメージ × N ≥ HP」で計算しているため、
 *   厳密な確率計算ではなく目安として使用すること。
 */
function describeKnockout(rolls: number[], hp: number): string {
  const min = rolls[0];
  const max = rolls[15];

  // ── 1発判定 ────────────────────────────────────────
  if (min >= hp) {
    return '確定1発';
  }
  if (max >= hp) {
    // 16段階中、何段階が HP 以上かを数えてパーセントで表示
    const count = rolls.filter((r) => r >= hp).length;
    const pct = ((count / 16) * 100).toFixed(1);
    return `乱数1発 (${pct}%)`;
  }

  // ── 2〜3発判定（平均ダメージによる簡易計算） ─────────
  const avg = rolls.reduce((a, b) => a + b, 0) / rolls.length;

  if (avg * 2 >= hp) return '確定2発';
  if (max * 2 >= hp) return '乱数2発';
  if (avg * 3 >= hp) return '確定3発';
  if (max * 3 >= hp) return '乱数3発';

  return '4発以上';
}
