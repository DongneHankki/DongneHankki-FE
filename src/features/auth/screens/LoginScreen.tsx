import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { useLogin } from '../hooks/useLogin';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const {
    id, setId,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    isLoading,
    onLoginPress,
  } = useLogin(navigation);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인 후{"\n"}지역 경제를{"\n"}살려보세요!</Text>
      <Text style={styles.subtitle}>아이디와 비밀번호를 입력해주세요</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.idInput}
          placeholder="아이디"
          value={id}
          onChangeText={setId}
          placeholderTextColor="#BDBDBD"
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.pwdInput}
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#BDBDBD"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
            <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.forgotText}>아이디/비밀번호를 잊으셨나요?</Text>
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={onLoginPress}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.divider}></View>
        <Text style={styles.signupText}>아직 회원이 아니신가요?</Text>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('StartRegister')}
        >
          <Text style={styles.signupButtonText}>회원가입 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  TextInput: {
    backgroundColor: '#EDEDED',
  },
  title: {
    color: '#2E1404',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  subtitle: {
    color: '#2E1404',
    fontSize: 14,
    textAlign: 'left',
    marginVertical: 10,
  },
  formContainer: {
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  idInput: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    width: '100%',
    marginBottom: 15,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  pwdInput: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    padding: 14,
    paddingRight: 44,
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: 9,
  },
  loginButton: {
    backgroundColor: '#2E1404',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  forgotText: {
    color: '#2E1404',
    fontSize: 14,
    textAlign: 'right',
    margin: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  signupButton: {
    backgroundColor: '#F3C35B',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#2E1404',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#fff',
    margin: 15,
    width: '90%',
  },
  signupText: {
    color: '#2E1404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  }
});

export default LoginScreen; 