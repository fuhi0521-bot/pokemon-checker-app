/**
 * ポケモン検索インデックス
 *
 * - データは GitHub Pages 上の pokemon.json から取得する
 * - AsyncStorage に永続キャッシュ（30日）
 * - データの更新は scripts/build-pokemon-data.ts を実行して JSON を再生成・アップロードする
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PokemonIndexEntry } from '@/src/types/pokemon';

// ─── 設定 ─────────────────────────────────────────────────────────────────────

/**
 * GitHub Pages にアップロードした pokemon.json の URL。
 * 公開後にここを実際の URL に変更してください。
 * 例: 'https://your-username.github.io/pokemon-data/pokemon.json'
 */
const POKEMON_DATA_URL = 'https://YOUR_USERNAME.github.io/YOUR_REPO/pokemon.json';

const CACHE_KEY = '@pokemon-index:v11'; // v11: 自前ホスティングに切り替え
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30日

// 旧バージョンのキャッシュキー（起動時に自動削除する）
const LEGACY_CACHE_KEYS = [
  '@pokemon-index:v3',
  '@pokemon-index:v4',
  '@pokemon-index:v5',
  '@pokemon-index:v6',
  '@pokemon-index:v7',
  '@pokemon-index:v8',
  '@pokemon-index:v9',
  '@pokemon-index:v10',
];

// ─── キャッシュ ───────────────────────────────────────────────────────────────

interface CachedIndex {
  fetchedAt: number;
  entries: PokemonIndexEntry[];
}

let memoryCache: PokemonIndexEntry[] | null = null;

let legacyCleared = false;
async function clearLegacyCachesOnce() {
  if (legacyCleared) return;
  legacyCleared = true;
  for (const key of LEGACY_CACHE_KEYS) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // 削除失敗は無視
    }
  }
}

async function loadFromStorage(): Promise<PokemonIndexEntry[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedIndex = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.entries;
  } catch {
    return null;
  }
}

async function saveToStorage(entries: PokemonIndexEntry[]): Promise<void> {
  try {
    const payload: CachedIndex = { fetchedAt: Date.now(), entries };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // 失敗しても致命的ではない
  }
}

// ─── データ取得 ───────────────────────────────────────────────────────────────

async function fetchFromRemote(): Promise<PokemonIndexEntry[]> {
  const res = await fetch(POKEMON_DATA_URL);
  if (!res.ok) throw new Error(`データ取得失敗: ${res.status}`);
  return res.json() as Promise<PokemonIndexEntry[]>;
}

// ─── 公開 API ─────────────────────────────────────────────────────────────────

/**
 * インデックス全体を取得（キャッシュ優先）
 */
export async function loadPokemonIndex(forceReload = false): Promise<PokemonIndexEntry[]> {
  if (!forceReload && memoryCache) return memoryCache;

  await clearLegacyCachesOnce();

  if (!forceReload) {
    const cached = await loadFromStorage();
    if (cached) {
      memoryCache = cached;
      console.log(`[pokemonIndex] キャッシュから読み込み: ${cached.length} 件`);
      return cached;
    }
  }

  const entries = await fetchFromRemote();
  memoryCache = entries;
  await saveToStorage(entries);
  console.log(`[pokemonIndex] リモートから取得: ${entries.length} 件`);
  return entries;
}

/**
 * カタカナ/ひらがな/英語/ID で前方一致 + 部分一致検索
 */
export function searchInIndex(
  index: PokemonIndexEntry[],
  query: string,
  limit = 12
): PokemonIndexEntry[] {
  if (!query.trim()) return [];
  const q = hiraganaToKatakana(query.trim().toLowerCase());

  if (/^\d+$/.test(q)) {
    const id = parseInt(q, 10);
    const exact = index.find((e) => e.id === id);
    if (exact) return [exact];
  }

  const startsMatches: PokemonIndexEntry[] = [];
  const containsMatches: PokemonIndexEntry[] = [];
  for (const e of index) {
    const ja = e.nameJa.toLowerCase();
    const en = e.nameEn.toLowerCase();
    if (ja.startsWith(q) || en.startsWith(q)) {
      startsMatches.push(e);
    } else if (ja.includes(q) || en.includes(q)) {
      containsMatches.push(e);
    }
  }

  return [...startsMatches, ...containsMatches].slice(0, limit);
}

/**
 * ひらがなをカタカナに変換（例: ぴかちゅう → ピカチュウ）
 */
export function hiraganaToKatakana(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * ID からエントリを取得
 */
export function getEntryById(id: number): PokemonIndexEntry | null {
  if (!memoryCache) return null;
  return memoryCache.find((e) => e.id === id) ?? null;
}
