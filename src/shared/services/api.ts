import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getTokenFromLocal } from '../utils/tokenUtil';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터: 모든 요청에 자동으로 토큰 추가
api.interceptors.request.use(
  async (config) => {
    try {
      const tokenData = await getTokenFromLocal();
      
      if (tokenData?.accessToken) {
        config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 갱신
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokenData = await getTokenFromLocal();
        
        if (tokenData?.refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/refresh`, {
            refresh: tokenData.refreshToken
          });
          
          if (response.data?.data?.accessToken) {
            const newAccessToken = response.data.data.accessToken;
            
            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 