import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImageUploadComponent from '../components/ImageUpload';
import { createCustomerPost } from '../services/PostAPI';
import { searchStores, StoreData } from '../services/StoreSearchAPI';
import { useAuthStore } from '../../../../shared/store/authStore';

const CustomerPostScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { getAccessToken } = useAuthStore();
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  
  // 가게 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StoreData[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const addHashtag = () => {
    const trimmedInput = hashtagInput.trim();
    if (trimmedInput && hashtags.length < 3) {
      const hashtag = trimmedInput.startsWith('#') ? trimmedInput : `#${trimmedInput}`;
      if (!hashtags.includes(hashtag)) {
        setHashtags([...hashtags, hashtag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  // 가게 검색 함수
  const handleStoreSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchStores(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('가게 검색 실패:', error);
      Alert.alert('오류', '가게 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 가게 선택 함수
  const handleStoreSelect = (store: StoreData) => {
    setSelectedStore(store);
    setSearchQuery(store.name);
    setShowSearchResults(false);
  };

  // 검색어 변경 핸들러
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    // 자동 검색 제거 - 검색 버튼을 통해서만 검색
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchButtonPress = () => {
    if (searchQuery.trim().length >= 2) {
      handleStoreSearch(searchQuery);
    } else {
      Alert.alert('알림', '검색어를 2글자 이상 입력해주세요.');
    }
  };

  const handleUpload = async () => {
    if (!selectedStore) {
      Alert.alert('알림', '가게를 선택해주세요.');
      return;
    }

    try {
      console.log('=== 게시글 업로드 시작 ===');
      console.log('선택된 가게 정보:', {
        storeId: selectedStore.storeId,
        name: selectedStore.name,
        address: selectedStore.address
      });
      console.log('입력된 내용:', {
        content: content,
        images: selectedImages,
        hashtags: hashtags
      });

      const postData = {
        storeId: selectedStore.storeId,
        content: content,
        images: selectedImages,
        hashtags: hashtags,
      };

      console.log('전송할 데이터:', postData);
      console.log('storeId 타입:', typeof selectedStore.storeId);
      console.log('storeId 값:', selectedStore.storeId);
      
      const accessToken = getAccessToken();
      const response = await createCustomerPost(postData, accessToken || undefined);
      
      console.log('게시글 업로드 성공:', response);
      Alert.alert('성공', '게시글이 성공적으로 업로드되었습니다.');
      
      // 성공 후 이전 화면으로 이동
      navigation.goBack();
    } catch (error: any) {
      console.error('게시글 업로드 실패:', error);
      Alert.alert('오류', '게시글 업로드에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2E1404" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.mainTitle}>리뷰 작성</Text>
        
        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>리뷰를 작성해볼까요?</Text>
        </View>

        {/* Store Search Section */}
        <View style={styles.storeInfoCard}>
          <Text style={styles.sectionTitle}>가게 검색</Text>
          
          {/* 검색 입력창 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="가게 이름을 검색하세요"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSearchButtonPress}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchButtonPress}
                disabled={isSearching}
              >
                <Icon 
                  name="search" 
                  size={20} 
                  color={isSearching ? "#ccc" : "#2E1404"} 
                />
              </TouchableOpacity>
            </View>
            {isSearching && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>검색 중...</Text>
              </View>
            )}
          </View>

          {/* 선택된 가게 정보 */}
          {selectedStore && (
            <View style={styles.selectedStoreContainer}>
              <Text style={styles.selectedStoreTitle}>선택된 가게</Text>
              <View style={styles.storeInfo}>
                <View style={styles.storeImageContainer}>
                  <Image
                    source={require('../../../../shared/images/food.png')}
                    style={styles.storeImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.storeDetails}>
                  <Text style={styles.storeName}>{selectedStore.name}</Text>
                  <Text style={styles.storeAddress}>{selectedStore.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changeStoreButton}
                  onPress={() => {
                    setSelectedStore(null);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 검색 결과 목록 */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>검색 결과</Text>
              <View style={styles.searchResultsList}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.storeId.toString()}
                    style={styles.searchResultItem}
                    onPress={() => handleStoreSelect(item)}
                  >
                    <View style={styles.storeImageContainer}>
                      <Image
                        source={require('../../../../shared/images/food.png')}
                        style={styles.storeImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.storeDetails}>
                      <Text style={styles.storeName}>{item.name}</Text>
                      <Text style={styles.storeAddress}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 검색 결과가 없을 때 */}
          {showSearchResults && searchResults.length === 0 && !isSearching && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
            </View>
          )}
        </View>

        {/* Photo Upload Section */}
        <ImageUploadComponent
          selectedImages={selectedImages}
          onImagesChange={setSelectedImages}
        />

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>리뷰 내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="이 가게에 대한 리뷰를 작성해주세요"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Hashtag Section */}
        <View style={styles.hashtagSection}>
          <Text style={styles.sectionTitle}>해시태그</Text>
          <View style={styles.hashtagInputContainer}>
            <TextInput
              style={styles.hashtagInput}
              placeholder="해시태그를 입력하세요 (최대 3개)"
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={addHashtag}
              returnKeyType="done"
              maxLength={20}
            />
            {hashtagInput.trim() && hashtags.length < 3 && (
              <TouchableOpacity style={styles.addHashtagButton} onPress={addHashtag}>
                <Text style={styles.addHashtagButtonText}>추가</Text>
              </TouchableOpacity>
            )}
          </View>
          {hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {hashtags.map((hashtag, index) => (
                <View key={index} style={styles.hashtagItem}>
                  <Text style={styles.hashtagText}>{hashtag}</Text>
                  <TouchableOpacity
                    style={styles.removeHashtagButton}
                    onPress={() => removeHashtag(index)}
                  >
                    <Icon name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>업로드</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  placeholder: {
    width: 24,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E1404',
    marginTop: 20,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  storeInfoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 12,
  },
  storeSelectArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E1404',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FBA542',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStoreContainer: {
    marginBottom: 16,
  },
  selectedStoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E1404',
    marginBottom: 8,
  },
  changeStoreButton: {
    padding: 8,
  },
  searchResultsContainer: {
    marginTop: 8,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E1404',
    marginBottom: 8,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
  },

  contentSection: {
    marginBottom: 24,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#fafafa',
  },
  hashtagSection: {
    marginBottom: 24,
  },
  hashtagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hashtagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginRight: 8,
  },
  addHashtagButton: {
    backgroundColor: '#FBA542',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addHashtagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBA542',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E1404',
    marginRight: 4,
  },
  removeHashtagButton: {
    padding: 2,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  uploadButton: {
    backgroundColor: '#2E1404',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomerPostScreen;
