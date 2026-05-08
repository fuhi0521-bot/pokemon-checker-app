/**
 * ダメージ計算
 *
 * UX設計の参考: Pokémon Showdown Damage Calc, ポケモン徹底攻略 (yakkun), Game8, ポケソル
 * 主要な改修ポイント (UX_ANALYSIS.md 参照):
 *   - ダメージ範囲を HP ゲージで視覚化（PS Calc 流のビジュアライザ）
 *   - 確定数の表示を最大級に強調（対戦勢が最も知りたい指標）
 *   - 技タイプ選択を 3 列グリッドに（モバイルでタップしやすく）
 *   - 威力・レベルにプリセットボタンを追加（Lv.50/100、威力60/80/100/120）
 *   - STAB / 相性 / 急所 の倍率内訳をピル表示
 */

import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  POKEMON_TYPES,
  type PokemonIndexEntry,
  type PokemonType,
} from '@/src/types/pokemon';
import { calcAllStats, DEFAULT_CALC_PARAMS } from '@/src/utils/stats';
import { calcDamage } from '@/src/utils/damageCalc';
import { PokemonSearch } from '@/src/components/PokemonSearch';
import { CreatureAvatar } from '@/src/components/CreatureAvatar';
import { TypeBadge } from '@/src/components/TypeBadge';

// プリセット (UX_ANALYSIS B-4: タップ操作の効率化)
const POWER_PRESETS = [60, 80, 90, 100, 120, 150];
const LEVEL_PRESETS = [50, 100];

export default function DamageCalcScreen() {
  const [attacker, setAttacker] = useState<PokemonIndexEntry | null>(null);
  const [defender, setDefender] = useState<PokemonIndexEntry | null>(null);
  const [moveType, setMoveType] = useState<PokemonType>('normal');
  const [power, setPower] = useState('80');
  const [category, setCategory] = useState<'physical' | 'special'>('physical');
  const [critical, setCritical] = useState(false);
  const [level, setLevel] = useState('50');

  const result = useMemo(() => {
    if (!attacker || !defender) return null;
    const lv = parseInt(level, 10) || 50;
    const params = { ...DEFAULT_CALC_PARAMS, level: lv };

    const attackerStats = calcAllStats(attacker.baseStats, params);
    const defenderStats = calcAllStats(defender.baseStats, params);

    return {
      damage: calcDamage({
        level: lv,
        attackerTypes: attacker.types,
        defenderTypes: defender.types,
        moveType,
        power: parseInt(power, 10) || 0,
        category,
        attackerStats,
        defenderStats,
        critical,
      }),
      defenderHp: defenderStats.hp,
    };
  }, [attacker, defender, moveType, power, category, critical, level]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* ─── 結果表示 (最上部・最大強調) ─── */}
          {result && attacker && defender ? (
            <ResultPanel
              result={result.damage}
              defenderHp={result.defenderHp}
              critical={critical}
            />
          ) : (
            <View style={styles.emptyResult}>
              <Text style={styles.emptyResultText}>
                攻撃側と防御側の両方を選択してください
              </Text>
            </View>
          )}

          {/* ─── 攻撃側 / 防御側 (横並び) ─── */}
          <View style={styles.battleRow}>
            <View style={styles.sideBlock}>
              <Text style={[styles.sideTitle, styles.sideTitleAtk]}>攻撃側</Text>
              {attacker ? (
                <SelectedCard entry={attacker} onClear={() => setAttacker(null)} />
              ) : (
                <PokemonSearch onSelect={setAttacker} placeholder="攻撃側を検索" />
              )}
            </View>
            <View style={styles.sideBlock}>
              <Text style={[styles.sideTitle, styles.sideTitleDef]}>防御側</Text>
              {defender ? (
                <SelectedCard entry={defender} onClear={() => setDefender(null)} />
              ) : (
                <PokemonSearch onSelect={setDefender} placeholder="防御側を検索" />
              )}
            </View>
          </View>

          {/* ─── 技設定 ─── */}
          <Text style={styles.sectionTitle}>技</Text>

          {/* 物理 / 特殊 トグル (大きめ) */}
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setCategory('physical')}
              style={[styles.modeBtn, category === 'physical' && styles.modeBtnActive]}
            >
              <Text style={[styles.modeText, category === 'physical' && styles.modeTextActive]}>
                物理 (こうげき)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setCategory('special')}
              style={[styles.modeBtn, category === 'special' && styles.modeBtnActive]}
            >
              <Text style={[styles.modeText, category === 'special' && styles.modeTextActive]}>
                特殊 (とくこう)
              </Text>
            </Pressable>
          </View>

          {/* 威力 (プリセット + 数値) */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>威力</Text>
            <View style={styles.presetRow}>
              {POWER_PRESETS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPower(p.toString())}
                  style={[
                    styles.presetBtn,
                    parseInt(power, 10) === p && styles.presetBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      parseInt(power, 10) === p && styles.presetTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
              <TextInput
                style={styles.numberInput}
                keyboardType="number-pad"
                value={power}
                onChangeText={setPower}
                maxLength={3}
                placeholder="任意"
              />
            </View>
          </View>

          {/* レベル (プリセット + 数値) */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>レベル</Text>
            <View style={styles.presetRow}>
              {LEVEL_PRESETS.map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLevel(l.toString())}
                  style={[
                    styles.presetBtn,
                    parseInt(level, 10) === l && styles.presetBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      parseInt(level, 10) === l && styles.presetTextActive,
                    ]}
                  >
                    Lv.{l}
                  </Text>
                </Pressable>
              ))}
              <TextInput
                style={styles.numberInput}
                keyboardType="number-pad"
                value={level}
                onChangeText={setLevel}
                maxLength={3}
                placeholder="任意"
              />
            </View>
          </View>

          {/* 技タイプ (3列グリッド・大きめ) */}
          <Text style={[styles.inputLabel, { marginTop: 8 }]}>技タイプ</Text>
          <View style={styles.typeGrid}>
            {POKEMON_TYPES.map((t) => (
              <View key={t} style={styles.typeCell}>
                <TypeBadge
                  type={t}
                  selected={moveType === t}
                  onPress={() => setMoveType(t)}
                  size="md"
                />
              </View>
            ))}
          </View>

          {/* 急所トグル */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>急所</Text>
            <Switch value={critical} onValueChange={setCritical} />
          </View>

          {/* 注記 */}
          <Text style={styles.note}>
            ※ 特性・もちもの・天候・場の効果は未対応です。
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────
// 結果表示パネル (HPゲージ + 確定数強調)
// ────────────────────────────────────────────
//
// PS Calc / ポケモン徹底攻略 ダメ計のスタイルを参考にした。
// 上半分: HPゲージビジュアライザ (min〜max ダメージを色付き帯で重ねる)
// 下半分: 確定数 (大きく) + ダメージ値・割合・倍率内訳
interface ResultPanelProps {
  result: ReturnType<typeof calcDamage>;
  defenderHp: number;
  critical: boolean;
}

function ResultPanel({ result, defenderHp, critical }: ResultPanelProps) {
  const minPct = Math.min(100, (result.min / defenderHp) * 100);
  const maxPct = Math.min(100, (result.max / defenderHp) * 100);

  // 色: 確KO=赤、乱KO=橙、半分以下=緑
  const isKO = result.min >= defenderHp;
  const maybeKO = result.max >= defenderHp;
  const gaugeColor = isKO ? '#c33' : maybeKO ? '#EE8130' : '#3b5ba7';

  return (
    <View style={resultStyles.card}>
      {/* HPゲージ */}
      <View style={resultStyles.gaugeWrap}>
        <View style={resultStyles.gaugeBg}>
          {/* min ダメージ部分 (濃い色) */}
          <View
            style={[
              resultStyles.gaugeMin,
              { width: `${minPct}%`, backgroundColor: gaugeColor },
            ]}
          />
          {/* min〜max のレンジ (薄い色) */}
          <View
            style={[
              resultStyles.gaugeRange,
              {
                left: `${minPct}%`,
                width: `${Math.max(0, maxPct - minPct)}%`,
                backgroundColor: gaugeColor,
                opacity: 0.4,
              },
            ]}
          />
        </View>
        <View style={resultStyles.gaugeLabels}>
          <Text style={resultStyles.gaugePct}>
            {result.hpPercentMin.toFixed(1)}% 〜 {result.hpPercentMax.toFixed(1)}%
          </Text>
          <Text style={resultStyles.gaugeAbs}>
            {result.min} 〜 {result.max} / HP {defenderHp}
          </Text>
        </View>
      </View>

      {/* 確定数 (最大強調) */}
      <View style={resultStyles.koRow}>
        <Text style={[resultStyles.koText, { color: gaugeColor }]}>
          {result.knockoutDescription}
        </Text>
      </View>

      {/* 倍率内訳 (ピル) */}
      <View style={resultStyles.factorRow}>
        <FactorPill label="STAB" value={result.stab ? '×1.5' : '×1.0'} active={result.stab} />
        <FactorPill
          label="相性"
          value={`×${result.typeMultiplier}`}
          tone={
            result.typeMultiplier >= 2
              ? 'good'
              : result.typeMultiplier === 0
              ? 'immune'
              : result.typeMultiplier <= 0.5
              ? 'bad'
              : 'neutral'
          }
        />
        <FactorPill label="急所" value={critical ? '×1.5' : '×1.0'} active={critical} />
      </View>
    </View>
  );
}

interface FactorPillProps {
  label: string;
  value: string;
  active?: boolean;
  tone?: 'good' | 'bad' | 'neutral' | 'immune';
}

function FactorPill({ label, value, active, tone = 'neutral' }: FactorPillProps) {
  let backgroundColor = '#eee';
  let textColor = '#666';
  if (active) {
    backgroundColor = '#3b5ba7';
    textColor = '#fff';
  } else if (tone === 'good') {
    backgroundColor = '#2a9d3a';
    textColor = '#fff';
  } else if (tone === 'bad') {
    backgroundColor = '#888';
    textColor = '#fff';
  } else if (tone === 'immune') {
    backgroundColor = '#9aaad9';
    textColor = '#fff';
  }
  return (
    <View style={[resultStyles.pill, { backgroundColor }]}>
      <Text style={[resultStyles.pillLabel, { color: textColor }]}>{label}</Text>
      <Text style={[resultStyles.pillValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

// ────────────────────────────────────────────
// 選択済みポケモンのカード
// ────────────────────────────────────────────
interface SelectedCardProps {
  entry: PokemonIndexEntry;
  onClear: () => void;
}

function SelectedCard({ entry, onClear }: SelectedCardProps) {
  return (
    <View style={styles.selectedCard}>
      <CreatureAvatar types={entry.types} label={entry.nameJa} size={44} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.selectedName} numberOfLines={1}>
          {entry.nameJa}
        </Text>
        <View style={styles.typeMini}>
          {entry.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </View>
      </View>
      <Pressable onPress={onClear} style={styles.clearBtn}>
        <Text style={styles.clearBtnText}>変更</Text>
      </Pressable>
    </View>
  );
}

// ────────────────────────────────────────────
// スタイル
// ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scroll: { padding: 12, gap: 12 },

  // 結果未表示時のプレースホルダ
  emptyResult: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  emptyResultText: { color: '#888', fontSize: 13 },

  // 攻撃側/防御側
  battleRow: { gap: 8 },
  sideBlock: { gap: 6 },
  sideTitle: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  sideTitleAtk: { color: '#fff', backgroundColor: '#EE8130' },
  sideTitleDef: { color: '#fff', backgroundColor: '#3b5ba7' },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 10,
  },
  selectedName: { fontSize: 14, fontWeight: '700' },
  typeMini: { flexDirection: 'row', gap: 4 },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  clearBtnText: { fontSize: 11, color: '#333', fontWeight: '600' },

  // セクション・入力共通
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b5ba7',
    marginTop: 4,
  },
  inputBlock: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  presetBtnActive: { backgroundColor: '#3b5ba7' },
  presetText: { fontSize: 13, color: '#333', fontWeight: '600' },
  presetTextActive: { color: '#fff' },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: 64,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#fff',
  },

  // 物理/特殊
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#3b5ba7' },
  modeText: { fontSize: 13, color: '#333' },
  modeTextActive: { color: '#fff', fontWeight: '700' },

  // 技タイプ (3列グリッド)
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeCell: {
    width: '32%',
  },

  // 急所トグル
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },

  note: { fontSize: 11, color: '#999', marginTop: 8 },
});

const resultStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // HPゲージ
  gaugeWrap: { gap: 6 },
  gaugeBg: {
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeMin: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  gaugeRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  gaugePct: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  gaugeAbs: { fontSize: 12, color: '#666' },
  // 確定数 (大きく)
  koRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  koText: {
    fontSize: 28,
    fontWeight: '800',
  },
  // 倍率内訳
  factorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  pillLabel: { fontSize: 11, fontWeight: '600' },
  pillValue: { fontSize: 13, fontWeight: '700' },
});
