import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getTokenFromLocal } from '../../../../shared/utils/tokenUtil';
import { Review, Profile, Recommendation, StorePost } from '../types/feedTypes';
import {
  getReviews,
  getProfile,
  getStoreOwnerPosts,
  getStoreCustomerPosts
} from '../services/feedApi';

export const useFeed = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'owner' | 'customer' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);

  const [selectedTab, setSelectedTab] = useState<'posts' | 'reviews'>('posts');
  const [storePosts, setStorePosts] = useState<StorePost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 토큰 정보 로드
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const tokenData = await getTokenFromLocal();
        if (tokenData) {
          setUserId(tokenData.userId || null);
          setRole(tokenData.role || null);
          setIsAuthenticated(true);
          setAccessToken(tokenData.accessToken || null);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('토큰 로드 실패:', error);
        setIsAuthenticated(false);
      }
    };

    loadTokenInfo();
  }, []);

  // 간단한 상태 로깅
  useEffect(() => {
    console.log('useFeed - 현재 상태:', {
      userId,
      role,
      isAuthenticated,
      hasAccessToken: !!accessToken
    });
  }, [userId, role, isAuthenticated, accessToken]);

  useEffect(() => {
    if (userId && isAuthenticated && accessToken) {
      console.log('useFeed - ✅ 모든 조건 만족: 데이터 로드 시작, userId:', userId);
      loadData();
    } else if (!isAuthenticated) {
      console.log('useFeed - ❌ 인증되지 않음');
      setLoading(false);
      setError('인증되지 않은 사용자입니다.');
    } else {
      console.log('useFeed - ⏳ 조건 대기 중...', { userId, isAuthenticated, accessToken });
    }
  }, [userId, isAuthenticated, accessToken]);

  const loadData = async () => {
    try {
      console.log('=== loadData 함수 시작 ===');
      setLoading(true);
      setError(null);

      const numericUserId = parseInt(userId || '0');
      console.log('useFeed - 변환된 userId:', numericUserId);

      console.log('useFeed - API 호출 시작');
      const [reviewsData, profileData] = await Promise.all([
        getReviews(numericUserId),
        getProfile(numericUserId)
      ]);

      console.log('=== API 호출 완료 ===');
      console.log('useFeed - reviews:', reviewsData);
      console.log('useFeed - profile:', profileData);

      setReviews(reviewsData);
      setProfile(profileData);

      // storeId가 있으면 가게별 게시글도 로드
      if (profileData && profileData.storeId) {
        setStoreId(profileData.storeId);
        
        // 사장님 게시글과 손님 게시글 모두 로드
        const [ownerPostsData, customerPostsData] = await Promise.all([
          getStoreOwnerPosts(profileData.storeId),
          getStoreCustomerPosts(profileData.storeId)
        ]);
        
        // 사장님 게시글을 storePosts에 설정 (글 탭에 표시)
        setStorePosts(ownerPostsData.values as StorePost[]);
        
        // 손님 게시글을 reviews에 변환하여 설정 (리뷰 탭에 표시)
        const customerPostsAsReviews = customerPostsData.values.map((post, index) => ({
          id: post.postId,
          postId: post.postId, // 댓글 수 조회를 위해 추가
          rating: 5, // 기본값
          content: post.content,
          userName: post.userNickname,
          createdAt: post.createdAt,
          images: post.images, // 이미지 정보 추가
          hashtags: post.hashtags, // 해시태그 정보 추가
          likeCount: post.likeCount || 0, // 좋아요 수 추가
          userId: post.userId, // 사용자 ID 추가
        }));
        setReviews(customerPostsAsReviews);
        
        // 프로필의 리뷰 수를 손님 게시글 수로 업데이트
        const updatedProfile = {
          ...profileData,
          reviewCount: customerPostsData.values.length
        };
        setProfile(updatedProfile);
        
        console.log('useFeed - ownerPosts:', ownerPostsData);
        console.log('useFeed - customerPosts:', customerPostsData);
        console.log('useFeed - updatedProfile:', updatedProfile);

      }

      // 임시 추천 데이터
      setRecommendation({
        id: 1,
        title: '오늘의 추천',
        content: '오늘은 특별한 메뉴를 소개해보세요!',
        show: true,
      });

      console.log('useFeed - 상태 업데이트 완료');
    } catch (err: any) {
      console.error('=== loadData 에러 발생 ===');
      console.error('useFeed - 에러 발생:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'posts' | 'reviews') => {
    setSelectedTab(tab);
  };

  const handleWritePost = () => {
    navigation.navigate('Management' as never);
  };

  const handleHideRecommendation = async () => {
    try {
      setRecommendation(prev => prev ? { ...prev, show: false } : null);
    } catch (error) {
      Alert.alert('오류', '추천을 숨기는데 실패했습니다.');
    }
  };

  const handleRefresh = () => {
    console.log('useFeed - 새로고침 시작');
    if (userId && isAuthenticated && accessToken) {
      loadData();
    }
  };


  return {
    selectedTab,
    storePosts,
    reviews,
    profile,
    recommendation,
    loading,
    error,
    handleTabChange,
    handleWritePost,
    handleHideRecommendation,
    handleRefresh,
  };
};
