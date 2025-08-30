import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMapStore } from '../store/mapStore';
import { useMarketStore } from '../store/marketStore';
import { useAuthStore } from '../../../shared/store/authStore';
import ReviewCard from './ReviewCard';
import ReviewWriteModal from './ReviewWriteModal';
import { getStoreDetail } from '../services/StoresAPI';


const StoreDetail = React.memo(({ store, onBack }) => {
  const [isWriteModalVisible, setIsWriteModalVisible] = useState(false);
  const { storeList } = useMapStore();
  const { 
    storeDetail, 
    loading, 
    error, 
    setStoreDetail, 
    setLoading, 
    setError 
  } = useMarketStore();
  const { isOwner, userId } = useAuthStore();

  // 컴포넌트 마운트 시 API에서 store 상세 정보 가져오기
  useEffect(() => {
    console.log('StoreDetail useEffect 실행됨');
    console.log('전달받은 store 객체:', store);
    console.log('store.storeId:', store?.storeId);
    console.log('store.storeId 타입:', typeof store?.storeId);
    
    if (!store?.storeId) {
      console.log('storeId가 없어서 API 호출을 건너뜁니다. store 객체:', store);
      return;
    }
    
    console.log('API 호출 조건 만족, fetchStoreDetail 함수 실행');
    
    const fetchStoreDetail = async () => {
      console.log('=== Store 상세 정보 API 호출 시작 ===');
      console.log('호출할 storeId:', store.storeId);
      setLoading(true);
      setError(null);
      
      try {
        console.log('getStoreDetail 함수 호출 직전');
        const response = await getStoreDetail(store.storeId);
        console.log('getStoreDetail 함수 호출 완료, response:', response);
        
        const storeData = response.data || response;
        console.log('추출된 storeData:', storeData);
        
        console.log('storeData.reviews 존재 여부:', !!storeData.reviews);
        console.log('storeData.reviews 길이:', storeData.reviews?.length);
        console.log('storeData.reviews 내용:', storeData.reviews);
        console.log('storeData.avgStar:', storeData.avgStar);
        console.log('storeData.owner:', storeData.owner);
        console.log('storeData.menus:', storeData.menus);
        
        setStoreDetail(storeData);
        console.log('marketStore에 storeDetail 저장 완료');
        
      } catch (error) {
        console.error('Store 상세 정보 가져오기 실패:', error);
        setError(error);
        // 에러 발생 시 기본 store 정보 사용
        setStoreDetail(store);
      } finally {
        setLoading(false);
        console.log('=== API 호출 완료 ===');
      }
    };

    fetchStoreDetail();
  }, [store?.storeId, setStoreDetail, setLoading, setError]);
  
  // 업종 아이콘을 useMemo로 최적화
  const industryIcon = useMemo(() => {
    if (!storeDetail?.industryCode) return 'restaurant';
    
    if ([2301, 2302, 2303, 2305, 2309, 2310, 2601].includes(storeDetail.industryCode)) {
      return 'store';
    }
    if ([2501, 2502].includes(storeDetail.industryCode)) {
      return 'local-cafe';
    }
    if ([2102, 2103, 2104, 2105, 2201].includes(storeDetail.industryCode)) {
      return 'restaurant';
    }
    if ([5101, 5102].includes(storeDetail.industryCode)) {
      return 'shopping-bag';
    }
    return 'restaurant';
  }, [storeDetail?.industryCode]);

  // 별점 렌더링을 useMemo로 최적화
  const stars = useMemo(() => {
    const rating = storeDetail?.avgStar || 4;
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="star"
        size={16}
        color={index < rating ? '#FF9500' : '#E0E0E0'}
        style={styles.star}
      />
    ));
  }, [storeDetail?.avgStar]);

  // 뒤로가기 핸들러를 useCallback으로 최적화
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // 리뷰 작성 모달 핸들러들
  const handleOpenWriteModal = useCallback(() => {
    setIsWriteModalVisible(true);
  }, []);

  const handleCloseWriteModal = useCallback(() => {
    setIsWriteModalVisible(false);
  }, []);

  const handleReviewCreated = useCallback(async () => {
    // 리뷰 작성 후 API에서 다시 store 상세 정보 가져오기
    try {
      console.log('리뷰 새로고침 시작');
      
      if (!store?.storeId) return;
      
      setLoading(true);
      const response = await getStoreDetail(store.storeId);
      const storeData = response.data || response;
      
      setStoreDetail(storeData);
      console.log('리뷰 새로고침 완료, 새로운 storeDetail 저장됨');
      
    } catch (error) {
      console.error('리뷰 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [store?.storeId, setStoreDetail, setLoading]);

  // 매장명을 useMemo로 최적화
  const displayStoreName = useMemo(() => {
    return storeDetail?.name || '매장명';
  }, [storeDetail?.name]);

  // 주소를 useMemo로 최적화
  const displayAddress = useMemo(() => {
    return storeDetail?.address || '주소 정보';
  }, [storeDetail?.address]);

  // 팔로워 수를 useMemo로 최적화
  const followerCount = useMemo(() => {
    return storeDetail?.likeCount || 100;
  }, [storeDetail?.likeCount]);

  // 리뷰 섹션을 useMemo로 최적화
  const reviewSection = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.reviewContainer}>
          <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
        </View>
      );
    }
    
    const reviews = storeDetail?.reviews || [];
    
    if (!reviews || reviews.length === 0) {
      return (
        <View style={styles.reviewContainer}>
          <Text style={styles.emptyReviewText}>
            작성된 한줄 리뷰가 없습니다 🥺
          </Text>
        </View>
      );
    }
    
    // 현재 사용자의 리뷰를 가장 앞쪽에 배치
    console.log('리뷰 정렬 시작');
    console.log('현재 userId:', userId, '타입:', typeof userId);
    console.log('리뷰 목록:', reviews);
    
    const sortedReviews = [...reviews].sort((a, b) => {
      // userId 타입을 맞춰서 비교 (string vs number)
      const currentUserId = userId ? parseInt(userId) : null;
      const aUserId = a.userId;
      const bUserId = b.userId;
      
      console.log('비교 중:', {
        currentUserId,
        aUserId,
        bUserId,
        aIsCurrentUser: aUserId === currentUserId,
        bIsCurrentUser: bUserId === currentUserId
      });
      
      const aIsCurrentUser = aUserId === currentUserId;
      const bIsCurrentUser = bUserId === currentUserId;
      
      if (aIsCurrentUser && !bIsCurrentUser) return -1; // a가 현재 사용자면 앞으로
      if (!aIsCurrentUser && bIsCurrentUser) return 1;  // b가 현재 사용자면 앞으로
      return 0; // 둘 다 현재 사용자이거나 둘 다 다른 사용자면 순서 유지
    });
    
    console.log('정렬된 리뷰:', sortedReviews);
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortedReviews.map((review, index) => (
          <ReviewCard key={review?.reviewId || review?.id || index} review={review} />
        ))}
      </ScrollView>
    );
  }, [storeDetail?.reviews, loading, userId]);

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
          {!isOwner() && (
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleOpenWriteModal}>
              <Icon name="edit" size={16} color="#2E1404" />
              <Text style={styles.writeReviewButtonText}>리뷰 작성</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.contentSpacing}>
          {reviewSection}
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

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        visible={isWriteModalVisible}
        onClose={handleCloseWriteModal}
        storeId={storeDetail?.storeId || store?.storeId || 1}
        userId={userId ? parseInt(userId) : 1}
        onReviewCreated={handleReviewCreated}
      />
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
    justifyContent: 'space-between',
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
  reviewContainer: {
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyReviewText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBA542',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  writeReviewButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2E1404',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default StoreDetail;
