import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function AppBackground() {
  return <View style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#14005a',
  },
});