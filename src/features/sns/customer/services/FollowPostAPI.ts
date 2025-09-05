import api from '../../../../shared/services/api';

// 팔로우 게시글 타입 정의
export interface FollowImage {
  imageUrl: string;
  imageId: number;
  displayOrder: number;
}

export interface FollowPost {
  postId: number;
  content: string;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  uploderRole: 'OWNER' | 'CUSTOMER';
  images: FollowImage[];
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  liked: boolean;
}

export interface FollowPostsResponse {
  values: FollowPost[];
  nextCursor: number;
}

// 팔로우한 게시글 조회 API
export const getFollowedPosts = async (
  size: number = 10,
  cursor?: number
): Promise<FollowPostsResponse> => {
  try {
    console.log('getFollowedPosts 시작 - size:', size, 'cursor:', cursor);
    
    // 쿼리 파라미터 구성
    const params: any = { size };
    if (cursor !== undefined && cursor !== null) {
      params.cursor = cursor;
    }
    
    const response = await api.get('/api/posts/followed', { params });
    
    console.log('팔로우 게시글 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return {
        values: response.data.data.values || [],
        nextCursor: response.data.data.nextCursor || 0
      };
    } else {
      throw new Error(response.data.message || '팔로우 게시글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getFollowedPosts 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};
