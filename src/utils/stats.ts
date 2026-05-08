/**
 * 実数値計算ユーティリティ
 *
 * ゲーム内と同じ計算式で実数値を算出する。
 *
 * 【計算式】
 *   HP:     floor((種族値×2 + 個体値 + floor(努力値/4)) × レベル/100) + レベル + 10
 *   その他: floor((floor((種族値×2 + 個体値 + floor(努力値/4)) × レベル/100) + 5) × 性格補正)
 *
 * 【性格補正】
 *   上昇: ×1.1 / 下降: ×0.9 / 補正なし: ×1.0
 */

import type { Stats, StatKey, NatureBoost } from '@/src/types/pokemon';

const NATURE_UP   = 1.1; // 性格補正 上昇
const NATURE_DOWN = 0.9; // 性格補正 下降

/** calcStat / calcAllStats に渡す計算パラメータ */
export interface CalcParams {
  level: number;        // レベル (1〜100。通常 50 か 100)
  ivs: Partial<Stats>;  // 個体値 (各ステータス 0〜31)
  evs: Partial<Stats>;  // 努力値 (各ステータス 0〜252、合計最大510)
  nature: NatureBoost;  // 性格補正（上昇/下降ステータス）
}

// デフォルト値: Lv50 / 個体値31 / 努力値0 / 性格補正なし
const DEFAULT_PARAMS: CalcParams = {
  level: 50,
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  evs: { hp: 0,  atk: 0,  def: 0,  spa: 0,  spd: 0,  spe: 0  },
  nature: { up: null, down: null },
};

/**
 * 指定ステータスの性格補正倍率を返す。
 * HP は性格補正の対象外なので常に 1.0。
 * up と down が同じステータスの場合（まじめなど）は補正なし。
 */
function getNatureModifier(stat: StatKey, nature: NatureBoost): number {
  if (stat === 'hp') return 1;
  if (nature.up === stat && nature.down !== stat) return NATURE_UP;
  if (nature.down === stat && nature.up !== stat) return NATURE_DOWN;
  return 1;
}

/**
 * 単一ステータスの実数値を計算して返す。
 *
 * @param base  種族値
 * @param stat  対象ステータス（'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'）
 * @param params 計算パラメータ（省略時はデフォルト値を使用）
 */
export function calcStat(
  base: number,
  stat: StatKey,
  params: CalcParams = DEFAULT_PARAMS
): number {
  const level = clamp(params.level, 1, 100);
  const iv    = clamp(params.ivs[stat] ?? 31, 0, 31);
  const ev    = clamp(params.evs[stat] ?? 0,  0, 252);

  // ① 共通部分: (種族値×2 + 個体値 + floor(努力値/4)) × レベル/100
  const baseCalc = ((base * 2 + iv + Math.floor(ev / 4)) * level) / 100;

  if (stat === 'hp') {
    // HP計算式: floor(①) + レベル + 10
    // ※ ヌケニン（HP種族値1）も同じ式で計算（実際には特例で HP=1 になるが、ここでは汎用計算）
    return Math.floor(baseCalc) + level + 10;
  }

  // HP以外の計算式: (floor(①) + 5) × 性格補正 → さらに floor
  const withFlat = Math.floor(baseCalc) + 5;
  const modifier = getNatureModifier(stat, params.nature);
  return Math.floor(withFlat * modifier);
}

/**
 * 全6ステータスの実数値をまとめて計算して返す。
 *
 * @param baseStats 種族値（全6ステータス）
 * @param params    計算パラメータ（省略時はデフォルト値を使用）
 */
export function calcAllStats(baseStats: Stats, params: CalcParams = DEFAULT_PARAMS): Stats {
  return {
    hp:  calcStat(baseStats.hp,  'hp',  params),
    atk: calcStat(baseStats.atk, 'atk', params),
    def: calcStat(baseStats.def, 'def', params),
    spa: calcStat(baseStats.spa, 'spa', params),
    spd: calcStat(baseStats.spd, 'spd', params),
    spe: calcStat(baseStats.spe, 'spe', params),
  };
}

/**
 * 努力値の合計が上限（510）以内かチェックする。
 * 超えている場合は false を返す。
 */
export function isValidEvs(evs: Partial<Stats>): boolean {
  const sum = Object.values(evs).reduce<number>((acc, v) => acc + (v ?? 0), 0);
  return sum <= 510;
}

/** 値を min〜max の範囲に収める */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// DEFAULT_PARAMS を別名でエクスポート（外部からも参照できるように）
export const DEFAULT_CALC_PARAMS = DEFAULT_PARAMS;
