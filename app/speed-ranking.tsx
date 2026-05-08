/**
 * 素早さランキング
 *
 * 全ポケモンの素早さを種族値または実数値（補正込み）でソートして一覧表示する。
 * - 「種族値」モード: 種族値の数値をそのまま比較
 * - 「実数値」モード: レベル・個体値・努力値・性格補正を加味した実数値で比較
 * - 名前で絞り込みが可能（日本語・英語どちらも対応）
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PokemonIndexEntry } from '@/src/types/pokemon';
import { loadPokemonIndex } from '@/src/data/pokemonIndex';
import { calcStat } from '@/src/utils/stats';
import { CreatureAvatar } from '@/src/components/CreatureAvatar';
import { TypeBadge } from '@/src/components/TypeBadge';

// 表示モード: base = 種族値、real = 実数値
type Mode = 'base' | 'real';

export default function SpeedRankingScreen() {
  // ─── データ読み込みステート ──────────────────────
  const [index, setIndex] = useState<PokemonIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── フィルター・表示オプション ─────────────────
  const [mode, setMode] = useState<Mode>('base');
  const [filter, setFilter] = useState('');
  const [level, setLevel] = useState('50');
  const [maxIv, setMaxIv] = useState(true);      // 個体値 31 固定
  const [maxEv, setMaxEv] = useState(true);      // 努力値 252 固定
  const [natureUp, setNatureUp] = useState(true); // 性格補正 +10%

  // ─── ポケモンデータを非同期で読み込む ──────────
  // コンポーネントのマウント時に1回だけ実行される
  useEffect(() => {
    let mounted = true; // アンマウント後に setState しないためのフラグ
    setLoading(true);
    loadPokemonIndex()
      .then((data) => mounted && setIndex(data))
      .catch((e: Error) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false; // クリーンアップ: コンポーネント破棄時にフラグを倒す
    };
  }, []);

  // ─── 名前フィルター + 速度計算 + ソート ─────────
  // index・filter・mode・level・補正オプションが変わるたびに再計算
  const ranked = useMemo(() => {
    if (!index) return [];

    // 入力した名前で絞り込み（空文字の場合は全件）
    const filtered = filter.trim()
      ? index.filter(
          (p) =>
            p.nameJa.includes(filter) ||
            p.nameEn.toLowerCase().includes(filter.toLowerCase())
        )
      : index;

    const lv = parseInt(level, 10) || 50;

    return [...filtered]
      .map((p) => {
        let speed: number;
        if (mode === 'base') {
          // 種族値モード: 種族値の数値をそのまま使用
          speed = p.baseStats.spe;
        } else {
          // 実数値モード: 補正込みの素早さ実数値を計算
          speed = calcStat(p.baseStats.spe, 'spe', {
            level: lv,
            ivs: { spe: maxIv ? 31 : 0 },
            evs: { spe: maxEv ? 252 : 0 },
            nature: { up: natureUp ? 'spe' : null, down: null },
          });
        }
        return { entry: p, speed };
      })
      .sort((a, b) => b.speed - a.speed); // 速い順に降順ソート
  }, [index, filter, mode, level, maxIv, maxEv, natureUp]);

  // ─── 読み込み中・エラー表示 ─────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.statusText}>データを読み込み中…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>エラー: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* フィルター・設定エリア */}
      <View style={styles.controls}>

        {/* 種族値 / 実数値 切り替え */}
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setMode('base')}
            style={[styles.modeBtn, mode === 'base' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === 'base' && styles.modeTextActive]}>種族値</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('real')}
            style={[styles.modeBtn, mode === 'real' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === 'real' && styles.modeTextActive]}>実数値</Text>
          </Pressable>
        </View>

        {/* 名前絞り込み入力 */}
        <TextInput
          style={styles.input}
          value={filter}
          onChangeText={setFilter}
          placeholder="名前で絞り込み"
          autoCorrect={false}
        />

        {/* 実数値モード専用オプション（レベル・個体値・努力値・性格補正） */}
        {mode === 'real' && (
          <View style={styles.realOpts}>
            <View style={styles.realRow}>
              <Text style={styles.realLabel}>Lv.</Text>
              <TextInput
                style={styles.realInput}
                keyboardType="number-pad"
                value={level}
                onChangeText={setLevel}
                maxLength={3}
              />
            </View>
            <Toggle label="個体値31"  value={maxIv}    onChange={setMaxIv} />
            <Toggle label="努力値252" value={maxEv}    onChange={setMaxEv} />
            <Toggle label="性格補正"  value={natureUp} onChange={setNatureUp} />
          </View>
        )}
      </View>

      {/* ランキングリスト */}
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.entry.id.toString()}
        renderItem={({ item, index: i }) => (
          <View style={styles.row}>
            {/* 順位 */}
            <Text style={styles.rank}>{i + 1}</Text>
            {/* アバター */}
            <CreatureAvatar
              types={item.entry.types}
              label={item.entry.nameJa}
              size={36}
            />
            {/* 名前・タイプ */}
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{item.entry.nameJa}</Text>
              <View style={styles.typeMini}>
                {item.entry.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </View>
            </View>
            {/* 素早さ値 */}
            <Text style={styles.speed}>{item.speed}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────────

// ラベル付きトグルスイッチ（実数値モードオプションで使用）
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

// ─────────────────────────────────────────────
// スタイル
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // 読み込み中・エラー表示用の中央揃えコンテナ
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  statusText: {
    color: '#666',
  },
  error: {
    color: '#c33',
  },

  // ── フィルター・設定エリア ──
  controls: {
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#3b5ba7',
  },
  modeText: {
    fontSize: 14,
    color: '#333',
  },
  modeTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  realOpts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  realRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  realLabel: {
    fontSize: 13,
    color: '#333',
  },
  realInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 50,
    fontSize: 13,
    textAlign: 'center',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#333',
  },

  // ── ランキングリスト各行 ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  rank: {
    width: 32,
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    textAlign: 'right',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeMini: {
    flexDirection: 'row',
    gap: 4,
  },
  speed: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3b5ba7',
    minWidth: 60,
    textAlign: 'right',
  },
  sep: {
    height: 1,
    backgroundColor: '#f3f3f3',
    marginLeft: 60,
  },
});
