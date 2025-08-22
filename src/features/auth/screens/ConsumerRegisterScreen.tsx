import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import RegisterHeader from '../components/RegisterHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { checkNicknameDuplicate } from '../services/CheckNicknameAPI';
import { common } from '../../../shared/styles/commonAuthStyles';

interface ConsumerRegisterProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ConsumerRegister'>;
}

const ConsumerRegisterScreen: React.FC<ConsumerRegisterProps> = ({ navigation }) => {
  const route = useRoute<RouteProp<AuthStackParamList, 'ConsumerRegister'>>();
  const { id, password, name, phone, userType } = route.params;
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const handleCheckNickname = async () => {
    if (!nickname) {
      setNicknameCheckMsg('닉네임을 입력하세요.');
      setNicknameChecked(false);
      return;
    }
    const isDuplicate = await checkNicknameDuplicate(nickname);
    if (isDuplicate) {
      setNicknameCheckMsg('이미 사용 중인 닉네임입니다.');
      setNicknameChecked(false);
    } else {
      setNicknameCheckMsg('사용 가능한 닉네임입니다.');
      setNicknameChecked(true);
    }
  };

  const onNext = () => {
    let valid = true;
    if (!nickname) {
      setNicknameError('닉네임을 입력하세요.');
      valid = false;
    } else if (!nicknameChecked) {
      setNicknameError('닉네임 중복확인을 해주세요.');
      valid = false;
    } else {
      setNicknameError('');
    }
    if (valid) {
      navigation.navigate('RegisterTerms', {
        id,
        password,
        name,
        phone,
        userType,
        nickname
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={common.container}>
      <RegisterHeader title="회원가입" step={3} onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>닉네임을{"\n"}기입해주세요!</Text>

      <View style={styles.formWrapper}>
        <Text style={common.label}>닉네임 <Text style={common.star}>*</Text></Text>
        <View style={common.row}>
          <TextInput
            style={[common.input, { flex: 1 }]}
            value={nickname}
            onChangeText={text => {
              setNickname(text);
              setNicknameChecked(false);
              setNicknameCheckMsg('');
              setNicknameError('');
            }}
          />
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckNickname}>
            <Text style={styles.checkButtonText}>중복확인</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.errorMsg}>{nicknameCheckMsg || nicknameError}</Text>
        <TouchableOpacity style={common.brownButton} onPress={onNext}>
          <Text style={common.brownButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 30,
    color: '#222',
    textAlign: 'center',
    marginVertical: 70,
    fontWeight: '400'
  },
  formWrapper: {
    paddingHorizontal: 24,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 1,
    height: 30,
  },
  checkButton: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  checkButtonText: {
    color: '#2E1404',
    fontWeight: 'bold',
  },
  errorMsg: {
    fontSize: 14,
    color: '#2E1404',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
});

export default ConsumerRegisterScreen;
