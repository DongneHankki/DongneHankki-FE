import { useState } from 'react';
import { Alert, Platform, ActionSheetIOS } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';

export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    isImageUploading,
    handleImageUpload,
    removeImage,
  };
};
