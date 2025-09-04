import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { common } from '../../../shared/styles/commonAuthStyles';
import { useImagePicker } from '../hooks/useImagePicker';
import { generateAIMarketingContent, uploadMarketingPost, getUserInfo } from '../services/storeApi';
import { MarketingPost } from '../types/storeTypes';
import { getTokenFromLocal } from '../../../shared/utils/tokenUtil';

const StoreManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [basicContent, setBasicContent] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { selectedImage, isImageUploading, handleImageUpload, removeImage } = useImagePicker();

  const handleAIGeneration = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '먼저 사진을 업로드해주세요.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // basicContent의 현재 값을 키워드로 사용
      const keywords = basicContent.trim() || '커피';
      const aiContent = await generateAIMarketingContent(selectedImage, keywords);
      setBasicContent(aiContent);
      Alert.alert('성공', 'AI 마케팅 글이 생성되었습니다!');
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '사진을 업로드해주세요.');
      return;
    }
    if (!basicContent.trim()) {
      Alert.alert('알림', '기본 내용을 입력해주세요.');
      return;
    }

    setIsUploading(true);
    try {
      // keychain에서 storeId 가져오기
      const tokenData = await getTokenFromLocal();
      const userInfo = await getUserInfo(tokenData?.userId || '1');
      const storeId = userInfo?.storeId || 1;

      const postData: MarketingPost = {
        image: selectedImage,
        content: basicContent.trim(),
      };

      await uploadMarketingPost(postData);

      // 성공 후 다음 페이지로 이동 (이미지와 내용 전달)
      (navigation as any).navigate('StorePosting', {
        image: selectedImage,
        content: basicContent.trim(),
        storeId: storeId,
      });
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로딩 오버레이 */}
      {(isImageUploading || isGeneratingAI || isUploading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {/* 제목 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>오늘의 마케팅</Text>
          <View style={styles.promptContainer}>
            <Icon name="sparkles" size={16} color="#FBA542" />
            <Text style={styles.promptText}>마감 청소 후 사진을 올려볼까요?</Text>
          </View>
        </View>

        {/* 사진 업로드 섹션 */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>사진 업로드</Text>
          <TouchableOpacity style={styles.uploadArea} onPress={handleImageUpload}>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={removeImage}
                >
                  <Icon name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Icon name="camera" size={48} color="#666" />
                <Text style={styles.uploadText}>클릭하여 사진을 업로드하세요</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* AI 마케팅 글 생성 버튼 */}
        <TouchableOpacity 
          style={[styles.aiButton, !selectedImage && styles.aiButtonDisabled]} 
          onPress={handleAIGeneration}
          disabled={!selectedImage}
        >
          <Icon name="sparkles" size={20} color={selectedImage ? "#FBA542" : "#ccc"} />
          <Text style={[styles.aiButtonText, !selectedImage && styles.aiButtonTextDisabled]}>
            AI 마케팅 글 생성하기
          </Text>
        </TouchableOpacity>

        {/* 키워드/내용 입력 섹션 */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>키워드 또는 마케팅 내용</Text>
          <Text style={styles.sectionSubtitle}>
            AI 생성 시: 키워드로 사용됩니다 (예: 커피, 음료, 디저트)
          </Text>
          <TextInput
            style={styles.contentInput}
            value={basicContent}
            onChangeText={setBasicContent}
            placeholder="키워드를 입력하거나 마케팅 내용을 직접 작성하세요"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 업로드 버튼 */}
        <TouchableOpacity 
          style={[common.brownButton, (!selectedImage || !basicContent.trim()) && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={!selectedImage || !basicContent.trim()}
        >
          <Text style={[common.brownButtonText, (!selectedImage || !basicContent.trim()) && styles.uploadButtonTextDisabled]}>
            업로드
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
  uploadSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  uploadArea: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 2,
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  aiButtonDisabled: {
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  aiButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  aiButtonTextDisabled: {
    color: '#ccc',
  },
  contentSection: {
    marginBottom: 30,
  },
  contentInput: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  uploadButtonTextDisabled: {
    color: '#999',
  },
});

export default StoreManagementScreen;