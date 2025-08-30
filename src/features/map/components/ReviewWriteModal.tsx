import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createReview, CreateReviewRequest } from '../services/reviewAPI';

interface ReviewWriteModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: number;
  userId: number;
  onReviewCreated: () => void;
}

const ReviewWriteModal: React.FC<ReviewWriteModalProps> = ({
  visible,
  onClose,
  storeId,
  userId,
  onReviewCreated
}) => {
  const [content, setContent] = useState('');
  const [scope, setScope] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
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

      console.log('리뷰 작성 요청:', {
        storeId,
        reviewData
      });

      await createReview(storeId, reviewData);
      Alert.alert('성공', '리뷰가 작성되었습니다.');
      setContent('');
      setScope(5);
      onReviewCreated(); // 리뷰 목록 새로고침 콜백 호출
      onClose();
    } catch (error: any) {
      console.error('리뷰 작성 오류:', error);
      Alert.alert('오류', error.message || '리뷰 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setScope(index + 1)}
        style={styles.starButton}
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
            <Text style={styles.modalTitle}>리뷰 작성</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentLabel}>한줄 리뷰</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="이 가게에 대한 한줄 리뷰를 작성해주세요..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{content.length}/100</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>평점</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '등록 중...' : '등록'}
            </Text>
          </TouchableOpacity>
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
});

export default ReviewWriteModal;
