import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { checkFollowStatus, followStore, unfollowStore } from '../services/followAPI';

interface StoreInfoProps {
  storeName: string;
  location: string;
  operatingHours: string;
  rating: number;
  onSubscribe: () => void;
  industryCode?: number;
  storeId: number;
}

const StoreInfo: React.FC<StoreInfoProps> = ({
  storeName,
  location,
  operatingHours,
  rating,
  onSubscribe,
  industryCode,
  storeId,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 팔로우 상태 확인
  useEffect(() => {
    loadFollowStatus();
  }, [storeId]);

  // 팔로우 상태 확인 API
  const loadFollowStatus = async () => {
    try {
      const isFollowingStatus = await checkFollowStatus(storeId);
      setIsFollowing(isFollowingStatus);
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
    }
  };

  // 팔로우/언팔로우 API
  const toggleFollow = async () => {
    if (isLoading) return;
    
    // 언팔로우 시 확인 다이얼로그
    if (isFollowing) {
      Alert.alert(
        '언팔로우',
        '정말 언팔로우 하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '예',
            style: 'destructive',
            onPress: () => performFollowAction('unfollow'),
          },
        ]
      );
    } else {
      // 팔로우 시 바로 실행
      performFollowAction('follow');
    }
  };

  // 실제 팔로우/언팔로우 API 호출
  const performFollowAction = async (action: 'follow' | 'unfollow') => {
    setIsLoading(true);
    try {
      if (action === 'follow') {
        // 팔로우 요청
        await followStore(storeId);
      } else {
        // 언팔로우 요청
        await unfollowStore(storeId);
      }
      
      setIsFollowing(action === 'follow');
      onSubscribe(); // 기존 콜백 호출
      
      Alert.alert(
        action === 'follow' ? '팔로우' : '언팔로우',
        action === 'follow' ? '팔로우했습니다!' : '팔로우를 취소했습니다.'
      );
    } catch (error: any) {
      console.error('팔로우 처리 실패:', error);
      Alert.alert('오류', error.message || '팔로우 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 별점 렌더링 (부분 채움 지원)
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starIndex = index + 1;
    const fillPercentage = Math.max(0, Math.min(1, rating - index));
    
    if (fillPercentage >= 1) {
      // 완전히 채워진 별
      return (
        <Icon
          key={index}
          name="star"
          size={16}
          color="#FF9500"
          style={styles.star}
        />
      );
    } else if (fillPercentage > 0) {
      // 부분적으로 채워진 별 (star-half 사용)
      return (
        <Icon
          key={index}
          name="star-half"
          size={16}
          color="#FF9500"
          style={styles.star}
        />
      );
    } else {
      // 빈 별
      return (
        <Icon
          key={index}
          name="star-border"
          size={16}
          color="#E0E0E0"
          style={styles.star}
        />
      );
    }
  });

  // 업종 아이콘
  let industryIcon = 'restaurant';
  if (industryCode) {
    // 음식점 관련 업종
    if ([2301, 2302, 2303, 2305, 2309, 2310, 2601].includes(industryCode)) {
      industryIcon = 'restaurant';
    }
    // 카페/제과 관련 업종
    else if ([2501, 2502].includes(industryCode)) {
      industryIcon = 'local-cafe';
    }
    // 식료품점 관련 업종
    else if ([2102, 2103, 2104, 2105, 2201].includes(industryCode)) {
      industryIcon = 'store';
    }
    // 소매 상점 관련 업종 (5201, 5202로 수정)
    else if ([5201, 5202].includes(industryCode)) {
      industryIcon = 'shopping-bag';
    }
  }

  // 구독 버튼 클릭 핸들러
  const handleSubscribe = () => {
    onSubscribe();
  };

  // 매장명 (긴 텍스트 처리)
  const displayStoreName = storeName && storeName.length > 20 ? `${storeName.substring(0, 20)}...` : (storeName || '매장명 없음');

  // 위치 정보
  const displayLocation = location && location.length > 30 ? `${location.substring(0, 30)}...` : (location || '주소 정보 없음');

  // 영업시간 정보
  const displayOperatingHours = operatingHours || '영업 시간 정보 없음';

  return (
    <View style={styles.container}>
      {/* 정보 컨테이너 */}
      <View style={styles.infoContainer}>
        {/* 상호명과 아이콘 */}
        <View style={styles.nameRow}>
          <Text style={styles.storeName} numberOfLines={1}>{displayStoreName}</Text>
          <Icon name={industryIcon} size={16} color="#000000" />
        </View>

        {/* 위치 정보 */}
        <Text style={styles.location} numberOfLines={1}>{displayLocation}</Text>

        {/* 영업 시간 */}
        <Text style={styles.operatingHours}>{displayOperatingHours}</Text>

        {/* 별점 */}
        <View style={styles.ratingContainer}>
          {stars}
        </View>

        {/* 팔로우 버튼 */}
        <TouchableOpacity 
          style={[
            styles.subscribeButton, 
            isFollowing ? styles.followingButton : styles.notFollowingButton
          ]} 
          onPress={toggleFollow}
          disabled={isLoading}
        >
          <Text style={[
            styles.subscribeText,
            isFollowing ? styles.followingText : styles.notFollowingText
          ]}>
            {isLoading ? '처리중...' : (isFollowing ? '팔로잉' : '팔로우')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 성능 디버깅을 위한 displayName 추가
StoreInfo.displayName = 'StoreInfo';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  operatingHours: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    marginRight: 2,
  },
  subscribeButton: {
    backgroundColor: '#F3C35B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  subscribeText: {
    color: '#2E1404',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#FFFFFF', // 흰색 배경
    borderWidth: 1,
    borderColor: '#FBA542', // 주황색 테두리
  },
  notFollowingButton: {
    backgroundColor: '#FBA542', // 주황색 배경
  },
  followingText: {
    color: '#FBA542', // 주황색 글씨
  },
  notFollowingText: {
    color: '#2E1404', // 갈색 글씨
  },
});

export default StoreInfo;
