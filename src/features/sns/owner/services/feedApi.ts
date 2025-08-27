import api from '../../../../shared/services/api';
import { Post, Review, Profile, Recommendation, User, UserResponse, Store, StoreResponse } from '../types/feedTypes';

// Mock 데이터
const mockPosts: Post[] = [
  {
    id: 1,
    content: '오늘은 정말 바빴어요! 손님들이 많이 와서 즐거웠습니다.',
    image: 'https://via.placeholder.com/300x200',
    likes: 15,
    comments: 3,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    content: '새로운 메뉴를 준비했어요. 곧 공개할 예정입니다!',
    image: 'https://via.placeholder.com/300x200',
    likes: 23,
    comments: 7,
    createdAt: '2024-01-14T15:30:00Z',
  },
];

const mockReviews: Review[] = [
  {
    id: 1,
    userName: '김철수',
    rating: 5,
    content: '정말 맛있어요! 서비스도 친절하고 분위기도 좋았습니다.',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    userName: '이영희',
    rating: 4,
    content: '음식이 맛있고 가격도 합리적이에요. 다음에 또 올게요!',
    createdAt: '2024-01-14T18:00:00Z',
  },
];

const mockProfile: Profile = {
  restaurantName: '메가엠지씨커피',
  address: '서울시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  rating: 4.5,
  reviewCount: 128,
  image: 'https://via.placeholder.com/150x150',
};

const mockRecommendation: Recommendation = {
  id: 1,
  title: '오늘의 추천 메뉴',
  content: '새로 나온 아메리카노를 추천합니다! 특별한 원두로 만든 커피입니다.',
  image: 'https://via.placeholder.com/300x200',
  show: true
};

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
      image: 'https://via.placeholder.com/150x150',
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
      image: 'https://via.placeholder.com/150x150',
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

// 게시물 관련 API
export const getPosts = async (): Promise<Post[]> => {
  try {
    console.log('getPosts 호출');
    // 모의 지연
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPosts;
  } catch (error: any) {
    console.error('게시물 조회 실패:', error);
    throw new Error('게시물을 불러오는데 실패했습니다.');
  }
};

// 추천 관련 API
export const getRecommendation = async (): Promise<Recommendation> => {
  try {
    console.log('getRecommendation 호출');
    // 모의 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRecommendation;
  } catch (error: any) {
    console.error('추천 조회 실패:', error);
    throw new Error('추천을 불러오는데 실패했습니다.');
  }
};

export const hideRecommendation = async (): Promise<void> => {
  try {
    console.log('hideRecommendation 호출');
    // 모의 지연
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('추천 숨기기 완료');
  } catch (error: any) {
    console.error('추천 숨기기 실패:', error);
    throw new Error('추천을 숨기는데 실패했습니다.');
  }
};
 