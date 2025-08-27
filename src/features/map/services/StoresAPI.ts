import api from '../../../shared/services/api';

export const getMapData = async (latitude: number, longitude: number, zoomLevel: number, industryCode?: number | null) => {
  try {
    console.log('API 호출 시작 - URL:', `/api/stores`);
    console.log('요청 파라미터:', { latitude, longitude, zoomLevel, industryCode });
    
    const params: any = {
      latitude,
      longitude,
      zoomLevel
    };
    
    if (industryCode !== undefined && industryCode !== null) {
      params.industryCode = industryCode;
    }
    
    const response = await api.get('/api/stores', {
      params,
    });
    
    console.log('API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    
    // 401 에러인 경우 로그 추가
    if (error.response?.status === 401) {
      console.log('StoresAPI에서 401 에러 발생');
    }
    
    throw error;
  }
};

