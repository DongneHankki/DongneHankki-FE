import api from '../../../shared/services/api';
import { useNavigation } from '@react-navigation/native';

export const getMapData = async (
  latitude: number, 
  longitude: number, 
  zoomLevel: number, 
  industryCode?: number | null, 
  keyword?: string,
  filters?: {
    scope?: number;
    days?: string;
    startAt?: string;
    endAt?: string;
  }
) => {
  try {
    console.log('API 호출 시작 - URL:', `/api/maps`);
    console.log('요청 파라미터:', { latitude, longitude, zoomLevel, industryCode, keyword, filters });
    
    const params: any = {
      latitude,
      longitude,
      zoomLevel
    };
    
    if (industryCode !== undefined && industryCode !== null) {
      params.industryCode = industryCode;
    }
    
    if (keyword && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    // 필터 파라미터 추가
    if (filters) {
      if (filters.scope !== undefined) {
        params.scope = filters.scope;
      }
      if (filters.days !== undefined) {
        params.days = filters.days;
      }
      if (filters.startAt !== undefined) {
        params.startAt = filters.startAt;
      }
      if (filters.endAt !== undefined) {
        params.endAt = filters.endAt;
      }
    }
    
    const response = await api.get('/api/maps', {
      params,
    });
    
    console.log('API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    
    // 401 에러인 경우 LoginScreen으로 네비게이션
    if (error.response?.status === 401) {
    }
    
    throw error;
  }
};

