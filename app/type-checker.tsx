/**
 * タイプ確認 (1〜2タイプ)
 *
 * 選んだタイプ群に対する被ダメージ倍率を一覧表示する。
 * - タイプボタンをタップして最大2個まで選択できる
 * - 4倍弱点 / 2倍弱点 / 等倍 / 半減 / 1/4軽減 / 無効 のグループ別に表示
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { POKEMON_TYPES, type PokemonType, TYPE_LABELS_JA } from '@/src/types/pokemon';
import { getDefensiveProfile } from '@/src/data/typeChart';
import { TypeBadge } from '@/src/components/TypeBadge';

export default function TypeCheckerScreen() {
  // 選択中のタイプ（最大2個）
  const [selected, setSelected] = useState<PokemonType[]>([]);

  // タイプボタンをタップしたときの処理
  // - すでに選択中なら解除
  // - 2個選択済みなら古い方（先頭）を捨てて新しいものに差し替え
  const toggleType = (t: PokemonType) => {
    setSelected((prev) => {
      if (prev.includes(t)) {
        return prev.filter((x) => x !== t);
      }
      if (prev.length >= 2) return [prev[1], t];
      return [...prev, t];
    });
  };

  // 選択タイプの被ダメージ倍率プロフィールを計算（選択が変わるたびに再計算）
  const profile = useMemo(() => {
    if (selected.length === 0) return null;
    return getDefensiveProfile(selected);
  }, [selected]);

  // 倍率ごとにタイプをグループ分け（profile が変わるたびに再計算）
  const groups = useMemo(() => {
    if (!profile) return null;
    const x4: PokemonType[] = [];
    const x2: PokemonType[] = [];
    const x1: PokemonType[] = [];
    const x05: PokemonType[] = [];
    const x025: PokemonType[] = [];
    const x0: PokemonType[] = [];
    for (const t of POKEMON_TYPES) {
      const m = profile[t];
      if (m === 0)    x0.push(t);
      else if (m === 0.25) x025.push(t);
      else if (m === 0.5)  x05.push(t);
      else if (m === 1)    x1.push(t);
      else if (m === 2)    x2.push(t);
      else if (m === 4)    x4.push(t);
    }
    return { x4, x2, x1, x05, x025, x0 };
  }, [profile]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* タイプ選択ボタン一覧 */}
        <Text style={styles.sectionTitle}>タイプを1〜2個選択</Text>
        <View style={styles.typeGrid}>
          {POKEMON_TYPES.map((t) => (
            <TypeBadge
              key={t}
              type={t}
              selected={selected.includes(t)}
              onPress={() => toggleType(t)}
            />
          ))}
        </View>

        {/* 選択中タイプの表示 */}
        {selected.length > 0 && (
          <Text style={styles.selectedLabel}>
            選択中: {selected.map((t) => TYPE_LABELS_JA[t]).join(' / ')}
          </Text>
        )}

        {/* 倍率グループ別の結果 */}
        {groups && (
          <View style={styles.results}>
            <ResultGroup title="🔥 4倍弱点"    tone="critical" types={groups.x4} />
            <ResultGroup title="⚠️ 2倍弱点"   tone="danger"   types={groups.x2} />
            <ResultGroup title="◯ 等倍"        tone="neutral"  types={groups.x1} />
            <ResultGroup title="🛡️ 半減"       tone="resist"   types={groups.x05} />
            <ResultGroup title="🛡️🛡️ 1/4 軽減" tone="resist"   types={groups.x025} />
            <ResultGroup title="✨ 無効"        tone="immune"   types={groups.x0} />
          </View>
        )}

        {/* タイプ未選択時のガイドメッセージ */}
        {!groups && (
          <Text style={styles.placeholder}>
            上のタイプボタンをタップして組み合わせを試してみてください。
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// サブコンポーネント: 倍率グループ表示
// ─────────────────────────────────────────────

interface ResultGroupProps {
  title: string;
  tone: 'critical' | 'danger' | 'neutral' | 'resist' | 'immune';
  types: PokemonType[];
}

// 1つの倍率グループ（タイトル + タイプバッジ一覧）を表示する
function ResultGroup({ title, tone, types }: ResultGroupProps) {
  // 対象タイプがなければ非表示
  if (types.length === 0) return null;
  return (
    <View style={[styles.group, toneStyles[tone]]}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupBadges}>
        {types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// スタイル
// ─────────────────────────────────────────────

// 倍率グループの背景色・枠色（tone ごとに定義）
const toneStyles = StyleSheet.create({
  critical: {
    backgroundColor: '#ffe5e0',
    borderColor: '#ff5a3c',
  },
  danger: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffa940',
  },
  neutral: {
    backgroundColor: '#f5f5f5',
    borderColor: '#bbb',
  },
  resist: {
    backgroundColor: '#e3f3e0',
    borderColor: '#7AC74C',
  },
  immune: {
    backgroundColor: '#e0e8ff',
    borderColor: '#3b5ba7',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b5ba7',
  },
  placeholder: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 32,
  },
  results: {
    gap: 8,
    marginTop: 8,
  },
  group: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  groupBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
