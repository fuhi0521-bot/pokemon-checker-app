/**
 * PokemonSearch
 *
 * 日本語/英語/IDで前方一致オートコンプリート検索。
 * 候補をタップすると onSelect でエントリを返す。
 *
 * ⚠️ FlatList を使わず ScrollView + map で描画する。
 *    理由: FlatList（VirtualizedList）を ScrollView の中に入れると
 *    "VirtualizedLists should never be nested inside plain ScrollViews"
 *    の警告が出て動作が壊れるため。
 *    候補数は最大12件に制限しているので仮想化は不要。
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { PokemonIndexEntry } from '@/src/types/pokemon';
import { loadPokemonIndex, searchInIndex } from '@/src/data/pokemonIndex';
import { CreatureAvatar } from './CreatureAvatar';

interface Props {
  onSelect: (entry: PokemonIndexEntry) => void;
  placeholder?: string;
  /** 初期表示テキスト */
  initialQuery?: string;
}

export function PokemonSearch({ onSelect, placeholder, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<PokemonIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントのマウント時にポケモンインデックスを非同期で読み込む
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadPokemonIndex()
      .then((data) => {
        if (mounted) setIndex(data);
      })
      .catch((e: Error) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // クエリが変わるたびに検索結果を再計算（最大12件）
  const results = useMemo(() => {
    if (!index || !query) return [];
    // 上限を 50 に拡大: 「メガ」でプレフィックス検索した時に
    // 全国図鑑順で後ろの方にあるメガゲッコウガ (id=90658) などが
    // 12件枠から漏れるのを防ぐ
    return searchInIndex(index, query, 50);
  }, [index, query]);

  return (
    <View style={styles.container}>
      {/* 検索テキスト入力 */}
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder ?? 'カタカナ / 英語 / 図鑑番号 で検索'}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* 読み込み中インジケーター */}
      {loading && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.statusText}>データを読み込み中…</Text>
        </View>
      )}

      {/* エラー表示 */}
      {error && <Text style={styles.error}>エラー: {error}</Text>}

      {/* 検索結果なし */}
      {!loading && !error && query && results.length === 0 && (
        <Text style={styles.empty}>該当なし</Text>
      )}

      {/* 検索結果一覧
          FlatList ではなく ScrollView + map で描画（VirtualizedList のネスト警告を回避） */}
      {results.length > 0 && (
        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {results.map((item) => (
            <Pressable
              key={item.id.toString()}
              onPress={() => {
                onSelect(item);
                setQuery(''); // 選択後に検索欄をクリア
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <CreatureAvatar
                types={item.types}
                label={item.nameJa}
                size={36}
              />
              <View style={styles.rowText}>
                <Text style={styles.name}>
                  #{item.id} {item.nameJa}
                </Text>
                <Text style={styles.nameEn}>{item.nameEn}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  statusText: {
    color: '#666',
    fontSize: 13,
  },
  error: {
    color: '#c33',
    paddingVertical: 8,
  },
  empty: {
    color: '#999',
    paddingVertical: 8,
    textAlign: 'center',
  },
  list: {
    maxHeight: 320,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowPressed: {
    backgroundColor: '#f5f5f5',
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  nameEn: {
    fontSize: 12,
    color: '#888',
  },
});
