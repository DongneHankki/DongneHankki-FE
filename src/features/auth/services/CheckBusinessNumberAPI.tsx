import axios from 'axios';
import { API_BASE_URL } from '@env';

export interface StoreData {
  storeId: number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  sigun: string;
  address: string;
  industryCode: number;
  businessRegistrationNumber: number;
  avgStar: number;
  operatingHours: Array<{
    dayOfWeek: string;
    openTime: {
      hour: number;
      minute: number;
      second: number;
      nano: number;
    };
    closeTime: {
      hour: number;
      minute: number;
      second: number;
      nano: number;
    };
  }>;
  owner: {
    userId: number;
    loginId: string;
    nickname: string;
    name: string;
    phoneNumber: string;
    role: string;
    storeId: number;
  };
  menus: Array<any>;
  reviews: Array<any>;
}

export interface BusinessNumberResponse {
  status: string;
  code: string;
  message: string;
  data: StoreData;
}

export const checkBusinessNumber = async (businessNumber: string): Promise<StoreData> => {
  try {
    // 사업자 등록번호에서 하이픈 제거
    const cleanBusinessNumber = businessNumber.replace(/-/g, '');
    
    const response = await axios.get(`${API_BASE_URL}/api/stores?businessNumber=${cleanBusinessNumber}`, {
      timeout: 10000,
    });

    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '사업자 등록번호 확인에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('등록되지 않은 사업자 등록번호입니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 사업자 등록번호 형식입니다.');
    } else {
      throw new Error('사업자 등록번호 확인 중 오류가 발생했습니다.');
    }
  }
};