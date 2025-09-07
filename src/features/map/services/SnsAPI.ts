import api from '../../../shared/services/api';

export interface SnsImage {
  imageUrl: string;
  imageId: number;
  displayOrder: number;
}

export interface SnsPost {
  postId: number;
  content: string;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  uploderRole: 'OWNER' | 'CUSTOMER';
  images: SnsImage[];
}

export interface SnsPostsResponse {
  data: {
    values: SnsPost[];
  };
}

/**
 * 특정 매장의 고객 SNS 포스트 목록을 가져옵니다.
 * @param storeId 매장 ID
 * @returns SNS 포스트 목록
 */
export const getStoreSnsPosts = async (storeId: number): Promise<SnsPostsResponse> => {
  try {
    console.log('=== SnsAPI.getStoreSnsPosts 호출 시작 ===');
    console.log('전달받은 storeId:', storeId);
    console.log('storeId 타입:', typeof storeId);
    
    const url = `/api/posts/store/${storeId}/customers`;
    const params = { size: 10 };
    console.log('요청 URL:', url);
    console.log('요청 파라미터:', params);
    console.log('API base URL:', api.defaults.baseURL);
    console.log('전체 요청 URL:', `${api.defaults.baseURL}${url}?size=10`);
    
    console.log('API 요청 전송 중...');
    const response = await api.get(url, { params });
    
    console.log('✅ SNS 포스트 API 응답 성공');
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('응답 데이터 타입:', typeof response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ SNS 포스트 API 호출 실패');
    console.error('에러 객체:', error);
    console.error('에러 메시지:', error?.message);
    console.error('에러 응답:', error?.response);
    
    if (error?.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      console.error('응답 헤더:', error.response.headers);
    } else if (error?.request) {
      console.error('요청 객체:', error.request);
    } else {
      console.error('에러 설정:', error?.config);
    }
    
    throw error;
  }
};