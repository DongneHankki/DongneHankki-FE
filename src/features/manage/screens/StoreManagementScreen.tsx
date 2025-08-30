import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StoreManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>점포 관리</Text>
      <Text style={styles.subtitle}>점포 관리 기능이 여기에 구현됩니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default StoreManagementScreen;
