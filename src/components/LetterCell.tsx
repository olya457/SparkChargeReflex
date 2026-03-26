import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  value?: string;
};

export default function LetterCell({ value = 'A' }: Props) {
  return (
    <View style={styles.cell}>
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#7ae3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#1b1361',
    fontWeight: '700',
    fontSize: 18,
  },
});