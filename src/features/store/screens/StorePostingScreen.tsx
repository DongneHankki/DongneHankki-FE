import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const StorePostingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [marketingContent, setMarketingContent] = useState(
    "손님이 안 보셔도 매일 닦아요 :)\n깨끗한 주방은 저희의 자존심입니다."
  );
  const [isUploading, setIsUploading] = useState(false);

  // 모의 이미지 데이터 (실제로는 props나 API에서 받아올 예정)
  const mockImage = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('성공', '마케팅 내용이 수정되었습니다.');
  };

  const handleCancel = () => {
    setMarketingContent("손님이 안 보셔도 매일 닦아요 :)\n깨끗한 주방은 저희의 자존심입니다.");
    setIsEditing(false);
  };

  const handleUpload = async () => {
    if (!marketingContent.trim()) {
      Alert.alert('알림', '마케팅 내용을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      // 실제 API 호출을 여기에 구현
      await new Promise(resolve => setTimeout(resolve, 2000)); // 모의 지연
      Alert.alert('성공', 'AI 마케팅이 업로드되었습니다!');
              navigation.navigate('Main' as never);
    } catch (error: any) {
      Alert.alert('오류', error.message || '업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로딩 오버레이 */}
      {(isUploading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {/* 제목 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>오늘의 마케팅</Text>
          <View style={styles.promptContainer}>
            <Icon name="sparkles" size={16} color="#FF6B35" />
            <Text style={styles.promptText}>AI가 게시물을 생성했어요</Text>
          </View>
        </View>
        <View style={styles.marketingCard}> 
          <View style={styles.imageContainer}>
            <Image source={{ uri: mockImage }} style={styles.marketingImage} />
          </View>

          {/* 마케팅 내용 */}
          <View style={styles.contentContainer}>
            {isEditing ? (
              <TextInput
                style={styles.contentInput}
                value={marketingContent}
                onChangeText={setMarketingContent}
                multiline
                textAlignVertical="top"
                placeholder="마케팅 내용을 입력하세요"
              />
            ) : (
              <Text style={styles.contentText}>{marketingContent}</Text>
            )}
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>수정</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 업로드 버튼 */}
        <TouchableOpacity 
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? '업로드 중...' : 'AI 마케팅 업로드'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    marginVertical: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptText: {
    fontSize: 16,
    color: '#666',
  },
  marketingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    marginBottom: 16,
  },
  marketingImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  uploadButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  uploadButtonTextDisabled: {
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default StorePostingScreen;
