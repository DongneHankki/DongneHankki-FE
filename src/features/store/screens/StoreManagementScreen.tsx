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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { common } from '../../../shared/styles/commonAuthStyles';
import { useImagePicker } from '../hooks/useImagePicker';
import { generateAIMarketingContent, createOwnerPost } from '../services/storeApi';
import { MarketingPost } from '../types/storeTypes';

const Tab = createBottomTabNavigator();

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

const StoreManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [basicContent, setBasicContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [hashtags, setHashtags] = useState('');
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
      // 해시태그 파싱 (쉼표로 구분)
      const hashtagArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      
      const postData = {
        storeId: 1, // TODO: 실제 storeId 가져오기
        content: basicContent.trim(),
        images: [selectedImage],
        hashtags: hashtagArray,
      };
      
      console.log('게시글 작성 데이터:', postData);
      
      await createOwnerPost(postData);
      
      Alert.alert('성공', '게시글이 성공적으로 작성되었습니다!');
      
      // 성공 후 StorePostingScreen으로 이동하면서 이미지와 내용 전달
      navigation.navigate('StorePosting', { image: selectedImage, content: basicContent.trim() });
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
            <Icon name="sparkles" size={16} color="#FF6B35" />
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

        {/* AI 마케팅 글 생성 섹션 */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>AI 마케팅 글 생성</Text>
          <TextInput
            style={styles.keywordsInput}
            value={keywords}
            onChangeText={setKeywords}
            placeholder="키워드를 입력하세요 (예: 맛있는, 신선한, 정성스러운)"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[styles.aiButton, !selectedImage && styles.aiButtonDisabled]} 
            onPress={handleAIGeneration}
            disabled={!selectedImage}
          >
            <Icon name="sparkles" size={20} color={selectedImage ? "#fff" : "#ccc"} />
            <Text style={[styles.aiButtonText, !selectedImage && styles.aiButtonTextDisabled]}>
              {isGeneratingAI ? 'AI 생성 중...' : 'AI 마케팅 글 생성하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 해시태그 입력 섹션 */}
        <View style={styles.hashtagSection}>
          <Text style={styles.sectionTitle}>해시태그</Text>
          <TextInput
            style={styles.hashtagInput}
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="해시태그를 쉼표로 구분하여 입력하세요 (예: 맛있는, 신선한, 정성스러운)"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 기본 내용 입력 섹션 */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>기본 내용</Text>
          <TextInput
            style={styles.contentInput}
            value={basicContent}
            onChangeText={setBasicContent}
            placeholder="마케팅 내용을 입력하거나 AI로 생성해보세요"
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
    marginBottom: 12,
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
  aiSection: {
    marginBottom: 20,
  },
  keywordsInput: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  hashtagSection: {
    marginBottom: 20,
  },
  hashtagInput: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
});

export default StoreManagementScreen;

