import axios from 'axios';
import { API_BASE_URL } from '@env';

// 인증 코드 전송 API
export const sendAuthCode = async (receiverNumber: string): Promise<{
  status: string;
  code: string;
  message: string;
  data: any;
}> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/sendAuthCode`, null, {
      params: { receiverNumber }
    });
    
    console.log('인증 코드 전송 응답:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('인증 코드 전송 실패:', error);
    throw new Error(error.response?.data?.message || '인증 코드 전송에 실패했습니다.');
  }
};

// 인증 코드 확인 API
export const checkAuthCode = async (receiverNumber: string, authCode: string): Promise<{
  status: string;
  code: string;
  message: string;
  data: string;
}> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/checkAuthCode`, {
      params: { receiverNumber, authCode }
    });
    
    console.log('인증 코드 확인 응답:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('인증 코드 확인 실패:', error);
    throw new Error(error.response?.data?.message || '인증 코드 확인에 실패했습니다.');
  }
};

