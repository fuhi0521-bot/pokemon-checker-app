/**
 * パーティ全体のタイプ受け持ち分析
 *
 * 【分析内容】
 *   - 共通弱点: パーティ内で複数体が弱点を持つタイプを検出
 *       致命 (critical): 3体以上が2倍以上で受ける
 *       危険 (dangerous): 2体が2倍以上で受ける
 *   - 耐性穴: パーティ内で誰も半減以下で受けられないタイプ
 *
 * 【バランススコア計算式】
 *   100 - (致命タイプ数 × 8) - (危険タイプ数 × 3) - (耐性穴数 × 2)
 *   結果は 0〜100 の範囲にクランプする。
 */

import { type PokemonType, POKEMON_TYPES } from '@/src/types/pokemon';
import { getDefensiveProfile } from '@/src/data/typeChart';

/** analyzeTeam に渡すメンバーの型（タイプ情報のみ使用） */
export interface TeamMemberTypes {
  id: string;         // 識別用ID（同じポケモンを複数入れるため index を付加）
  label: string;      // 表示名
  types: PokemonType[]; // タイプ（1〜2個）
}

/** analyzeTeam の返り値 */
export interface TeamWeaknessReport {
  /** タイプごとの「2倍以上で受ける味方の数」 */
  weakCounts: Record<PokemonType, number>;
  /** タイプごとの「半減以下で受けられる味方の数」 */
  resistCounts: Record<PokemonType, number>;
  /** 致命タイプ（3体以上が弱点） */
  criticalTypes: PokemonType[];
  /** 危険タイプ（2体が弱点） */
  dangerousTypes: PokemonType[];
  /** 耐性穴（誰も半減できないタイプ） */
  resistanceHoles: PokemonType[];
  /** バランススコア 0〜100 */
  balanceScore: number;
  /** 個別の被ダメージ倍率マトリクス: メンバー × タイプ */
  matrix: Array<{
    memberId: string;
    label: string;
    types: PokemonType[];
    profile: Record<PokemonType, number>;
  }>;
}

/**
 * パーティ全体を分析して弱点・耐性・スコアを返す。
 *
 * @param members パーティメンバーのタイプ情報一覧
 */
export function analyzeTeam(members: TeamMemberTypes[]): TeamWeaknessReport {
  // 全タイプの weakCount / resistCount を 0 で初期化
  const weakCounts   = {} as Record<PokemonType, number>;
  const resistCounts = {} as Record<PokemonType, number>;
  for (const t of POKEMON_TYPES) {
    weakCounts[t]   = 0;
    resistCounts[t] = 0;
  }

  // 各メンバーの被ダメージ倍率を計算し、カウントを集計する
  const matrix = members.map((m) => {
    const profile = getDefensiveProfile(m.types);
    for (const t of POKEMON_TYPES) {
      const mult = profile[t];
      if (mult >= 2)              weakCounts[t]   += 1; // 弱点（2倍以上）
      if (mult > 0 && mult <= 0.5) resistCounts[t] += 1; // 耐性（半減以下、無効は除く）
    }
    return {
      memberId: m.id,
      label: m.label,
      types: m.types,
      profile,
    };
  });

  // 致命・危険・耐性穴タイプを分類する
  const criticalTypes: PokemonType[]    = [];
  const dangerousTypes: PokemonType[]   = [];
  const resistanceHoles: PokemonType[]  = [];

  for (const t of POKEMON_TYPES) {
    if (weakCounts[t] >= 3) {
      criticalTypes.push(t);            // 3体以上が弱点 → 致命
    } else if (weakCounts[t] === 2) {
      dangerousTypes.push(t);           // 2体が弱点 → 危険
    }
    // パーティがいて、誰も半減できないタイプ → 耐性穴
    if (resistCounts[t] === 0 && members.length > 0) {
      resistanceHoles.push(t);
    }
  }

  // バランススコア計算（パーティが空のときは 100 で返す）
  let balanceScore = 100;
  if (members.length > 0) {
    balanceScore =
      100
      - criticalTypes.length   * 8  // 致命: 1タイプにつき -8
      - dangerousTypes.length  * 3  // 危険: 1タイプにつき -3
      - resistanceHoles.length * 2; // 耐性穴: 1タイプにつき -2
    balanceScore = Math.max(0, Math.min(100, balanceScore)); // 0〜100 にクランプ
  }

  return {
    weakCounts,
    resistCounts,
    criticalTypes,
    dangerousTypes,
    resistanceHoles,
    balanceScore,
    matrix,
  };
}
