/**
 * CreatureAvatar
 *
 * 公式アートワーク（任天堂・ポケモンの著作物）を一切使わず、
 * タイプ色のバイカラー円アバターでポケモンを視覚化する。
 *
 * - 1タイプ: 単色円
 * - 2タイプ: 左右半分色分け
 * - 中央に頭文字（日本語名 or 英語名の先頭）を表示
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type PokemonType, TYPE_COLORS } from '@/src/types/pokemon';

interface Props {
  types: PokemonType[];
  /** 中央に表示する文字（通常は日本語名の先頭1文字） */
  label: string;
  size?: number;
}

export function CreatureAvatar({ types, label, size = 56 }: Props) {
  const t1 = types[0] ?? 'normal';
  const t2 = types[1];

  const halfWidth = size / 2;
  const radius = size / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: TYPE_COLORS[t1],
        },
      ]}
    >
      {t2 && (
        <View
          style={[
            styles.rightHalf,
            {
              width: halfWidth,
              height: size,
              backgroundColor: TYPE_COLORS[t2],
            },
          ]}
        />
      )}
      <Text style={[styles.label, { fontSize: size * 0.42, lineHeight: size }]}>
        {label.slice(0, 1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHalf: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
