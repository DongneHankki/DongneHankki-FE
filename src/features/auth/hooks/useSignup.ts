import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signupAPI, SignupRequest } from '../services/SignupAPI';
import { useAuthStore } from '../../../shared/store/authStore';

export interface SignupFormData {
  id: string;
  password: string;
  name: string;
  phone: string;
  userType: 'owner' | 'consumer';
  nickname?: string;
  address?: string;
  addressDetail?: string;
  storeName?: string;
  birth: string;
}

export function validateSignup(data: SignupFormData): string | null {
  if (!data.id) return '아이디를 입력하세요.';
  if (!data.password) return '비밀번호를 입력하세요.';
  if (!data.name) return '이름을 입력하세요.';
  if (!data.phone) return '전화번호를 입력하세요.';
  if (data.userType === 'consumer' && !data.nickname) return '닉네임을 입력하세요.';
  if (!data.birth) return '생년월일을 입력하세요.';
  if (data.userType === 'owner' && !data.storeName) return '가게명을 입력하세요.';
  return null;
}

export const useSignup = (navigation: NativeStackNavigationProp<any>) => {
  const { setUserInfo } = useAuthStore();
  const [formData, setFormData] = useState<SignupFormData>({
    id: '',
    password: '',
    name: '',
    phone: '',
    userType: 'consumer',
    nickname: '',
    address: '',
    addressDetail: '',
    storeName: '',
    birth: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSignupPress = async () => {
    const err = validateSignup(formData);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const signupData: SignupRequest = {
        loginId: formData.id,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phone,
        birth: formData.birth,
        ...(formData.userType === 'consumer' && { nickname: formData.nickname || '' }), // consumer인 경우에만 nickname 추가
        ...(formData.userType === 'owner' && { storeId: 1 }), // owner인 경우 storeId 추가
      };

      const response = await signupAPI(signupData, formData.userType);
      
      if (response.status === 'success') {
        // 회원가입 성공 시 전역 상태에 사용자 정보 저장
        setUserInfo({
          role: formData.userType === 'owner' ? 'owner' : 'customer',
          userId: response.data?.userId || formData.id,
          loginId: formData.id,
        });
        
        navigation.navigate('RegisterComplete');
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (e: any) {
      setError(e.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    error,
    isLoading,
    onSignupPress,
  };
}; 