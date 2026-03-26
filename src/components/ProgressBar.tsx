import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  progress?: number;
};

export default function ProgressBar({ progress = 0.3 }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 10,
    backgroundColor: '#4939a0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#ffd400',
  },
});