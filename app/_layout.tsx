/**
 * ルートレイアウト
 *
 * - 各画面のヘッダー色・文字色をここで一括指定
 * - ダーク/ライトモードの切り替え (ThemeProvider)
 * - 起動時のスプラッシュ + インアプリローディングを管理
 *   1. ネイティブスプラッシュ (expo-splash-screen) は app.json で設定
 *   2. ポケモンインデックスのプリロードが終わるまで AppLoadingScreen を表示
 *   3. 完了したら通常の Stack ナビゲーションに切り替え
 */

import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadPokemonIndex } from '@/src/data/pokemonIndex';
import { AppLoadingScreen } from '@/src/components/AppLoadingScreen';

// ネイティブスプラッシュを手動制御するため、自動消去を無効化
SplashScreen.preventAutoHideAsync().catch(() => {
  // セッション中に複数回呼ばれてもエラーで止めない
});

// 全画面共通のヘッダースタイル
//
// 戻るボタンのテキスト非表示について:
//   React Navigation v7 (Expo SDK 54) では旧 headerBackTitleVisible は廃止されており、
//   以下の2つを併用する必要がある:
//     - headerBackTitle: ''               → 戻るボタンの文字を空に
//     - headerBackButtonDisplayMode: 'minimal' → iOSの戻るボタンを ← アイコンのみに
const SHARED_HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#3b5ba7' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
  headerBackTitle: '',
  headerBackButtonDisplayMode: 'minimal' as const,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [loadStatus, setLoadStatus] = useState('データを読み込み中...');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ネイティブスプラッシュを少し見せてから消す（一瞬で消えると違和感あるため）
        await new Promise((r) => setTimeout(r, 200));
        await SplashScreen.hideAsync().catch(() => {});

        setLoadStatus('ポケモン図鑑を取得中...');
        await loadPokemonIndex();

        if (!cancelled) {
          setLoadStatus('準備完了');
          setReady(true);
        }
      } catch (e) {
        // データ取得失敗してもアプリは続行（ローカルextrasのみで動作）
        console.warn('[RootLayout] 初期化エラー:', e);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <AppLoadingScreen message={loadStatus} subMessage="初回はAPIから取得するため少し時間がかかります" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={SHARED_HEADER_OPTIONS}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="type-checker"     options={{ title: 'タイプ確認' }} />
        <Stack.Screen name="stats-calculator" options={{ title: 'ステータス計算' }} />
        <Stack.Screen name="speed-ranking"    options={{ title: '素早さランキング' }} />
        <Stack.Screen name="damage-calc"      options={{ title: 'ダメージ計算' }} />
        <Stack.Screen name="team-balance"     options={{ title: 'タイプバランス' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
