import api from '../../../../shared/services/api';
import { Post, Review, Profile, Recommendation, User, UserResponse, Store, StoreResponse, StorePost, StorePostsResponse } from '../types/feedTypes';

// User 정보 가져오기 API - map과 동일한 방식
export const getUserInfo = async (userId: number) => {
  try {
    console.log('getUserInfo 호출 - userId:', userId);
    console.log('API URL:', `/api/users/${userId}`);
    
    const response = await api.get(`/api/users/${userId}`);
    
    console.log('API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// Store 정보 가져오기 API - map과 동일한 방식
export const getStoreInfo = async (storeId: number) => {
  try {
    console.log('getStoreInfo 호출 - storeId:', storeId);
    console.log('API URL:', `/api/stores/${storeId}`);
    
    const response = await api.get(`/api/stores/${storeId}`);
    
    console.log('API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

// Profile 가져오기 - userId로 storeId를 가져와서 store 정보로 profile 생성
export const getProfile = async (userId: number): Promise<Profile> => {
  try {
    console.log('getProfile 시작 - userId:', userId);
    
    // 1. /api/users/{userId} 호출하여 storeId 가져오기
    const userResponse = await getUserInfo(userId);
    console.log('User API 응답:', userResponse);
    
    if (userResponse.status !== 'success') {
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    const user = userResponse.data;
    const storeId = user.storeId;
    console.log('가져온 storeId:', storeId);
    
    // 2. /api/stores/{storeId} 호출하여 store 정보 가져오기
    const storeResponse = await getStoreInfo(storeId);
    console.log('Store API 응답:', storeResponse);
    
    if (storeResponse.status !== 'success') {
      throw new Error('매장 정보를 가져오는데 실패했습니다.');
    }
    
    const store = storeResponse.data;
    
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
    const userResponse = await getUserInfo(userId);
    console.log('User API 응답:', userResponse);
    
    if (userResponse.status !== 'success') {
      throw new Error('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    const user = userResponse.data;
    const storeId = user.storeId;
    console.log('가져온 storeId:', storeId);
    
    // 2. /api/stores/{storeId} 호출하여 store 정보와 reviews 가져오기
    const storeResponse = await getStoreInfo(storeId);
    console.log('Store API 응답:', storeResponse);
    
    if (storeResponse.status !== 'success') {
      throw new Error('매장 정보를 가져오는데 실패했습니다.');
    }
    
    const store = storeResponse.data;
    
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

// Posts 가져오기
export const getPosts = async (): Promise<Post[]> => {
  try {
    console.log('getPosts 시작');
    
    // TODO: 실제 게시글 API가 준비되면 구현
    // const response = await api.get('/api/posts');
    // return response.data;
    
    console.log('게시글이 없음');
    return [];
    
  } catch (error: any) {
    console.error('getPosts 에러:', error);
    return [];
  }
};

// Store Posts 가져오기
export const getStorePosts = async (storeId: number): Promise<StorePost[]> => {
  try {
    console.log('getStorePosts 시작 - storeId:', storeId);
    
    // TODO: 실제 매장별 게시글 API가 준비되면 구현
    // const response = await api.get(`/api/stores/${storeId}/posts`);
    // return response.data;
    
    console.log('매장 게시글이 없음');
    return [];
    
  } catch (error: any) {
    console.error('getStorePosts 에러:', error);
    return [];
  }
};

// Recommendation 가져오기
export const getRecommendation = async (): Promise<Recommendation | null> => {
  try {
    console.log('getRecommendation 시작');
    
    // TODO: 실제 추천 API가 준비되면 구현
    // const response = await api.get('/api/recommendations');
    // return response.data;
    
    console.log('추천이 없음');
    return null;
    
  } catch (error: any) {
    console.error('getRecommendation 에러:', error);
    return null;
  }
};

// Recommendation 숨기기
export const hideRecommendation = async (): Promise<void> => {
  try {
    console.log('hideRecommendation 시작');
    
    // TODO: 실제 추천 숨기기 API가 준비되면 구현
    // await api.post('/api/recommendations/hide');
    
    console.log('추천 숨기기 완료');
  } catch (error: any) {
    console.error('hideRecommendation 에러:', error);
    throw error;
  }
};
 