/**
 * タイプバランスチェッカー
 *
 * UX設計の参考: Pokémon Showdown Teambuilder, Marriland Team Builder, Game8 ポケチャン
 * 主要な改修ポイント (UX_ANALYSIS.md 参照):
 *   - バランススコアを廃止 (主要競技サイトで採用例なし、誤誘導リスクあり)
 *   - タイプ別サマリーバーを最上部に配置 (赤=弱点数 / 青=耐性数 のピル表示)
 *   - メンバー一覧を 2列グリッドに変更 (省スペース化)
 *   - 6×18 倍率マトリクスは折りたたみ式に (デフォルト非表示)
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  POKEMON_TYPES,
  type PokemonIndexEntry,
  type PokemonType,
  TYPE_COLORS,
  TYPE_LABELS_JA,
} from '@/src/types/pokemon';
import { analyzeTeam, type TeamMemberTypes } from '@/src/utils/teamAnalysis';
import { PokemonSearch } from '@/src/components/PokemonSearch';
import { CreatureAvatar } from '@/src/components/CreatureAvatar';
import { TypeBadge } from '@/src/components/TypeBadge';

const MAX_TEAM = 6;

export default function TeamBalanceScreen() {
  const [members, setMembers] = useState<PokemonIndexEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [matrixExpanded, setMatrixExpanded] = useState(false);

  const handleAdd = (entry: PokemonIndexEntry) => {
    if (members.length >= MAX_TEAM) return;
    setMembers((prev) => [...prev, entry]);
    setAdding(false);
  };

  const removeAt = (i: number) => {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const teamForAnalysis: TeamMemberTypes[] = useMemo(
    () =>
      members.map((m, i) => ({
        id: `${m.id}-${i}`,
        label: m.nameJa,
        types: m.types,
      })),
    [members]
  );

  const report = useMemo(() => analyzeTeam(teamForAnalysis), [teamForAnalysis]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ─── タイプ別サマリー (最上部、最も目立つ) ─── */}
        {members.length > 0 && (
          <TypeSummary
            weakCounts={report.weakCounts}
            resistCounts={report.resistCounts}
            criticalTypes={report.criticalTypes}
            dangerousTypes={report.dangerousTypes}
            resistanceHoles={report.resistanceHoles}
          />
        )}

        {/* ─── メンバー一覧 (2列グリッド) ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>パーティ</Text>
          <Text style={styles.sectionCount}>{members.length} / {MAX_TEAM}</Text>
        </View>

        <View style={styles.memberGrid}>
          {members.map((m, i) => (
            <View key={`${m.id}-${i}`} style={styles.memberCard}>
              <Pressable
                onPress={() => removeAt(i)}
                style={styles.memberRemove}
                hitSlop={6}
              >
                <Text style={styles.memberRemoveText}>×</Text>
              </Pressable>
              <CreatureAvatar types={m.types} label={m.nameJa} size={48} />
              <Text style={styles.memberName} numberOfLines={1}>
                {m.nameJa}
              </Text>
              <View style={styles.memberTypeRow}>
                {m.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </View>
            </View>
          ))}

          {members.length < MAX_TEAM && !adding && (
            <Pressable
              onPress={() => setAdding(true)}
              style={[styles.memberCard, styles.memberAddCard]}
            >
              <Text style={styles.memberAddPlus}>＋</Text>
              <Text style={styles.memberAddText}>追加</Text>
            </Pressable>
          )}
        </View>

        {/* ─── 検索パネル (追加モード時のみ) ─── */}
        {adding && (
          <View style={styles.addPanel}>
            <PokemonSearch
              onSelect={handleAdd}
              placeholder="追加するポケモンを検索"
            />
            <Pressable onPress={() => setAdding(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>キャンセル</Text>
            </Pressable>
          </View>
        )}

        {/* ─── 詳細マトリクス (折りたたみ、デフォルト非表示) ─── */}
        {members.length > 0 && (
          <View style={styles.matrixSection}>
            <Pressable
              onPress={() => setMatrixExpanded((v) => !v)}
              style={styles.matrixToggle}
            >
              <Text style={styles.matrixToggleText}>
                {matrixExpanded ? '▼' : '▶'} 詳細マトリクス（個別の被ダメージ倍率）
              </Text>
            </Pressable>
            {matrixExpanded && (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  <View style={styles.matrixHeaderRow}>
                    <View style={[styles.matrixCellHeader, styles.matrixCellNameHeader]} />
                    {POKEMON_TYPES.map((t) => (
                      <View key={t} style={styles.matrixCellHeader}>
                        <TypeBadge type={t} size="sm" />
                      </View>
                    ))}
                  </View>
                  {report.matrix.map((row) => (
                    <View key={row.memberId} style={styles.matrixRow}>
                      <View style={[styles.matrixCell, styles.matrixCellName]}>
                        <Text numberOfLines={1} style={styles.matrixName}>
                          {row.label}
                        </Text>
                      </View>
                      {POKEMON_TYPES.map((t) => {
                        const m = row.profile[t];
                        return (
                          <View key={t} style={[styles.matrixCell, multiplierStyle(m)]}>
                            <Text style={styles.matrixCellText}>{formatMultiplier(m)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {members.length === 0 && (
          <Text style={styles.placeholder}>
            「＋ 追加」からパーティを組み立ててください
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────
// タイプ別サマリーバー
// ────────────────────────────────────────────
//
// 各タイプに対する「2倍以上で受ける味方の数 (赤)」「半減以下で受けられる味方の数 (青)」を
// ピルで表示する。Pokémon Showdown Teambuilder のタリー表示パターンを採用。
// 致命タイプ(3匹以上が弱点)は赤背景で目立たせる。
interface TypeSummaryProps {
  weakCounts: Record<PokemonType, number>;
  resistCounts: Record<PokemonType, number>;
  criticalTypes: PokemonType[];
  dangerousTypes: PokemonType[];
  resistanceHoles: PokemonType[];
}

function TypeSummary({
  weakCounts,
  resistCounts,
  criticalTypes,
  dangerousTypes,
  resistanceHoles,
}: TypeSummaryProps) {
  return (
    <View style={summaryStyles.container}>
      {/* 警告アラート (致命/危険/穴) */}
      {(criticalTypes.length > 0 ||
        dangerousTypes.length > 0 ||
        resistanceHoles.length > 0) && (
        <View style={summaryStyles.alertBox}>
          {criticalTypes.length > 0 && (
            <View style={[summaryStyles.alertRow, summaryStyles.alertCritical]}>
              <Text style={summaryStyles.alertLabel}>致命</Text>
              <Text style={summaryStyles.alertText}>
                {criticalTypes.map((t) => TYPE_LABELS_JA[t]).join('・')}
              </Text>
              <Text style={summaryStyles.alertHint}>3匹以上が弱点</Text>
            </View>
          )}
          {dangerousTypes.length > 0 && (
            <View style={[summaryStyles.alertRow, summaryStyles.alertDanger]}>
              <Text style={summaryStyles.alertLabel}>注意</Text>
              <Text style={summaryStyles.alertText}>
                {dangerousTypes.map((t) => TYPE_LABELS_JA[t]).join('・')}
              </Text>
              <Text style={summaryStyles.alertHint}>2匹が弱点</Text>
            </View>
          )}
          {resistanceHoles.length > 0 && (
            <View style={[summaryStyles.alertRow, summaryStyles.alertHole]}>
              <Text style={summaryStyles.alertLabel}>穴</Text>
              <Text style={summaryStyles.alertText}>
                {resistanceHoles.map((t) => TYPE_LABELS_JA[t]).join('・')}
              </Text>
              <Text style={summaryStyles.alertHint}>誰も半減できない</Text>
            </View>
          )}
        </View>
      )}

      {/* タイプごとの弱点・耐性タリー */}
      <Text style={summaryStyles.title}>タイプ別 弱点 / 耐性</Text>
      <View style={summaryStyles.grid}>
        {POKEMON_TYPES.map((t) => {
          const w = weakCounts[t];
          const r = resistCounts[t];
          const isCritical = criticalTypes.includes(t);
          const isDanger = dangerousTypes.includes(t);
          return (
            <View
              key={t}
              style={[
                summaryStyles.tile,
                isCritical && summaryStyles.tileCritical,
                isDanger && summaryStyles.tileDanger,
              ]}
            >
              <View style={[summaryStyles.tileHeader, { backgroundColor: TYPE_COLORS[t] }]}>
                <Text style={summaryStyles.tileLabel}>{TYPE_LABELS_JA[t]}</Text>
              </View>
              <View style={summaryStyles.tileBody}>
                <View style={summaryStyles.counterRow}>
                  <Text style={[summaryStyles.counterText, summaryStyles.counterWeak]}>
                    弱{w}
                  </Text>
                  <Text style={[summaryStyles.counterText, summaryStyles.counterResist]}>
                    耐{r}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ────────────────────────────────────────────
// マトリクスのセル装飾
// ────────────────────────────────────────────
function formatMultiplier(m: number): string {
  if (m === 0) return '0';
  if (m === 0.25) return '¼';
  if (m === 0.5) return '½';
  if (m === 1) return '1';
  if (m === 2) return '2';
  if (m === 4) return '4';
  return m.toString();
}

function multiplierStyle(m: number) {
  if (m === 4) return styles.cellX4;
  if (m === 2) return styles.cellX2;
  if (m === 0.5) return styles.cellX05;
  if (m === 0.25) return styles.cellX025;
  if (m === 0) return styles.cellX0;
  return styles.cellX1;
}

// ────────────────────────────────────────────
// スタイル
// ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 12, gap: 12 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  sectionCount: { fontSize: 13, color: '#888' },

  // ── メンバーグリッド (2列) ──
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberCard: {
    width: '48.5%',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 6,
    minHeight: 110,
    position: 'relative',
  },
  memberAddCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#7AC74C',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  memberAddPlus: { fontSize: 32, color: '#2a9d3a', fontWeight: '300' },
  memberAddText: { fontSize: 13, color: '#2a9d3a', fontWeight: '700' },
  memberRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  memberRemoveText: { fontSize: 14, color: '#666', fontWeight: '700', lineHeight: 16 },
  memberName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  memberTypeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center' },

  // ── 追加検索パネル ──
  addPanel: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  cancelBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  cancelBtnText: { fontSize: 12, color: '#333' },

  // ── マトリクス (折りたたみ) ──
  matrixSection: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 10,
  },
  matrixToggle: { paddingVertical: 4 },
  matrixToggleText: { fontSize: 13, fontWeight: '600', color: '#3b5ba7' },
  matrixHeaderRow: { flexDirection: 'row', marginTop: 8 },
  matrixRow: { flexDirection: 'row' },
  matrixCellHeader: {
    width: 52,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixCellNameHeader: { width: 90 },
  matrixCell: {
    width: 52,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  matrixCellName: {
    width: 90,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  matrixName: { fontSize: 11, fontWeight: '600' },
  matrixCellText: { fontSize: 13, fontWeight: '600' },
  cellX4: { backgroundColor: '#ff5a3c' },
  cellX2: { backgroundColor: '#ffb96a' },
  cellX1: { backgroundColor: '#f0f0f0' },
  cellX05: { backgroundColor: '#a8d995' },
  cellX025: { backgroundColor: '#5fb56a' },
  cellX0: { backgroundColor: '#9aaad9' },

  placeholder: { color: '#999', textAlign: 'center', marginTop: 32, fontSize: 13 },
});

const summaryStyles = StyleSheet.create({
  container: {
    gap: 10,
  },
  // アラート
  alertBox: {
    gap: 6,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  alertCritical: { backgroundColor: '#ffe5e0', borderLeftWidth: 4, borderLeftColor: '#c33' },
  alertDanger: { backgroundColor: '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#EE8130' },
  alertHole: { backgroundColor: '#e8edf7', borderLeftWidth: 4, borderLeftColor: '#3b5ba7' },
  alertLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#666',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  alertHint: { fontSize: 10, color: '#888' },
  // タイプ別タイル
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tile: {
    width: '32%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tileCritical: {
    borderColor: '#c33',
    borderWidth: 2,
  },
  tileDanger: {
    borderColor: '#EE8130',
    borderWidth: 2,
  },
  tileHeader: {
    paddingVertical: 3,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tileBody: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  counterWeak: {
    color: '#fff',
    backgroundColor: '#c33',
  },
  counterResist: {
    color: '#fff',
    backgroundColor: '#3b5ba7',
  },
});
