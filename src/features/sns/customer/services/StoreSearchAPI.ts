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
      const stores = Array.isArray(data) ? data : [data];
      
      // 원본 데이터 상세 로그
      console.log('=== 원본 API 응답 데이터 ===');
      stores.forEach((store, index) => {
        console.log(`가게 ${index + 1}:`, {
          storeId: store.storeId,
          name: store.name,
          address: store.address
        });
      });
      
      // 중복 제거 (storeId 기준) - Map을 사용한 더 강력한 방법
      const storeMap = new Map();
      stores.forEach(store => {
        if (!storeMap.has(store.storeId)) {
          storeMap.set(store.storeId, store);
        } else {
          console.log(`중복 발견! storeId: ${store.storeId}, name: ${store.name}`);
        }
      });
      const uniqueStores = Array.from(storeMap.values());
      
      console.log('=== 중복 제거 결과 ===');
      console.log('원본 가게 수:', stores.length);
      console.log('중복 제거 후 가게 수:', uniqueStores.length);
      uniqueStores.forEach((store, index) => {
        console.log(`최종 가게 ${index + 1}:`, {
          storeId: store.storeId,
          name: store.name,
          address: store.address
        });
      });
      
      return uniqueStores;
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
