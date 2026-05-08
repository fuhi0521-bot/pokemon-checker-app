/**
 * タイプ相性表
 * 攻撃側 → 防御側 の倍率 (0, 0.5, 1, 2)
 *
 * typeChart[攻撃タイプ][防御タイプ] = 倍率
 *
 * 第6世代以降の相性 (フェアリー追加後) を採用
 */

import { type PokemonType, POKEMON_TYPES } from '@/src/types/pokemon';

type TypeMultiplier = 0 | 0.5 | 1 | 2;

/**
 * 攻撃タイプ → 防御タイプ 倍率
 * 行: 攻撃側、列: 防御側
 */
export const typeChart: Record<PokemonType, Record<PokemonType, TypeMultiplier>> = {
  normal: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1,
    rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1,
  },
  fire: {
    normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2,
    rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1,
  },
  water: {
    normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1,
    fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1,
    rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1,
  },
  electric: {
    normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1,
    fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1,
    rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1,
  },
  grass: {
    normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1,
    fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5,
    rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1,
  },
  ice: {
    normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5,
    fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1,
    rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1,
  },
  fighting: {
    normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2,
    fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5,
    rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5,
  },
  poison: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1,
    fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1,
    rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2,
  },
  ground: {
    normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1,
    fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5,
    rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1,
  },
  flying: {
    normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1,
    fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2,
    rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1,
  },
  psychic: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1,
    rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1,
  },
  bug: {
    normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1,
    fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1,
    rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5,
  },
  rock: {
    normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2,
    fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2,
    rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1,
  },
  ghost: {
    normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1,
    rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1,
  },
  dragon: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1,
    rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0,
  },
  dark: {
    normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1,
    rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5,
  },
  steel: {
    normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2,
    fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1,
    rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2,
  },
  fairy: {
    normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1,
    fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1,
    rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1,
  },
};

/**
 * 防御側のタイプ群に対する、攻撃タイプ別の被ダメージ倍率を返す。
 *
 * @param defenderTypes 防御側のタイプ（1個または2個）
 * @returns 18タイプ分の倍率マップ
 */
export function getDefensiveProfile(
  defenderTypes: PokemonType[]
): Record<PokemonType, number> {
  const profile = {} as Record<PokemonType, number>;
  for (const attackType of POKEMON_TYPES) {
    let mult = 1;
    for (const defType of defenderTypes) {
      mult *= typeChart[attackType][defType];
    }
    profile[attackType] = mult;
  }
  return profile;
}

/**
 * 特定の攻撃タイプ vs 防御タイプ群 のダメージ倍率
 */
export function getTypeMultiplier(
  attackType: PokemonType,
  defenderTypes: PokemonType[]
): number {
  let mult = 1;
  for (const defType of defenderTypes) {
    mult *= typeChart[attackType][defType];
  }
  return mult;
}
