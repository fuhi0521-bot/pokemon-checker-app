/**
 * AdBanner
 *
 * featureFlags.ads の状態に応じて広告/プレースホルダ/非表示を切り替え。
 * 現状は実装プレースホルダのみ。本実装時に react-native-google-mobile-ads を組み込む。
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { featureFlags } from '@/src/config/featureFlags';

export function AdBanner() {
  if (featureFlags.ads) {
    // TODO: 本番広告SDKを呼び出す
    return null;
  }
  if (featureFlags.adsPlaceholder) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>広告枠 (現在オフ)</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 50,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderRadius: 4,
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
});
