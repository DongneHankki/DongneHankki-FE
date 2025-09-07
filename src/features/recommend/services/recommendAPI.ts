import api from '../../../shared/services/api';

// 추천 게시글 타입 정의
export interface RecommendImage {
  imageUrl: string;
  imageId: number;
  displayOrder: number;
}

export interface RecommendPost {
  postId: number;
  content: string;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  uploderRole: 'OWNER' | 'CUSTOMER';
  images: RecommendImage[];
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  liked: boolean;
}

export interface RecommendPostsResponse {
  values: RecommendPost[];
  nextCursor: number;
}

// 추천 게시글 조회 API
export const getRecommendPosts = async (
  size: number = 20,
  cursor?: number
): Promise<RecommendPostsResponse> => {
  try {
    console.log('getRecommendPosts 시작 - size:', size, 'cursor:', cursor);
    
    // 쿼리 파라미터 구성
    const params: any = { size };
    if (cursor !== undefined && cursor !== null) {
      params.cursor = cursor;
    }
    
    const response = await api.get('/api/posts/recommendPosts', { params });
    
    console.log('추천 게시글 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return {
        values: response.data.data.values || [],
        nextCursor: response.data.data.nextCursor || 0
      };
    } else {
      throw new Error(response.data.message || '추천 게시글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getRecommendPosts 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};
