import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createReview, updateReview, CreateReviewRequest, UpdateReviewRequest, Review } from '../services/reviewAPI';

interface ReviewWriteModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: number;
  userId: number;
  userType: 'owner' | 'customer' | null;
  onReviewCreated: () => void;
  existingReview?: Review | null; // 기존 리뷰 정보
}

const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  visible,
  onClose,
  storeId,
  userId,
  userType,
  onReviewCreated,
  existingReview
}) => {
  const [content, setContent] = useState('');
  const [scope, setScope] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 기존 리뷰가 있으면 수정 모드로 설정
  useEffect(() => {
    if (existingReview) {
      setContent(existingReview.content);
      setScope(existingReview.scope);
      setIsEditMode(true);
    } else {
      setContent('');
      setScope(5);
      setIsEditMode(false);
    }
  }, [existingReview, visible]);

  const handleSubmit = async () => {
    // customer만 리뷰 작성 가능
    if (userType !== 'customer') {
      Alert.alert('알림', '고객만 리뷰를 작성할 수 있습니다.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const reviewData: CreateReviewRequest = {
        userId,
        content: content.trim(),
        scope
      };

      if (isEditMode && existingReview) {
        // 수정 모드
        const updateData: UpdateReviewRequest = {
          content: content.trim(),
          scope
        };
        
        // reviewId 또는 id 중 존재하는 것을 사용
        const actualReviewId = existingReview.reviewId || existingReview.id;
        
        console.log('=== 리뷰 수정 요청 상세 ===');
        console.log('storeId:', storeId);
        console.log('existingReview.id:', existingReview.id);
        console.log('existingReview.reviewId:', existingReview.reviewId);
        console.log('actualReviewId:', actualReviewId);
        console.log('existingReview 전체:', JSON.stringify(existingReview, null, 2));
        console.log('updateData:', JSON.stringify(updateData, null, 2));
        console.log('========================');

        if (!actualReviewId) {
          throw new Error('리뷰 ID를 찾을 수 없습니다.');
        }

        await updateReview(storeId, actualReviewId, updateData);
        Alert.alert('성공', '리뷰가 수정되었습니다.');
      } else {
        // 작성 모드
        console.log('리뷰 작성 요청:', {
          storeId,
          reviewData
        });

        await createReview(storeId, reviewData);
        Alert.alert('성공', '리뷰가 작성되었습니다.');
      }

      setContent('');
      setScope(5);
      setIsEditMode(false);
      onReviewCreated(); // 리뷰 목록 새로고침 콜백 호출
      onClose();
    } catch (error: any) {
      console.error('리뷰 처리 오류:', error);
      Alert.alert('오류', error.message || '리뷰 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => userType === 'customer' && setScope(index + 1)}
        style={[styles.starButton, userType !== 'customer' && styles.disabledStar]}
        disabled={userType !== 'customer'}
      >
        <Icon
          name={index < scope ? 'star' : 'star-border'}
          size={24}
          color={index < scope ? '#FFD700' : '#ccc'}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {userType === 'customer' 
                ? (isEditMode ? '리뷰 수정' : '리뷰 작성')
                : '리뷰 보기'
              }
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>한줄 리뷰</Text>
            <TextInput
              style={[styles.contentInput, userType !== 'customer' && styles.disabledInput]}
              placeholder={userType === 'customer' 
                ? "이 가게에 대한 한줄 리뷰를 작성해주세요..." 
                : "고객만 리뷰를 작성할 수 있습니다."
              }
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={3}
              maxLength={100}
              editable={userType === 'customer'}
            />
            <Text style={styles.characterCount}>{content.length}/100</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>별점</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
          </View>

          {userType === 'customer' && (
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '처리 중...' : (isEditMode ? '수정하기' : '작성하기')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    width: '90%',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#2E1404',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  disabledStar: {
    opacity: 0.5,
  },
});

export default ReviewWriteModal;
