/**
 * ステータス計算
 *
 * 1体のポケモンを検索し、個体値・努力値・性格・レベルを入力して実数値を計算する。
 * - 6ステータス（HP / こうげき / ぼうぎょ / とくこう / とくぼう / すばやさ）を一覧表示
 * - 努力値の合計が510を超えると赤字で警告
 */

import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type PokemonIndexEntry, STAT_KEYS, STAT_LABELS_JA, type StatKey } from '@/src/types/pokemon';
import { type CalcParams, calcAllStats } from '@/src/utils/stats';
import { PokemonSearch } from '@/src/components/PokemonSearch';
import { TypeBadge } from '@/src/components/TypeBadge';
import { CreatureAvatar } from '@/src/components/CreatureAvatar';

// 選択できる性格の一覧（up: 上昇ステータス、down: 下降ステータス）
const NATURE_OPTIONS: Array<{ label: string; up: StatKey | null; down: StatKey | null }> = [
  { label: 'まじめ (補正なし)',    up: null,  down: null  },
  { label: 'いじっぱり (A↑/C↓)', up: 'atk', down: 'spa' },
  { label: 'ようき (S↑/C↓)',     up: 'spe', down: 'spa' },
  { label: 'ひかえめ (C↑/A↓)',   up: 'spa', down: 'atk' },
  { label: 'おくびょう (S↑/A↓)', up: 'spe', down: 'atk' },
  { label: 'ずぶとい (B↑/A↓)',   up: 'def', down: 'atk' },
  { label: 'わんぱく (B↑/C↓)',   up: 'def', down: 'spa' },
  { label: 'しんちょう (D↑/C↓)', up: 'spd', down: 'spa' },
  { label: 'おだやか (D↑/A↓)',   up: 'spd', down: 'atk' },
];

export default function StatsCalculatorScreen() {
  // ─── 入力ステート ───────────────────────────────
  const [selected, setSelected] = useState<PokemonIndexEntry | null>(null);
  const [level, setLevel] = useState('50');
  const [evs, setEvs] = useState<Record<StatKey, string>>({
    hp: '0', atk: '0', def: '0', spa: '0', spd: '0', spe: '0',
  });
  const [ivs, setIvs] = useState<Record<StatKey, string>>({
    hp: '31', atk: '31', def: '31', spa: '31', spd: '31', spe: '31',
  });
  const [natureIdx, setNatureIdx] = useState(0); // NATURE_OPTIONS のインデックス

  // ─── 計算パラメータ（入力が変わるたびに再生成） ───────
  const params: CalcParams = useMemo(() => ({
    level: parseInt(level, 10) || 50,
    ivs: {
      hp:  toInt(ivs.hp),  atk: toInt(ivs.atk), def: toInt(ivs.def),
      spa: toInt(ivs.spa), spd: toInt(ivs.spd), spe: toInt(ivs.spe),
    },
    evs: {
      hp:  toInt(evs.hp),  atk: toInt(evs.atk), def: toInt(evs.def),
      spa: toInt(evs.spa), spd: toInt(evs.spd), spe: toInt(evs.spe),
    },
    nature: {
      up:   NATURE_OPTIONS[natureIdx].up   as Exclude<StatKey, 'hp'> | null,
      down: NATURE_OPTIONS[natureIdx].down as Exclude<StatKey, 'hp'> | null,
    },
  }), [level, evs, ivs, natureIdx]);

  // ─── 実数値計算（ポケモンまたはパラメータが変わったら再計算） ───
  const calculated = useMemo(() => {
    if (!selected) return null;
    return calcAllStats(selected.baseStats, params);
  }, [selected, params]);

  // 努力値の合計（510 を超えるとゲーム上は無効）
  const totalEvs = STAT_KEYS.reduce((acc, k) => acc + toInt(evs[k]), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* iOS: キーボード表示時に入力欄が隠れないよう自動スクロール */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ポケモン検索 */}
          <PokemonSearch onSelect={setSelected} placeholder="ポケモンを検索" />

          {selected ? (
            <>
              {/* 選択ポケモンの情報カード */}
              <View style={styles.headerCard}>
                <CreatureAvatar types={selected.types} label={selected.nameJa} size={64} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    #{selected.id} {selected.nameJa}
                  </Text>
                  <Text style={styles.nameEn}>{selected.nameEn}</Text>
                  <View style={styles.typeRow}>
                    {selected.types.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </View>
                </View>
              </View>

              {/* レベル入力 */}
              <View style={styles.row}>
                <Text style={styles.label}>レベル</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={level}
                  onChangeText={setLevel}
                  maxLength={3}
                />
              </View>

              {/* 性格選択（タップで切り替え） */}
              <Text style={styles.sectionTitle}>性格</Text>
              <View style={styles.natureGrid}>
                {NATURE_OPTIONS.map((n, i) => (
                  <Pressable
                    key={n.label}
                    onPress={() => setNatureIdx(i)}
                    style={[
                      styles.natureChip,
                      i === natureIdx && styles.natureChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.natureChipText,
                        i === natureIdx && styles.natureChipTextActive,
                      ]}
                    >
                      {n.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 個体値入力（0〜31） */}
              <Text style={styles.sectionTitle}>個体値 (0〜31)</Text>
              <StatInputRow
                values={ivs}
                onChange={(k, v) => setIvs((p) => ({ ...p, [k]: clampStr(v, 31) }))}
                max={31}
              />

              {/* 努力値入力（0〜252、合計510まで） */}
              <Text style={styles.sectionTitle}>努力値 (0〜252、合計510まで)</Text>
              <StatInputRow
                values={evs}
                onChange={(k, v) => setEvs((p) => ({ ...p, [k]: clampStr(v, 252) }))}
                max={252}
              />
              {/* 合計が 510 超えたら赤字で警告 */}
              <Text style={[styles.evTotal, totalEvs > 510 && styles.evTotalOver]}>
                合計: {totalEvs} / 510
              </Text>

              {/* 計算された実数値一覧 */}
              {calculated && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>実数値</Text>
                  {STAT_KEYS.map((k) => (
                    <View key={k} style={styles.resultRow}>
                      <Text style={styles.resultLabel}>{STAT_LABELS_JA[k]}</Text>
                      <Text style={styles.resultBase}>種族 {selected.baseStats[k]}</Text>
                      <Text style={styles.resultValue}>{calculated[k]}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.placeholder}>上の検索欄からポケモンを選んでください。</Text>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────────

interface StatInputRowProps {
  values: Record<StatKey, string>;
  onChange: (k: StatKey, v: string) => void;
  max: number;
}

// 6ステータス分の入力フォームを横並びグリッドで表示する
function StatInputRow({ values, onChange, max }: StatInputRowProps) {
  return (
    <View style={styles.statGrid}>
      {STAT_KEYS.map((k) => (
        <View key={k} style={styles.statCell}>
          <Text style={styles.statCellLabel}>{STAT_LABELS_JA[k]}</Text>
          <TextInput
            style={styles.statInput}
            keyboardType="number-pad"
            value={values[k]}
            onChangeText={(v) => onChange(k, v)}
            maxLength={3}
          />
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
// ヘルパー関数
// ─────────────────────────────────────────────

// 文字列を整数に変換（空文字・非数値は 0 を返す）
function toInt(s: string): number {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

// 入力値を 0〜max の範囲に丸めて文字列で返す（空文字はそのまま返す）
function clampStr(s: string, max: number): string {
  if (s === '') return s;
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return '0';
  return Math.max(0, Math.min(max, n)).toString();
}

// ─────────────────────────────────────────────
// スタイル
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },

  // ── ポケモン情報カード ──
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  nameEn: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },

  // ── レベル入力行 ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 70,
    fontSize: 15,
    backgroundColor: '#fff',
  },

  // ── セクションタイトル ──
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },

  // ── 性格選択チップ ──
  natureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  natureChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  natureChipActive: {
    backgroundColor: '#3b5ba7',
  },
  natureChipText: {
    fontSize: 12,
    color: '#333',
  },
  natureChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // ── 個体値・努力値 入力グリッド ──
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCell: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
  },
  statCellLabel: {
    fontSize: 11,
    color: '#666',
  },
  statInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: '100%',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#fff',
  },

  // ── 努力値合計 ──
  evTotal: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  evTotalOver: {
    color: '#c33',
    fontWeight: '700',
  },

  // ── 実数値結果カード ──
  resultCard: {
    backgroundColor: '#f8fbff',
    borderColor: '#3b5ba7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3b5ba7',
    marginBottom: 4,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5edff',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    width: 80,
  },
  resultBase: {
    fontSize: 12,
    color: '#888',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b5ba7',
  },

  placeholder: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 32,
  },
});
