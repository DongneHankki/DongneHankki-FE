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
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { common } from '../../../shared/styles/commonAuthStyles';

const PostCreateScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [basicContent, setBasicContent] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleImageUpload = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카메라로 촬영', '갤러리에서 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCameraLaunch();
          } else if (buttonIndex === 2) {
            handleImageLibraryLaunch();
          }
        }
      );
    } else {
      Alert.alert(
        '이미지 업로드',
        '방법을 선택하세요',
        [
          { text: '취소', style: 'cancel' },
          { text: '카메라로 촬영', onPress: handleCameraLaunch },
          { text: '갤러리에서 선택', onPress: handleImageLibraryLaunch },
        ]
      );
    }
  };

  const handleCameraLaunch = () => {
    setIsImageUploading(true);
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      setIsImageUploading(false);
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '카메라를 사용할 수 없습니다.');
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const handleImageLibraryLaunch = () => {
    setIsImageUploading(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      setIsImageUploading(false);
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '갤러리에 접근할 수 없습니다.');
        return;
      }
    });
  };

  const handleAIGeneration = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      Alert.alert('AI 생성', 'AI 마케팅 글 생성 기능을 구현해야 합니다.');
    }, 2000);
  };

  const handleUpload = () => {
    if (!selectedImage) {
      Alert.alert('알림', '사진을 업로드해주세요.');
      return;
    }
    if (!basicContent.trim()) {
      Alert.alert('알림', '기본 내용을 입력해주세요.');
      return;
    }
    
    Alert.alert('성공', '마케팅 포스트가 업로드되었습니다!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 로딩 오버레이 */}
      {(isImageUploading || isGeneratingAI) && (
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
                  onPress={() => setSelectedImage(null)}
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
        <TouchableOpacity style={styles.aiButton} onPress={handleAIGeneration}>
          <Icon name="sparkles" size={20} color="#FF6B35" />
          <Text style={styles.aiButtonText}>AI 마케팅 글 생성하기</Text>
        </TouchableOpacity>

        {/* 기본 내용 입력 섹션 */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>기본 내용</Text>
          <TextInput
            style={styles.contentInput}
            value={basicContent}
            onChangeText={setBasicContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 업로드 버튼 */}
        <TouchableOpacity style={common.brownButton} onPress={handleUpload}>
          <Text style={common.brownButtonText}>업로드</Text>
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
  aiButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
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
  uploadButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PostCreateScreen;