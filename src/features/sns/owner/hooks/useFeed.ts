import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getTokenFromLocal } from '../../../../shared/utils/tokenUtil';
import { Post, Review, Profile, Recommendation } from '../types/feedTypes';
import {
  getPosts,
  getReviews,
  getProfile,
  getRecommendation,
  hideRecommendation
} from '../services/feedApi';

export const useFeed = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'owner' | 'customer' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<'posts' | 'reviews'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
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

  // 데이터 로드 - map과 동일한 간단한 방식
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
      const [postsData, reviewsData, profileData, recommendationData] = await Promise.all([
        getPosts(),
        getReviews(numericUserId),
        getProfile(numericUserId),
        getRecommendation()
      ]);

      console.log('=== API 호출 완료 ===');
      console.log('useFeed - posts:', postsData);
      console.log('useFeed - reviews:', reviewsData);
      console.log('useFeed - profile:', profileData);
      console.log('useFeed - recommendation:', recommendationData);

      setPosts(postsData);
      setReviews(reviewsData);
      setProfile(profileData);
      setRecommendation(recommendationData);

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

  const handleEditProfile = () => {
    Alert.alert('프로필 편집', '프로필 편집 기능은 준비 중입니다.');
  };

  const handleHideRecommendation = async () => {
    try {
      await hideRecommendation();
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
    posts,
    reviews,
    profile,
    recommendation,
    loading,
    error,
    handleTabChange,
    handleWritePost,
    handleEditProfile,
    handleHideRecommendation,
    handleRefresh,
  };
};
