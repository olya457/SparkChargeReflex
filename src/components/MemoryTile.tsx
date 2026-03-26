import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  label?: string;
  onPress?: () => void;
};

export default function MemoryTile({ label = '?', onPress }: Props) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2d1899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});