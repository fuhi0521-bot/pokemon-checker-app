/**
 * 共通型定義
 * - PokemonType: 18タイプ
 * - StatKey: 6種ステータス
 * - PokemonIndexEntry: 検索インデックス用エントリ
 */

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export const POKEMON_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

/** タイプの日本語表記 */
export const TYPE_LABELS_JA: Record<PokemonType, string> = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
};

/** タイプ別カラー (TYPE_COLORS) */
export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

/** ステータス6種 */
export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export const STAT_KEYS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/** ステータス日本語ラベル */
export const STAT_LABELS_JA: Record<StatKey, string> = {
  hp: 'HP',
  atk: 'こうげき',
  def: 'ぼうぎょ',
  spa: 'とくこう',
  spd: 'とくぼう',
  spe: 'すばやさ',
};

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** ポケモン検索インデックスのエントリ */
export interface PokemonIndexEntry {
  /** 全国図鑑番号 */
  id: number;
  /** 日本語名（例: "ピカチュウ"） */
  nameJa: string;
  /** 英語名（例: "pikachu"） */
  nameEn: string;
  /** タイプ（1〜2個） */
  types: PokemonType[];
  /** 種族値 */
  baseStats: Stats;
  /** メガ進化フォームのID（ある場合） */
  megaIds?: number[];
  /** メガ進化元のID（メガ進化フォーム自身の場合） */
  baseFormId?: number;
}

/** 性格補正 (1.1, 1.0, 0.9 のいずれか) */
export type NatureModifier = 1.1 | 1.0 | 0.9;

/** 個別の性格補正 (atk/def/spa/spd/spe のうち1つが上昇/下降、HPは変動なし) */
export interface NatureBoost {
  up: Exclude<StatKey, 'hp'> | null;
  down: Exclude<StatKey, 'hp'> | null;
}

/** ポケモンチームメンバー */
export interface TeamMember {
  /** インデックスから参照するID（メガ進化適用済みなら megaId） */
  pokemonId: number;
  /** ニックネーム/メモ（任意） */
  nickname?: string;
  /** メガ進化を適用するか */
  megaApplied?: boolean;
}
