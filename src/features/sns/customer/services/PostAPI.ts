import {API_BASE_URL} from '@env';
import axios from 'axios';

export interface CreatePostRequest {
  storeId: number;
  content: string;
  images: string[];
  hashtags: string[];
}

export interface CreatePostResponse {
  status: string;
  message: string;
  data?: any;
}

export const createCustomerPost = async (postData: CreatePostRequest, accessToken?: string): Promise<CreatePostResponse> => {
  try {
    console.log('=== 고객 게시글 작성 API 호출 시작 ===');
    
    // 데이터 검증 및 로깅
    console.log('요청 데이터 상세:');
    console.log('- storeId:', postData.storeId, '(타입:', typeof postData.storeId, ')');
    console.log('- content:', postData.content, '(타입:', typeof postData.content, ')');
    console.log('- images:', postData.images, '(타입:', typeof postData.images, ', 길이:', postData.images?.length, ')');
    console.log('- hashtags:', postData.hashtags, '(타입:', typeof postData.hashtags, ', 길이:', postData.hashtags?.length, ')');
    console.log('- accessToken:', accessToken ? '있음' : '없음');
    
    // 데이터 타입 검증
    if (typeof postData.storeId !== 'number') {
      throw new Error(`storeId는 number 타입이어야 합니다. 현재: ${typeof postData.storeId}`);
    }
    if (typeof postData.content !== 'string') {
      throw new Error(`content는 string 타입이어야 합니다. 현재: ${typeof postData.content}`);
    }
    if (!Array.isArray(postData.images)) {
      throw new Error(`images는 array 타입이어야 합니다. 현재: ${typeof postData.images}`);
    }
    if (!Array.isArray(postData.hashtags)) {
      throw new Error(`hashtags는 array 타입이어야 합니다. 현재: ${typeof postData.hashtags}`);
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    };
    
    console.log('요청 헤더:', headers);
    console.log('요청 URL:', `${API_BASE_URL}/posts/customers`);
    
    const response = await axios.post(`${API_BASE_URL}/posts/customers`, postData, {
      headers,
    });
    
    console.log('고객 게시글 작성 API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('=== 고객 게시글 작성 API 에러 발생 ===');
    console.error('에러 메시지:', error.message);
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    console.error('요청 데이터:', JSON.stringify(postData, null, 2));
    
    throw error;
  }
};
