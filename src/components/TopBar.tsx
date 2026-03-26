import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title?: string;
};

export default function TopBar({ title = 'Top Bar' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#2a168c' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
});