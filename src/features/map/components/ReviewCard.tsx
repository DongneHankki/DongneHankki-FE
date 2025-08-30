import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Review } from '../services/reviewAPI';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = React.memo(({
  review
}) => {
  // review가 undefined인 경우 처리
  if (!review) {
    console.log('ReviewCard: review가 undefined입니다.');
    return null;
  }

  console.log('ReviewCard 받은 데이터:', JSON.stringify(review, null, 2));
  
  const { nickname, content, scope, createdAt, userImage } = review;
  
  // nickname을 하드코딩으로 설정
  const displayName = '호연';
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const reviewDate = formatDate(createdAt);
  const reviewerImage = userImage ? { uri: userImage } : require('../../../shared/images/profile.png');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 텍스트를 2줄로 제한하고 넘어가면 ... 추가
  const truncatedText = content.length > 60 ? content.substring(0, 60) + '...' : content;
  const isTextTruncated = content.length > 60;

  const handleCardPress = () => {
    if (isTextTruncated) {
      setIsModalVisible(true);
    }
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
});

export default ReviewCard;
