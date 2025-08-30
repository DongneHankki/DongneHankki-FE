import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getTokenFromLocal } from '../../../shared/utils/tokenUtil';

export interface Review {
  id: number;
  userId: number;
  nickname: string;
  content: string;
  scope: number;
  createdAt: string;
  userImage?: string;
}

export interface CreateReviewRequest {
  userId: number;
  content: string;
  scope: number;
}

export interface ReviewResponse {
  status: string;
  data: Review[];
  message?: string;
}

// 리뷰 목록 조회
export const getReviews = async (storeId: number): Promise<Review[]> => {
  try {
    const tokens = await getTokenFromLocal();
    const headers = tokens?.accessToken ? {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };

    console.log('리뷰 조회 요청:', {
      url: `${API_BASE_URL}/api/stores/${storeId}/reviews`,
      storeId,
      headers
    });

    const response = await axios.get(`${API_BASE_URL}/api/stores/${storeId}/reviews`, {
      headers,
      timeout: 10000,
    });

    console.log('리뷰 API 응답 전체:', JSON.stringify(response.data, null, 2));
    console.log('response.data 타입:', typeof response.data);
    console.log('response.data.data 타입:', typeof response.data.data);
    console.log('response.data.data 값:', response.data.data);
    console.log('response.data.data가 배열인가?', Array.isArray(response.data.data));
    if (Array.isArray(response.data.data)) {
      console.log('리뷰 데이터 길이:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('첫 번째 리뷰 데이터:', JSON.stringify(response.data.data[0], null, 2));
      }
    }

    if (response.data.status === 'success') {
      const reviewData = response.data.data;
      console.log('파싱된 리뷰 데이터:', reviewData);
      
      // 데이터가 배열인지 확인
      if (!Array.isArray(reviewData)) {
        console.error('리뷰 데이터가 배열이 아닙니다:', reviewData);
        return [];
      }
      
      return reviewData;
    } else {
      throw new Error(response.data.message || '리뷰 조회에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('리뷰 조회 오류 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 404) {
      throw new Error('가게 정보를 찾을 수 없습니다.');
    } else if (error.response?.status === 500) {
      throw new Error('서버 오류가 발생했습니다.');
    } else {
      throw new Error(`리뷰 조회 중 오류가 발생했습니다: ${error.message}`);
    }
  }
};

// 리뷰 작성
export const createReview = async (storeId: number, reviewData: CreateReviewRequest): Promise<Review> => {
  try {
    const tokens = await getTokenFromLocal();
    const headers = tokens?.accessToken ? {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };

    const response = await axios.post(`${API_BASE_URL}/api/stores/${storeId}/reviews`, reviewData, {
      headers,
      timeout: 10000,
    });

    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '리뷰 작성에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('리뷰 작성 오류:', error);
    throw new Error('리뷰 작성 중 오류가 발생했습니다.');
  }
};
