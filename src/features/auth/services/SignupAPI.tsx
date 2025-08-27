import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface SignupRequest {
  loginId: string;
  password: string;
  name: string;
  nickname?: string; //customer인 경우에만
  phoneNumber: string;
  storeId?: number; // owner인 경우에만
  birth: string;
}

export interface SignupResponse {
  status: string;
  data?: any;
  message?: string;
}

export const signupAPI = async (
  signupData: SignupRequest, 
  userType: 'owner' | 'consumer'
): Promise<SignupResponse> => {
  try {
    let url = '';
    
    if (userType === 'owner') {
      url = `${API_BASE_URL}/api/owners`;
    } else {
      url = `${API_BASE_URL}/api/customers`;
    }

    const response = await axios.post(url, signupData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || '회원가입에 실패했습니다.');
    } else if (error.response?.status === 409) {
      throw new Error('이미 존재하는 아이디입니다.');
    } else {
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
}; 