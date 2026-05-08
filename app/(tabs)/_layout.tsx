/**
 * 単一タブ構成（タブバー非表示）
 * 主要な遷移は app/index.tsx の Home メニューから Stack で行う。
 */

import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'ホーム' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
