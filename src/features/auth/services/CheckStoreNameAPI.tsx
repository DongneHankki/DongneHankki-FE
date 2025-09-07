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

export interface StoreNameResponse {
  status: string;
  code: string;
  message: string;
  data: StoreData;
}

// 여러 가게 검색 API (5개 이하)
export const searchStores = async (query: string): Promise<StoreData[]> => {
  try {
    console.log('가게 검색 시작 - query:', query);
    
    const response = await axios.get(`${API_BASE_URL}/api/stores/search`, {
      params: { name: query },
    });

    if (response.data.status === 'success') {
      console.log('가게 검색 성공:', response.data.data);
      // API가 배열을 반환하는지 확인
      const data = response.data.data;
      return Array.isArray(data) ? data : [data];
    } else {
      throw new Error(response.data.message || '가게 검색에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('가게 검색 실패:', error);
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
};