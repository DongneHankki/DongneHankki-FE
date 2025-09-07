import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import RegisterHeader from '../components/RegisterHeader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { common } from '../../../shared/styles/commonAuthStyles';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterComplete'>;

const RegisterComplete: React.FC<Props> = ({ route, navigation }) => {

  return (
    <ScrollView contentContainerStyle={common.container}>
        <View style={styles.headerContainer}>        
            <Text style={styles.title}>회원가입</Text>
        </View>
        <View style={common.contentWrapper}>
            <Text style={common.subtitle}>환영합니다!</Text>
            <TouchableOpacity style={common.brownButton} onPress={() => navigation.navigate('Login')}>
                <Text style={common.brownButtonText}>시작하기</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        color: '#111',
        width: '100%',
    },
});

export default RegisterComplete;
