import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getReviews, Review } from '../services/reviewAPI';
import ReviewCard from './ReviewCard';
import ReviewWriteModal from './ReviewWriteModal';
import { useAuthStore } from '../../../shared/store/authStore';

interface ReviewListProps {
  storeId: number;
  userId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ storeId, userId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriteModalVisible, setIsWriteModalVisible] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const { userId: currentUserId, role } = useAuthStore();

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const reviewData = await getReviews(storeId);
      console.log('받아온 리뷰 데이터:', JSON.stringify(reviewData, null, 2));
      console.log('리뷰 개수:', reviewData.length);
      setReviews(reviewData);
      
      // 현재 사용자의 기존 리뷰 찾기
      const userReview = reviewData.find(review => review.userId === parseInt(currentUserId || '0'));
      setExistingReview(userReview || null);
      
      console.log('현재 사용자 리뷰:', userReview);
    } catch (error: any) {
      console.error('리뷰 로드 오류:', error);
      Alert.alert('오류', '리뷰를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [storeId]);

  const handleReviewCreated = () => {
    loadReviews(); // 리뷰 목록 새로고침
  };

  const handleWriteButtonPress = () => {
    if (existingReview) {
      // 기존 리뷰가 있으면 수정 모드로 모달 열기
      setIsWriteModalVisible(true);
    } else {
      // 기존 리뷰가 없으면 새로 작성
      setIsWriteModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>리뷰 ({reviews.length})</Text>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={handleWriteButtonPress}
        >
          <Icon name="edit" size={20} color="#2E1404" />
          <Text style={styles.writeButtonText}>
            {existingReview ? '리뷰 수정' : '리뷰 작성'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
        </View>
      ) : !reviews || reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="rate-review" size={48} color="#ccc" />
          <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
          <Text style={styles.emptySubText}>첫 번째 리뷰를 작성해보세요!</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewList}
        >
          {reviews.map((review, index) => {
            console.log(`리뷰 ${index}:`, review);
            console.log(`리뷰 ${index} 타입:`, typeof review);
            console.log(`리뷰 ${index}가 null인가?`, review === null);
            console.log(`리뷰 ${index}가 undefined인가?`, review === undefined);
            return (
              <ReviewCard 
                key={review?.id || index} 
                review={review} 
                onReviewDeleted={loadReviews}
              />
            );
          })}
        </ScrollView>
      )}

      <ReviewWriteModal
        visible={isWriteModalVisible}
        onClose={() => setIsWriteModalVisible(false)}
        storeId={storeId}
        userId={userId}
        userType={role}
        onReviewCreated={handleReviewCreated}
        existingReview={existingReview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E1404',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  writeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  reviewList: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default ReviewList;
