import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMapStore } from '../store/mapStore';
import ReviewCard from './ReviewCard';

const StoreDetail = React.memo(({ store, onBack }) => {
  // 업종 아이콘을 useMemo로 최적화
  const industryIcon = useMemo(() => {
    if (!store?.industryCode) return 'restaurant';
    
    if ([2301, 2302, 2303, 2305, 2309, 2310, 2601].includes(store.industryCode)) {
      return 'store';
    }
    if ([2501, 2502].includes(store.industryCode)) {
      return 'local-cafe';
    }
    if ([2102, 2103, 2104, 2105, 2201].includes(store.industryCode)) {
      return 'restaurant';
    }
    if ([5101, 5102].includes(store.industryCode)) {
      return 'shopping-bag';
    }
    return 'restaurant';
  }, [store?.industryCode]);

  // 별점 렌더링을 useMemo로 최적화
  const stars = useMemo(() => {
    const rating = store?.likeCount || 4;
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="star"
        size={16}
        color={index < rating ? '#FF9500' : '#E0E0E0'}
        style={styles.star}
      />
    ));
  }, [store?.likeCount]);

  // 뒤로가기 핸들러를 useCallback으로 최적화
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // 매장명을 useMemo로 최적화
  const displayStoreName = useMemo(() => {
    return store?.name || '매장명';
  }, [store?.name]);

  // 주소를 useMemo로 최적화
  const displayAddress = useMemo(() => {
    return store?.address || '주소 정보';
  }, [store?.address]);

  // 팔로워 수를 useMemo로 최적화
  const followerCount = useMemo(() => {
    return store?.likeCount || 100;
  }, [store?.likeCount]);

  // 리뷰 카드들을 useMemo로 최적화
  const reviewCards = useMemo(() => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <ReviewCard />
      <ReviewCard />
      <ReviewCard />
    </ScrollView>
  ), []);

  // 메뉴 아이템들을 useMemo로 최적화
  const menuItems = useMemo(() => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.menuItem}>
        <View style={styles.menuImagePlaceholder}>
          <Icon name="restaurant" size={20} color="#ccc" />
        </View>
        <Text style={styles.menuName}>마라탕</Text>
      </View>
      <View style={styles.menuItem}>
        <View style={styles.menuImagePlaceholder}>
          <Icon name="restaurant" size={20} color="#ccc" />
        </View>
        <Text style={styles.menuName}>마라샹궈</Text>
      </View>
      <View style={styles.menuItem}>
        <View style={styles.menuImagePlaceholder}>
          <Icon name="restaurant" size={20} color="#ccc" />
        </View>
        <Text style={styles.menuName}>꿔바로우</Text>
      </View>
    </ScrollView>
  ), []);

  // SNS 이미지들을 useMemo로 최적화
  const snsImages = useMemo(() => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.snsImagePlaceholder}>
        <Icon name="camera-alt" size={20} color="#ccc" />
      </View>
      <View style={styles.snsImagePlaceholder}>
        <Icon name="camera-alt" size={20} color="#ccc" />
      </View>
      <View style={styles.snsImagePlaceholder}>
        <Icon name="camera-alt" size={20} color="#ccc" />
      </View>
    </ScrollView>
  ), []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>매장 상세</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 매장 이미지 */}
      <View style={styles.imageContainer}>
        <View style={styles.mainImage}>
          <View style={styles.imagePlaceholder}>
            <Icon name="store" size={40} color="#ccc" />
          </View>
        </View>
        <View style={styles.subImages}>
          <View style={styles.subImage}>
            <View style={styles.imagePlaceholder}>
              <Icon name="restaurant" size={20} color="#ccc" />
            </View>
          </View>
          <View style={styles.subImage}>
            <View style={styles.imagePlaceholder}>
              <Icon name="local-dining" size={20} color="#ccc" />
            </View>
          </View>
          <View style={styles.subImage}>
            <View style={styles.imagePlaceholder}>
              <Icon name="table-restaurant" size={20} color="#ccc" />
            </View>
          </View>
        </View>
      </View>

      {/* 매장 정보 */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.storeName}>{displayStoreName}</Text>
          <Icon name={industryIcon} size={16} color="#000" />
        </View>
        
        <View style={styles.ratingRow}>
          {stars}
          <Text style={styles.followers}>팔로워 {followerCount}</Text>
        </View>
        
        <Text style={styles.address}>{displayAddress}</Text>
        <Text style={styles.hours}>영업 시간 : 10:00 - 20:00</Text>
      </View>

      {/* 간단 리뷰 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>간단 리뷰</Text>
        </View>
        <View style={styles.contentSpacing}>
          {reviewCards}
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>메뉴</Text>
        <View style={styles.contentSpacing}>
          {menuItems}
        </View>
      </View>

      {/* SNS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SNS</Text>
        <View style={styles.contentSpacing}>
          <View style={styles.snsPost}>
            <View style={styles.snsProfile}>
              <View style={styles.profileIcon}>
                <Icon name="star" size={16} color="#FFD700" />
              </View>
              <Text style={styles.username}>동네스타</Text>
            </View>
            <View style={styles.snsContent}>
              <View style={styles.snsTextContainer}>
                <Text style={styles.snsText}>
                  가족단위 손님도 많고 혼밥하{'\n'}
                  러 오시는 분들도 많은 곳입{'\n'}
                  니다 잔치국수가 국물이 시원{'\n'}
                  하고 정말 맛있어요. 여러분...
                </Text>
                <Text style={styles.snsDate}>25.8.17.목</Text>
              </View>
              <View style={styles.snsImageContainer}>
                <View style={styles.snsImagePlaceholder}>
                  <Icon name="landscape" size={24} color="#ccc" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

// 성능 디버깅을 위한 displayName 추가
StoreDetail.displayName = 'StoreDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#FBA542',
    marginHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  imageContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  mainImage: {
    flex: 2,
    height: 200,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subImages: {
    flex: 1,
    gap: 8,
  },
  subImage: {
    flex: 1,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#FBA542',
    marginHorizontal: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    marginRight: 2,
  },
  followers: {
    marginLeft: 8,
    color: '#666',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hours: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#FBA542',
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  contentSpacing: {
    marginTop: 12,
  },
  expandButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  menuItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  menuImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuName: {
    fontSize: 14,
    textAlign: 'center',
  },
  snsImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  snsPost: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  snsProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  snsContent: {
    flexDirection: 'row',
    gap: 12,
  },
  snsTextContainer: {
    flex: 1,
  },
  snsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  snsDate: {
    fontSize: 12,
    color: '#666',
  },
  snsImageContainer: {
    width: 80,
    height: 80,
  },
  snsImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoreDetail;
