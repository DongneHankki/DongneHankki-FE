import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StoreInfoProps {
  storeName: string;
  location: string;
  operatingHours: string;
  rating: number;
  onSubscribe: () => void;
  industryCode?: number;
}

const StoreInfo: React.FC<StoreInfoProps> = ({
  storeName,
  location,
  operatingHours,
  rating,
  onSubscribe,
  industryCode,
}) => {
  // 디버깅 로그 추가
  console.log('StoreInfo - props 받음:', {
    storeName,
    location,
    operatingHours,
    rating,
    industryCode
  });

  // 별점 렌더링
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Icon
      key={index}
      name="star"
      size={16}
      color={index < rating ? '#FF9500' : '#E0E0E0'}
      style={styles.star}
    />
  ));

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

        {/* 구독 버튼 */}
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>팔로우</Text>
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
});

export default StoreInfo;
