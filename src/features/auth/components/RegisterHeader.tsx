import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RegisterHeaderProps = {
  title: string;
  step: number;
  onBack?: () => void;
};

const RegisterHeader: React.FC<RegisterHeaderProps> = ({ title, step, onBack }) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerRow}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }} />
      {step > 0 && <Text style={styles.stepText}>{step}/4</Text>}
    </View>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
  },
  backButton: {},
  stepText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#111',
    width: '100%',
  },
});

export default RegisterHeader;
