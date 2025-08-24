import { useState } from 'react';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTokens } from '../../../shared/utils/tokenUtil';

export function validateLogin(id: string, password: string): string | null {
  if (!id) return '아이디를 입력하세요.';
  if (!password) return '비밀번호를 입력하세요.';
  return null;
}

export const useLoginForm = (navigation: NativeStackNavigationProp<any>) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onLoginPress = async () => {
    const err = validateLogin(id, password);
    if (err) {
      setError(err);
      return;
    }
    setError('');

    try {
      await getTokens(id, password);
      navigation.navigate('Owner', { screen: 'PostCreate' });
    } catch (e: any) {
      setError(e.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return {
    id, setId,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    onLoginPress,
  };
};


export const checkIdDuplicate = async (id: string): Promise<boolean> => {
  try {
    console.log("dupcheck", id);
    const res = await axios.get(`${API_BASE_URL}/users/check/loginId`, {
      params: { loginId: id }
    });
    console.log('아이디 중복 확인 응답:', res.data);

    return res.data.data === false;
  } catch (e: unknown) {
    return false;
  }
};

export const checkNicknameDuplicate = async (nickname: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/users/check/nickname`, {
      params: { nickname }
    });
    console.log('닉네임 중복 확인 응답:', res.data);

    return res.data.data === false;
  } catch (e) {
    return false;
  }
};

// 아이디 형식 검사 (영문, 숫자 조합)
export function validateIdFormat(id: string): string | null {
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(id)) {
    return '아이디는 영문과 숫자를 모두 포함해야 합니다.';
  }
  return null;
}

// 비밀번호 형식 검사 (영문, 숫자 조합 8-16자)
export function validatePasswordFormat(password: string): string | null {
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(password)) {
    return '비밀번호는 영문, 숫자 조합 8-16자여야 합니다.';
  }
  return null;
}

// 비밀번호 재확인 검사
export function validatePasswordCheck(password: string, passwordCheck: string): string | null {
  if (password !== passwordCheck) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return null;
} 