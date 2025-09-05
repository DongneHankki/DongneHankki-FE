import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../shared/store/authStore';
import { logout } from '../../../shared/utils/tokenUtil';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import api from '../../../shared/services/api';
import { getUserProfile, UserProfile } from '../services/userAPI';

const CustomerInfoScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { clearAuth, userId, loginId, role, accessToken, setProfileImageUrl: setAuthProfileImageUrl } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (userId) {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(userId);
          setUserProfile(profile);
          
          // 프로필 이미지가 있으면 전역 상태 업데이트
          if (profile.profileImageUrl) {
            setAuthProfileImageUrl(profile.profileImageUrl);
          }
        } catch (error) {
          console.error('사용자 정보 로딩 실패:', error);
          Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [userId, setAuthProfileImageUrl]);

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout(navigation);
              
              console.log('로그아웃 완료 - Keychain 데이터 삭제됨');
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('알림', '프로필 수정 기능은 준비 중입니다.');
  };

  const handleProfileImageUpload = async () => {
    try {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as const,
      };

      const response: ImagePickerResponse = await launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          await uploadProfileImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await api.patch('/api/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        // API 응답에서 profileImageUrl을 받아와서 사용
        const responseData = response.data;
        const uploadedImageUrl = responseData?.profileImageUrl || imageUri;
        
        setAuthProfileImageUrl(uploadedImageUrl);
        Alert.alert('성공', '프로필 이미지가 업로드되었습니다.');
      }
    } catch (error) {
      console.error('프로필 이미지 업로드 오류:', error);
      Alert.alert('오류', '프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCustomerSupport = (option: string) => {
    Alert.alert('알림', `${option} 기능은 준비 중입니다.`);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 정보</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 프로필 정보 카드 */}
            <View style={styles.profileCard}>
          {/* 프로필 이미지 */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {userProfile?.profileImageUrl ? (
                <Image source={{ uri: userProfile.profileImageUrl }} style={styles.profileImageStyle} />
              ) : (
                <Icon name="person" size={40} color="#666" />
              )}
            </View>
            <TouchableOpacity 
              style={styles.editImageButton} 
              onPress={handleProfileImageUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Icon name="hourglass-empty" size={16} color="#fff" />
              ) : (
                <Icon name="edit" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* 정보 필드들 */}
          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>아이디</Text>
            <Text style={styles.infoValue}>{userProfile?.loginId || loginId || '로딩 중...'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>닉네임</Text>
            <View style={styles.infoValueRow}>
              <Text style={styles.infoValue}>{userProfile?.nickname || '로딩 중...'}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{userProfile?.name || '로딩 중...'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>전화번호</Text>
            <Text style={styles.infoValue}>{userProfile?.phoneNumber || '로딩 중...'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>생년월일</Text>
            <Text style={styles.infoValue}>{userProfile?.birth ? new Date(userProfile.birth).toLocaleDateString('ko-KR') : '로딩 중...'}</Text>
          </View>
        </View>

        {/* 고객지원 카드 */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>고객지원</Text>
          
          <TouchableOpacity 
            style={styles.supportItem} 
            onPress={() => handleCustomerSupport('공지사항')}
          >
            <Icon name="campaign" size={20} color="#666" style={styles.supportIcon} />
            <Text style={styles.supportText}>공지사항</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportItem} 
            onPress={() => handleCustomerSupport('고객센터')}
          >
            <Icon name="headset-mic" size={20} color="#666" style={styles.supportIcon} />
            <Text style={styles.supportText}>고객센터</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportItem} 
            onPress={() => handleCustomerSupport('의견 남기기')}
          >
            <Icon name="mail" size={20} color="#666" style={styles.supportIcon} />
            <Text style={styles.supportText}>의견 남기기</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportItem} 
            onPress={() => handleCustomerSupport('약관 및 정책')}
          >
            <Icon name="info" size={20} color="#666" style={styles.supportIcon} />
            <Text style={styles.supportText}>약관 및 정책</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

            {/* 로그아웃 버튼 */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageStyle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBA542',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 2,
    textAlign: 'right',
    marginRight: 10,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supportIcon: {
    marginRight: 12,
  },
  supportText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 30,
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CustomerInfoScreen;
