/**
 * TypeBadge: 18タイプの色付きバッジ
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { type PokemonType, TYPE_COLORS, TYPE_LABELS_JA } from '@/src/types/pokemon';

interface Props {
  type: PokemonType;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function TypeBadge({ type, selected, onPress, size = 'md', style }: Props) {
  const styleSize = size === 'sm' ? styles.sm : styles.md;
  const allStyles: ViewStyle[] = [
    styles.base,
    styleSize,
    { backgroundColor: TYPE_COLORS[type] },
    ...(selected ? [styles.selected] : []),
    ...(!selected && onPress ? [styles.unselected] : []),
    ...(style ? [style] : []),
  ];

  const inner = (
    <Text style={[styles.label, size === 'sm' && styles.labelSm]}>
      {TYPE_LABELS_JA[type]}
    </Text>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={allStyles}>
        {inner}
      </Pressable>
    );
  }
  return <View style={allStyles}>{inner}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 64,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 48,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  unselected: {
    opacity: 0.55,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  labelSm: {
    fontSize: 11,
  },
});
