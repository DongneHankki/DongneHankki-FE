import api from '../../../../shared/services/api';
import { Post, Review, Profile, Recommendation, StorePost, StorePostsResponse, StoreOwnerPostsResponse, StoreCustomerPostsResponse, Comment } from '../types/feedTypes';



// Profile 가져오기 - userId로 storeId를 가져와서 store 정보로 profile 생성
export const getProfile = async (userId: number): Promise<Profile> => {
  try {
    console.log('getProfile 시작 - userId:', userId);
    
    // 1. /api/users/{userId} 호출하여 storeId 가져오기
    const userResponse = await api.get(`/api/users/${userId}`);
    console.log('User API 응답:', userResponse.data);
    
    if (userResponse.data.status !== 'success') {
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    const user = userResponse.data.data;
    const storeId = user.storeId;
    console.log('가져온 storeId:', storeId);
    
    // 2. /api/stores/{storeId} 호출하여 store 정보 가져오기
    const storeResponse = await api.get(`/api/stores/${storeId}`);
    console.log('Store API 응답:', storeResponse.data);
    
    if (storeResponse.data.status !== 'success') {
      throw new Error('매장 정보를 가져오는데 실패했습니다.');
    }
    
    const store = storeResponse.data.data;
    
    // 3. Profile 객체 생성
    const profile: Profile = {
      restaurantName: store.name,
      address: store.address,
      rating: store.avgStar || 0,
      reviewCount: store.reviews?.length || 0,
      image: require('../../../../shared/images/profile.png'),
      storeId: storeId,
    };
    
    console.log('생성된 Profile:', profile);
    return profile;
    
  } catch (error: any) {
    console.error('getProfile 에러:', error);
    // 에러 시 기본 프로필 반환
    return {
      restaurantName: '매장명',
      address: '주소 정보 없음',
      rating: 0,
      reviewCount: 0,
      image: require('../../../../shared/images/profile.png'),
      storeId: 1,
    };
  }
};

// Reviews 가져오기 - userId로 storeId를 가져와서 store의 reviews 사용
export const getReviews = async (userId: number): Promise<Review[]> => {
  try {
    console.log('getReviews 시작 - userId:', userId);
    
    // 1. /api/users/{userId} 호출하여 storeId 가져오기
    const userResponse = await api.get(`/api/users/${userId}`);
    console.log('User API 응답:', userResponse.data);
    
    if (userResponse.data.status !== 'success') {
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    const user = userResponse.data.data;
    const storeId = user.storeId;
    console.log('가져온 storeId:', storeId);
    
    // 2. /api/stores/{storeId} 호출하여 store 정보와 reviews 가져오기
    const storeResponse = await api.get(`/api/stores/${storeId}`);
    console.log('Store API 응답:', storeResponse.data);
    
    if (storeResponse.data.status !== 'success') {
      throw new Error('매장 정보를 가져오는데 실패했습니다.');
    }
    
    const store = storeResponse.data.data;
    
    // 3. Store의 reviews를 Review 타입으로 변환
    if (store.reviews && store.reviews.length > 0) {
      const reviews = store.reviews.map((review: any, index: number) => ({
        id: review.id || index + 1,
        rating: review.rating || 5,
        content: review.content || '리뷰 내용',
        userName: review.customerName || review.author || '고객',
        createdAt: review.createdAt || new Date().toISOString(),
      }));
      
      console.log('변환된 Reviews:', reviews);
      return reviews;
    }
    
    console.log('리뷰가 없음');
    return [];
    
  } catch (error: any) {
    console.error('getReviews 에러:', error);
    return [];
  }
};



// 가게별 사장님 게시글 조회 API
export const getStoreOwnerPosts = async (
  storeId: number,
  cursorPostId?: number | null,
  size: number = 10
): Promise<{
  values: Post[];
  nextCursor: number | null;
}> => {
  try {
    console.log('getStoreOwnerPosts 시작 - storeId:', storeId, 'cursorPostId:', cursorPostId, 'size:', size);
    
    // 쿼리 파라미터 구성
    const params: any = { size };
    if (cursorPostId !== null && cursorPostId !== undefined) {
      params.cursorPostId = cursorPostId;
    }
    
    const response = await api.get(`/api/posts/store/${storeId}/owners`, { params });
    
    console.log('가게별 사장님 게시글 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return {
        values: response.data.data.values || [],
        nextCursor: response.data.data.nextCursor || null
      };
    } else {
      throw new Error(response.data.message || '게시글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getStoreOwnerPosts 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 가게별 일반 유저 게시글 조회 API
export const getStoreCustomerPosts = async (
  storeId: number,
  cursorPostId?: number | null,
  size: number = 10
): Promise<{
  values: Post[];
  nextCursor: number | null;
}> => {
  try {
    console.log('getStoreCustomerPosts 시작 - storeId:', storeId, 'cursorPostId:', cursorPostId, 'size:', size);
    
    // 쿼리 파라미터 구성
    const params: any = { size };
    if (cursorPostId !== null && cursorPostId !== undefined) {
      params.cursorPostId = cursorPostId;
    }
    
    const response = await api.get(`/api/posts/store/${storeId}/customers`, { params });
    
    console.log('가게별 일반 유저 게시글 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return {
        values: response.data.data.values || [],
        nextCursor: response.data.data.nextCursor || null
      };
    } else {
      throw new Error(response.data.message || '게시글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getStoreCustomerPosts 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 게시글 단건 조회 API
export const getPostDetail = async (postId: number): Promise<Post> => {
  try {
    console.log('getPostDetail 시작 - postId:', postId);
    
    const response = await api.get(`/api/posts/${postId}`);
    
    console.log('게시글 단건 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '게시글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getPostDetail 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 댓글 조회 API
export const getPostComments = async (postId: number): Promise<Comment[]> => {
  try {
    console.log('getPostComments 시작 - postId:', postId);
    
    const response = await api.get(`/api/posts/${postId}/comments`);
    
    console.log('댓글 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status === 'success') {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || '댓글 조회에 실패했습니다.');
    }
    
  } catch (error: any) {
    console.error('getPostComments 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 게시글 수정 API
export const updatePost = async (postId: number, data: {
  content: string;
  hashtags: string[];
  deleteImageIds?: number[];
}) => {
  try {
    const response = await api.patch(`/api/posts/${postId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('게시글 수정 에러:', error);
    throw error;
  }
};

// 게시글 삭제 API
export const deletePost = async (postId: number) => {
  try {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    console.error('게시글 삭제 에러:', error);
    throw error;
  }
};

// 댓글 작성 API
export const createComment = async (postId: number, content: string) => {
  try {
    console.log('댓글 작성 시작 - postId:', postId, 'content:', content);
    
    const response = await api.post(`/api/posts/${postId}/comments`, {
      content: content.trim()
    });
    
    console.log('댓글 작성 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('댓글 작성 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 댓글 수정 API
export const updateComment = async (commentId: number, content: string) => {
  try {
    console.log('댓글 수정 시작 - commentId:', commentId, 'content:', content);
    
    const response = await api.patch(`/api/comments/${commentId}`, {
      content: content.trim()
    });
    
    console.log('댓글 수정 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('댓글 수정 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 댓글 삭제 API
export const deleteComment = async (commentId: number) => {
  try {
    console.log('댓글 삭제 시작 - commentId:', commentId);
    
    const response = await api.delete(`/api/comments/${commentId}`);
    
    console.log('댓글 삭제 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('댓글 삭제 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 게시글 좋아요 API
export const addPostLike = async (postId: number) => {
  try {
    console.log('게시글 좋아요 시작 - postId:', postId);
    
    const response = await api.post(`/api/posts/${postId}/likes`);
    
    console.log('게시글 좋아요 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('게시글 좋아요 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 게시글 좋아요 취소 API
export const removePostLike = async (postId: number) => {
  try {
    console.log('게시글 좋아요 취소 시작 - postId:', postId);
    
    const response = await api.delete(`/api/posts/${postId}/likes`);
    
    console.log('게시글 좋아요 취소 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('게시글 좋아요 취소 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// 게시글 좋아요 상태 조회 API
export const getPostLikeStatus = async (postId: number) => {
  try {
    console.log('게시글 좋아요 상태 조회 시작 - postId:', postId);
    
    const response = await api.get(`/api/posts/${postId}/like-status`);
    
    console.log('게시글 좋아요 상태 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('게시글 좋아요 상태 조회 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};
