import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Review, deleteReview } from '../services/reviewAPI';
import { useAuthStore } from '../../../shared/store/authStore';
import { useMarketStore } from '../store/marketStore';
import { formatTimeDiff } from '../utils/TimeDiff';

interface ReviewCardProps {
  review: Review;
  onReviewDeleted?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = React.memo(({
  review,
  onReviewDeleted
}) => {
  // review가 undefined인 경우 처리
  if (!review) {
    console.log('ReviewCard: review가 undefined입니다.');
    return null;
  }

  console.log('ReviewCard 받은 데이터:', JSON.stringify(review, null, 2));
  
  const { id, reviewId, nickname, content, scope, createdAt, userImage } = review;
  const { userId: currentUserId } = useAuthStore();
  const { storeDetail } = useMarketStore();
  
  // reviewId 또는 id 중 존재하는 것을 사용
  const actualReviewId = reviewId || id;
  
  console.log('리뷰 ID 확인:', { id, reviewId, actualReviewId, storeDetail: storeDetail?.storeId });
  
  // nickname을 하드코딩으로 설정
  const displayName = '호연';
  
  // 현재 사용자가 매장 소유자인지 확인
  const isOwner = storeDetail?.owner?.userId === parseInt(currentUserId || '0');
  
  console.log('소유자 확인:', { 
    currentUserId, 
    ownerUserId: storeDetail?.owner?.userId, 
    isOwner 
  });
  
  // 날짜 포맷팅
  const reviewDate = formatTimeDiff(createdAt);
  const reviewerImage = userImage ? { uri: userImage } : require('../../../shared/images/profile.png');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 텍스트를 2줄로 제한하고 넘어가면 ... 추가
  const truncatedText = content.length > 60 ? content.substring(0, 60) + '...' : content;
  const isTextTruncated = content.length > 60;

  const handleCardPress = () => {
    if (isTextTruncated) {
      setIsModalVisible(true);
    }
  };

  const handleDeleteReview = async () => {
    console.log('=== 리뷰 삭제 시도 ===');
    console.log('storeDetail:', storeDetail);
    console.log('storeDetail?.storeId:', storeDetail?.storeId);
    console.log('actualReviewId:', actualReviewId);
    console.log('review 전체 데이터:', review);
    
    if (!storeDetail?.storeId || !actualReviewId) {
      console.log('삭제 조건 실패:', {
        hasStoreId: !!storeDetail?.storeId,
        hasReviewId: !!actualReviewId,
        storeId: storeDetail?.storeId,
        reviewId: actualReviewId
      });
      Alert.alert('오류', '매장 정보 또는 리뷰 정보를 찾을 수 없습니다.');
      return;
    }

    Alert.alert(
      '리뷰 삭제',
      '정말로 이 리뷰를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log('삭제 API 호출:', {
                storeId: storeDetail.storeId,
                reviewId: actualReviewId
              });
              await deleteReview(storeDetail.storeId, actualReviewId);
              Alert.alert('성공', '리뷰가 삭제되었습니다.');
              onReviewDeleted?.(); // 부모 컴포넌트에 삭제 완료 알림
            } catch (error: any) {
              console.error('삭제 실패:', error);
              Alert.alert('오류', error.message || '리뷰 삭제에 실패했습니다.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.reviewCard} 
        onPress={handleCardPress}
        activeOpacity={isTextTruncated ? 0.7 : 1}
      >
        <View style={styles.reviewHeader}>
          <Image source={reviewerImage} style={styles.reviewerImage} />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>{displayName}</Text>
            <Text style={styles.reviewDate}>{reviewDate}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteReview}
              disabled={isDeleting}
            >
              <Icon 
                name="delete" 
                size={18} 
                color={isDeleting ? '#ccc' : '#666'} 
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.reviewContent}>
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <Icon
                key={index}
                name={index < scope ? 'star' : 'star-border'}
                size={12}
                color={index < scope ? '#FFD700' : '#ccc'}
              />
            ))}
          </View>
          <Text style={styles.reviewText}>
            {truncatedText}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalProfileInfo}>
                  <Image source={reviewerImage} style={styles.modalReviewerImage} />
                  <View style={styles.modalReviewerInfo}>
                    <Text style={styles.modalReviewerName}>{displayName}</Text>
                    <Text style={styles.modalReviewDate}>{reviewDate}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            
            <View style={styles.modalRatingContainer}>
              {Array.from({ length: 5 }, (_, index) => (
                <Icon
                  key={index}
                  name={index < scope ? 'star' : 'star-border'}
                  size={16}
                  color={index < scope ? '#FFD700' : '#ccc'}
                />
              ))}
            </View>
            
            <Text style={styles.modalReviewText}>
              {content}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    position: 'relative',
    width: 280,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    color: '#666',
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  reviewContent: {
    flexDirection: 'column',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalProfileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalReviewerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  modalReviewerInfo: {
    flex: 1,
  },
  modalReviewerName: {
    fontWeight: '600',
    fontSize: 16,
  },
  modalReviewDate: {
    color: '#666',
    fontSize: 13,
  },
  modalReviewText: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
});

export default ReviewCard;
