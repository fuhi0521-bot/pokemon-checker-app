/**
 * インアプリ起動ローディング画面
 *
 * ネイティブスプラッシュ (expo-splash-screen) が消えた後、
 * ポケモンインデックスのダウンロード/初期化が終わるまで表示される。
 *
 * デザイン:
 *   - スプラッシュと同じブランドブルー背景
 *   - シールドロゴをアニメーション表示（脈動）
 *   - 中央下部にローディングインジケータ + ステータス文言
 */

import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  /** 状態文言（例: "データを読み込み中..."） */
  message?: string;
  /** サブメッセージ（任意） */
  subMessage?: string;
}

export function AppLoadingScreen({
  message = 'データを読み込み中...',
  subMessage,
}: Props) {
  // ロゴをふわっと脈動させる
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulse }] }]}>
        <ShieldLogo />
      </Animated.View>

      <Text style={styles.title}>タイプバランス</Text>
      <Text style={styles.subtitle}>対戦補助ツール（β）</Text>

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.message}>{message}</Text>
      </View>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

/**
 * ロゴ: View だけで作るシールド + 6色ドット
 * （SVG ライブラリ依存を避けるため、CSS-likeに組む）
 */
function ShieldLogo() {
  return (
    <View style={logoStyles.shield}>
      {/* 6つのタイプ色ドット (3x2) */}
      <View style={logoStyles.dotRow}>
        <View style={[logoStyles.dot, { backgroundColor: '#EE8130' }]} />
        <View style={[logoStyles.dot, { backgroundColor: '#6390F0', marginTop: -8 }]} />
        <View style={[logoStyles.dot, { backgroundColor: '#F7D02C' }]} />
      </View>
      <View style={logoStyles.dotRow}>
        <View style={[logoStyles.dot, { backgroundColor: '#7AC74C' }]} />
        <View style={[logoStyles.dot, { backgroundColor: '#A98FF3', marginTop: 8 }]} />
        <View style={[logoStyles.dot, { backgroundColor: '#D685AD' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b5ba7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoWrap: { marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 36,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: {
    fontSize: 13,
    color: '#ffffff',
  },
  subMessage: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
  },
});

const logoStyles = StyleSheet.create({
  shield: {
    width: 160,
    height: 160,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 16,
    // シールド風の影
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
});
