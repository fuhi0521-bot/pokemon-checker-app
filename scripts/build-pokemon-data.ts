/**
 * ポケモンデータ生成スクリプト
 *
 * 使い方:
 *   npm run build-data
 *
 * PokeAPI から全データを取得し、extraForms とマージして
 * scripts/output/pokemon.json に書き出す。
 * 生成した JSON を GitHub Pages 等にアップロードすると、
 * アプリがそこからダウンロードするようになる。
 *
 * 実行タイミング: 新ポケモン追加時など、データを更新したいときだけ実行する。
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { EXTRA_FORMS, PREFER_LOCAL_ON_CONFLICT } from '../src/data/extraForms';
import type { PokemonIndexEntry, PokemonType, Stats } from '../src/types/pokemon';

const GRAPHQL_ENDPOINT = 'https://graphql.pokeapi.co/v1beta2';
const OUTPUT_DIR = join(process.cwd(), 'scripts', 'output');
const OUTPUT_FILE = join(OUTPUT_DIR, 'pokemon.json');

// ─── GraphQL クエリ ────────────────────────────────────────────────────────────

const GRAPHQL_QUERY_MAIN = `
  query GetAllPokemon {
    pokemon(limit: 2500, order_by: {id: asc}) {
      id
      name
      is_default
      pokemontypes {
        slot
        type { name }
      }
      pokemonstats {
        stat { name }
        base_stat
      }
      pokemonspecy {
        id
        pokemonspeciesnames(where: {language: {name: {_in: ["ja-Hrkt", "ja"]}}}) {
          name
          language { name }
        }
      }
    }
  }
`;

const GRAPHQL_QUERY_FORMS = `
  query GetAllPokemonForms {
    pokemonform(limit: 3000) {
      pokemon_id
      form_name
      is_mega
      pokemonformnames(where: {language: {name: {_in: ["ja-Hrkt", "ja"]}}}) {
        name
        pokemon_name
      }
    }
  }
`;

// ─── 型定義 ───────────────────────────────────────────────────────────────────

interface GqlPokemon {
  id: number;
  name: string;
  is_default: boolean;
  pokemontypes: Array<{ slot: number; type: { name: string } }>;
  pokemonstats: Array<{ stat: { name: string }; base_stat: number }>;
  pokemonspecy: {
    id: number;
    pokemonspeciesnames: Array<{ name: string; language?: { name: string } }>;
  } | null;
}

interface GqlForm {
  pokemon_id: number;
  form_name: string | null;
  is_mega: boolean | null;
  pokemonformnames: Array<{ name: string; pokemon_name: string | null }>;
}

// ─── データ取得 ───────────────────────────────────────────────────────────────

async function gqlFetch<T>(query: string, label: string): Promise<T> {
  console.log(`[fetch] ${label} ...`);
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(`GraphQL エラー: ${JSON.stringify(json.errors)}`);
  if (!json.data) throw new Error('レスポンスに data がありません');
  return json.data;
}

// ─── エントリ変換 ─────────────────────────────────────────────────────────────

function hasJapaneseChars(s: string): boolean {
  return /[぀-鿿]/.test(s);
}

function parseBaseStats(stats: GqlPokemon['pokemonstats']): Stats {
  const map: Record<string, number> = {};
  for (const s of stats) map[s.stat.name] = s.base_stat;
  return {
    hp:  map['hp']              ?? 0,
    atk: map['attack']          ?? 0,
    def: map['defense']         ?? 0,
    spa: map['special-attack']  ?? 0,
    spd: map['special-defense'] ?? 0,
    spe: map['speed']           ?? 0,
  };
}

function toEntry(p: GqlPokemon): PokemonIndexEntry | null {
  if (!p.pokemontypes || p.pokemontypes.length === 0) return null;

  const types = p.pokemontypes
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as PokemonType);

  const baseStats = parseBaseStats(p.pokemonstats);

  // 日本語名を取得（ja-Hrkt 優先 → ja）。なければ除外
  const speciesNames = p.pokemonspecy?.pokemonspeciesnames ?? [];
  const jaHrkt = speciesNames.find((n) => n.language?.name === 'ja-Hrkt')?.name;
  const jaPlain = speciesNames.find((n) => n.language?.name === 'ja')?.name;
  const speciesNameJa = jaHrkt ?? jaPlain ?? speciesNames[0]?.name ?? null;

  if (!speciesNameJa || !hasJapaneseChars(speciesNameJa)) return null;

  return {
    id: p.id,
    nameJa: speciesNameJa,
    nameEn: p.name,
    types,
    baseStats,
    baseFormId: p.is_default ? undefined : p.pokemonspecy?.id ?? undefined,
  };
}

// ─── フォーム名の適用 ─────────────────────────────────────────────────────────

function applyFormNames(
  entries: PokemonIndexEntry[],
  formsByPokemonId: Map<number, GqlForm>
): PokemonIndexEntry[] {
  return entries.map((entry) => {
    const formData = formsByPokemonId.get(entry.id);
    if (!formData) return entry;

    // PokeAPI のフォームテーブルに日本語名があればそれを使う
    const formNameJa =
      formData.pokemonformnames?.[0]?.pokemon_name ??
      formData.pokemonformnames?.[0]?.name ??
      null;

    if (formNameJa && hasJapaneseChars(formNameJa)) {
      return { ...entry, nameJa: formNameJa };
    }

    // メガ進化でフォーム名がない場合は「メガ + 種族名」を自動生成
    if (formData.is_mega && hasJapaneseChars(entry.nameJa)) {
      const fn = formData.form_name ?? '';
      const suffix = fn === 'mega-x' ? 'X' : fn === 'mega-y' ? 'Y' : '';
      return { ...entry, nameJa: `メガ${entry.nameJa}${suffix}` };
    }

    return entry;
  });
}

// ─── 重複排除・マージ ─────────────────────────────────────────────────────────

function normalizeFormName(nameEn: string): string {
  const lower = nameEn.toLowerCase();
  let m = lower.match(/^mega-(.+?)(-[xy])?$/);
  if (m) return `mega:${m[1]}`;
  m = lower.match(/^(.+?)-mega(-[xy])?$/);
  if (m) return `mega:${m[1]}`;
  if (lower.startsWith('primal-') || lower.endsWith('-primal')) {
    return `primal:${lower.replace(/^primal-|-primal$/g, '')}`;
  }
  return lower;
}

function makeFingerprint(e: PokemonIndexEntry): string {
  const speciesId = e.baseFormId ?? e.id;
  const typesKey = [...e.types].sort().join(',');
  const s = e.baseStats;
  return `${speciesId}|${typesKey}|${s.hp},${s.atk},${s.def},${s.spa},${s.spd},${s.spe}`;
}

function pickPreferred(a: PokemonIndexEntry, b: PokemonIndexEntry): PokemonIndexEntry {
  const aLocal = a.id >= 90000;
  const bLocal = b.id >= 90000;
  if (aLocal && !bLocal) return a;
  if (!aLocal && bLocal) return b;
  const aJa = hasJapaneseChars(a.nameJa);
  const bJa = hasJapaneseChars(b.nameJa);
  if (aJa && !bJa) return a;
  if (!aJa && bJa) return b;
  return a.id < b.id ? a : b;
}

function sortKey(e: PokemonIndexEntry): number {
  if (e.id < 10000) return e.id * 100;
  if (e.baseFormId) return e.baseFormId * 100 + (e.id % 100);
  return e.id * 100;
}

function mergeWithExtraForms(
  apiEntries: PokemonIndexEntry[],
  extras: PokemonIndexEntry[]
): PokemonIndexEntry[] {
  // ステップ1: ID マップ
  const map = new Map<number, PokemonIndexEntry>();
  for (const e of apiEntries) map.set(e.id, e);
  for (const e of extras) {
    if (!map.has(e.id) || PREFER_LOCAL_ON_CONFLICT) map.set(e.id, e);
  }

  // ステップ2: nameEn の正規化マッチングで重複除去
  const localByNorm = new Map<string, PokemonIndexEntry>();
  for (const e of extras) localByNorm.set(normalizeFormName(e.nameEn), e);
  for (const [id, entry] of [...map]) {
    const local = localByNorm.get(normalizeFormName(entry.nameEn));
    if (local && local.id !== id) map.delete(id);
  }

  // ステップ3: フィンガープリント方式の重複排除
  const byFingerprint = new Map<string, PokemonIndexEntry>();
  for (const entry of map.values()) {
    const fp = makeFingerprint(entry);
    const existing = byFingerprint.get(fp);
    byFingerprint.set(fp, existing ? pickPreferred(existing, entry) : entry);
  }

  return Array.from(byFingerprint.values()).sort((a, b) => sortKey(a) - sortKey(b));
}

// ─── メイン処理 ───────────────────────────────────────────────────────────────

async function main() {
  console.log('=== ポケモンデータ生成スクリプト ===');

  // メインデータ取得
  const mainData = await gqlFetch<{ pokemon: GqlPokemon[] }>(
    GRAPHQL_QUERY_MAIN,
    'メインデータ'
  );
  const baseEntries = mainData.pokemon
    .map(toEntry)
    .filter((e): e is PokemonIndexEntry => e !== null);
  console.log(`[変換] ${baseEntries.length} 件（日本語名あり）`);

  // フォーム名取得
  let formsByPokemonId = new Map<number, GqlForm>();
  try {
    const formsData = await gqlFetch<{ pokemonform: GqlForm[] }>(
      GRAPHQL_QUERY_FORMS,
      'フォーム名'
    );
    for (const f of formsData.pokemonform) formsByPokemonId.set(f.pokemon_id, f);
    console.log(`[フォーム] ${formsByPokemonId.size} 件取得`);
  } catch (e) {
    console.warn('[フォーム] 取得失敗（スキップ）:', e);
  }

  // フォーム名を適用
  const withFormNames = applyFormNames(baseEntries, formsByPokemonId);

  // extraForms とマージ・重複排除
  const merged = mergeWithExtraForms(withFormNames, EXTRA_FORMS);
  console.log(`[マージ後] ${merged.length} 件`);

  // 日本語名なしの件数を確認（0 が理想）
  const noJa = merged.filter((e) => !hasJapaneseChars(e.nameJa)).length;
  if (noJa > 0) console.warn(`[警告] 日本語名なし: ${noJa} 件`);

  // 出力
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\n✅ 出力完了: ${OUTPUT_FILE}`);
  console.log(`   合計 ${merged.length} 件`);
  console.log('\n次のステップ:');
  console.log('  scripts/output/pokemon.json を GitHub Pages にアップロードしてください。');
}

main().catch((e) => {
  console.error('エラー:', e);
  process.exit(1);
});
