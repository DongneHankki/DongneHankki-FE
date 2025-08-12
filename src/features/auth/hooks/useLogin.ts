import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginAPI, LoginRequest } from '../services/LoginAPI';
import { saveTokens } from '../../../shared/utils/tokenUtil';
import { getRoleFromToken } from '../../../shared/utils/jwtUtil';

export function validateLogin(id: string, password: string): string | null {
  if (!id) return '아이디를 입력하세요.';
  if (!password) return '비밀번호를 입력하세요.';
  return null;
}

export const useLogin = (navigation: NativeStackNavigationProp<any>) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onLoginPress = async () => {
    const err = validateLogin(id, password);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        loginId: id,
        password,
      };
      
      const response = await loginAPI(loginData);
      
      if (response.status === 'success' && response.data) {
        
        await saveTokens(response.data.accessToken, response.data.refreshToken);
        
        const role = getRoleFromToken(response.data.accessToken);
        console.log('로그인 성공, role:', role);
        
        if (role === 'owner') {
          navigation.reset({ routes: [{ name: 'Owner' }] });
        } else {
          navigation.reset({ routes: [{ name: 'Customer' }] });
        }
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (e: any) {
      setError(e.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    id, setId,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    isLoading,
    onLoginPress,
  };
}; 