/**
 * ホーム画面
 *
 * 各機能へのナビゲーションカードを一覧表示する。
 * カードをタップすると対応する画面に遷移する。
 * featureFlags によって表示/非表示が切り替えられる。
 */

import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { featureFlags } from '@/src/config/featureFlags';
import { AdBanner } from '@/src/components/AdBanner';

/** 機能カード1枚分の定義 */
interface FeatureCard {
  href:
    | '/type-checker'
    | '/stats-calculator'
    | '/speed-ranking'
    | '/damage-calc'
    | '/team-balance';
  title: string;
  description: string;
  emoji: string;
  color: string;       // カード左端のアクセントカラー
  enabled: boolean;    // featureFlags で制御（false なら表示しない）
}

/** 機能カードの一覧（表示順で定義） */
const CARDS: FeatureCard[] = [
  {
    href: '/team-balance',
    title: 'タイプバランス',
    description: 'パーティ最大6体の弱点を一括チェック',
    emoji: '🛡️',
    color: '#3b5ba7',
    enabled: featureFlags.teamBalance,
  },
  {
    href: '/speed-ranking',
    title: '素早さランキング',
    description: '実数値・種族値で並び替え',
    emoji: '⚡',
    color: '#F7D02C',
    enabled: featureFlags.speedRanking,
  },
  {
    href: '/damage-calc',
    title: 'ダメージ計算',
    description: '威力・タイプ・ステータスから確定数を算出',
    emoji: '💥',
    color: '#EE8130',
    enabled: featureFlags.damageCalc,
  },
  {
    href: '/type-checker',
    title: 'タイプ確認',
    description: '1〜2タイプの弱点・耐性を一覧',
    emoji: '🔍',
    color: '#7AC74C',
    enabled: featureFlags.singleTypeChecker,
  },
  {
    href: '/stats-calculator',
    title: 'ステータス計算',
    description: '個体値・努力値・性格込みの実数値',
    emoji: '📊',
    color: '#A98FF3',
    enabled: featureFlags.statsCalculator,
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* アプリタイトルヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>対戦補助ツール</Text>
        </View>

        {/* 機能カード一覧（enabled が false のものは除外） */}
        {CARDS.filter((c) => c.enabled).map((card) => (
          <Link key={card.href} href={card.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: card.color }, // カードごとに左端の色を変える
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.description}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </Pressable>
          </Link>
        ))}

        {/* 広告バナー（featureFlags.ads / adsPlaceholder で制御） */}
        <AdBanner />

        {/* 免責表示 */}
        <Text style={styles.disclaimer}>
          ※ 本アプリは特定のゲーム会社・タイトル・ブランドとは一切関係ありません。
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// スタイル
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scroll: {
    padding: 16,
    gap: 12,
  },

  // ── タイトルヘッダー ──
  header: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  // ── 機能カード ──
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 28,
    color: '#bbb',
  },

  // ── 免責表示 ──
  disclaimer: {
    fontSize: 11,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
