import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

interface ImageUploadProps {
  selectedImages: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedImages,
  onImagesChange,
}) => {
  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 5, // 최대 5장까지 선택 가능
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
      } else if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => asset.uri).filter(uri => uri) as string[];
        onImagesChange([...selectedImages, ...newImages]);
      }
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <View style={styles.photoSection}>
      <Text style={styles.sectionTitle}>사진 업로드</Text>
      {selectedImages.length > 0 ? (
        <FlatList
          data={selectedImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageItem}>
              <Image source={{ uri: item }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            selectedImages.length < 5 ? (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                <Icon name="add" size={32} color="#999" />
                <Text style={styles.addImageText}>추가</Text>
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={styles.imagesContainer}
        />
      ) : (
        <TouchableOpacity style={styles.photoUploadArea} onPress={handleImagePicker}>
          <Icon name="camera-alt" size={32} color="#999" />
          <Text style={styles.photoUploadText}>클릭하여 사진을 업로드하세요</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 12,
  },
  photoUploadArea: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  photoUploadText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  imagesContainer: {
    paddingRight: 20,
  },
  imageItem: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    marginRight: 12,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  addImageText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default ImageUpload;
