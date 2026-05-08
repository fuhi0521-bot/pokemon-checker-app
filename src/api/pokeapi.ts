/**
 * PokeAPI クライアント (REST)
 *
 * 個別ポケモンの取得が必要な場面で使用。
 * 一括取得（インデックス）は src/data/pokemonIndex.ts (GraphQL) を利用する。
 */

import type { PokemonType, Stats } from '@/src/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  types: Array<{ slot: number; type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
}

/**
 * IDまたは英語名でポケモン1体を取得
 */
export async function fetchPokemon(idOrName: number | string): Promise<{
  id: number;
  nameEn: string;
  types: PokemonType[];
  baseStats: Stats;
}> {
  const url = `${POKEAPI_BASE}/pokemon/${idOrName}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PokeAPI fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: PokeApiPokemonResponse = await res.json();

  const types = data.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as PokemonType);

  const baseStats = parseBaseStats(data.stats);

  return {
    id: data.id,
    nameEn: data.name,
    types,
    baseStats,
  };
}

function parseBaseStats(
  stats: Array<{ base_stat: number; stat: { name: string } }>
): Stats {
  const map: Record<string, number> = {};
  for (const s of stats) {
    map[s.stat.name] = s.base_stat;
  }
  return {
    hp: map['hp'] ?? 0,
    atk: map['attack'] ?? 0,
    def: map['defense'] ?? 0,
    spa: map['special-attack'] ?? 0,
    spd: map['special-defense'] ?? 0,
    spe: map['speed'] ?? 0,
  };
}
