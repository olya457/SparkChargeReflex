import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BottomBar() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#2a168c',
    borderTopWidth: 1,
    borderTopColor: '#4d3cb3',
  },
});