import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    role?: 'owner' | 'consumer';
  };
  message?: string;
}

export const loginAPI = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    console.log('로그인 요청 시작:', { loginId: loginData.loginId });
    
    const response = await axios.post(`${API_BASE_URL}/api/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('로그인 성공:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(error.response.data.message || '가입되지 않은 id,pw 입니다');
    } else {
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
}; 