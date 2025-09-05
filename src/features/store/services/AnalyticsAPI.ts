import api from '../../../shared/services/api';

export interface HourlyStats {
  hour: number;
  viewStoreCount: number;
  viewPostCount: number;
}

export interface WeeklyStats {
  dayOfWeek: string;
  hourlyStats: HourlyStats[];
}

export interface WeeklyHourlyStatsResponse {
  data: WeeklyStats[];
}

export const getWeeklyHourlyStats = async (storeId: number): Promise<WeeklyHourlyStatsResponse> => {
  try {
    console.log('주간 시간대별 통계 API 호출 시작');
    console.log('storeId:', storeId);
    console.log('API URL:', `/api/analytics/stores/1/weekly-hourly-stats`);
    
    const response = await api.get(`/api/analytics/stores/1/weekly-hourly-stats`, {
      timeout: 30000, // 30초 timeout
    });
    
    console.log('주간 시간대별 통계 API 응답 성공:', response.status);
    console.log('주간 시간대별 통계 응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('주간 시간대별 통계 API 에러 발생');
    console.error('storeId:', storeId);
    console.error('에러 메시지:', error.message);
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    
    throw error;
  }
};

export interface MarketingReportResponse {
  data: string;
}

export const getMarketingReport = async (storeId: number): Promise<MarketingReportResponse> => {
  try {
    console.log('마케팅 리포트 API 호출 시작');
    console.log('storeId:', storeId);
    console.log('API URL:', `/api/analytics/stores/1/marketing-report`);
    
    const response = await api.get(`/api/analytics/stores/1/marketing-report`, {
      timeout: 60000, // 60초 timeout (마케팅 리포트는 더 오래 걸릴 수 있음)
    });
    
    console.log('마케팅 리포트 API 응답 성공:', response.status);
    console.log('마케팅 리포트 응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('마케팅 리포트 API 에러 발생');
    console.error('storeId:', storeId);
    console.error('에러 메시지:', error.message);
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    
    throw error;
  }
};
