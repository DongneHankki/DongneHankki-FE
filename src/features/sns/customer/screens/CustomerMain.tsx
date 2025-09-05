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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFollowedPosts, FollowPost } from '../services/FollowPostAPI';

interface ReviewItemProps {
  post: FollowPost;
  onPress: () => void;
}

const ReviewItem = ({ post, onPress }: ReviewItemProps) => {
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}.${month}.${day}.${weekday}`;
  };

  return (
    <TouchableOpacity style={styles.reviewItem} onPress={onPress}>
      <View style={styles.reviewHeader}>
        <View style={styles.starContainer}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.shopName}>{post.storeName}</Text>
        </View>
      </View>
      <View style={styles.reviewContent}>
        <View style={styles.reviewTextContainer}>
          <Text style={styles.reviewText}>{post.content}</Text>
          <Text style={styles.reviewDate}>{formatDate(post.createdAt)}</Text>
        </View>
        {post.images && post.images.length > 0 ? (
          <Image 
            source={{ uri: post.images[0].imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FollowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followedPosts, setFollowedPosts] = useState<FollowPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 팔로우 게시글 데이터 로드
  useEffect(() => {
    loadFollowedPosts();
  }, []);

  const loadFollowedPosts = async () => {
    try {
      setLoading(true);
      const response = await getFollowedPosts(10);
      setFollowedPosts(response.values);
      console.log('팔로우 게시글 로드 완료:', response.values.length, '개');
    } catch (error: any) {
      console.error('팔로우 게시글 로드 실패:', error);
      Alert.alert('오류', '팔로우 게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 기능 구현
  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // 실제 API 호출 대신 임시 데이터로 검색 시뮬레이션
      const mockStores = [
        { id: 1, name: "5감족발", storeId: 1, type: "restaurant" },
        { id: 2, name: "가게2", storeId: 102, type: "cafe" },
        { id: 3, name: "가게3", storeId: 103, type: "restaurant" },
        { id: 4, name: "가게4", storeId: 104, type: "cafe" },
        { id: 5, name: "맛있는 치킨집", storeId: 105, type: "restaurant" },
        { id: 6, name: "스타벅스 강남점", storeId: 106, type: "cafe" },
      ];

      const filtered = mockStores.filter(store => 
        store.name.toLowerCase().includes(text.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreSelect = (store: any) => {
    // 특정 Owner의 FeedScreen으로 이동
    navigation.navigate('OwnerFeed', { 
      storeId: store.storeId,
      storeName: store.name,
      userType: 'customer' // customer가 owner 화면을 보는 것임을 표시
    });
    
    // 검색창 초기화
    setSearchText('');
    setSearchResults([]);
  };

  const handlePostPress = (post: FollowPost) => {
    // 게시글 상세 화면으로 이동
    console.log('게시글 선택:', post.postId);
    navigation.navigate('PostDetail', { 
      post: {
        postId: post.postId,
        content: post.content,
        storeId: post.storeId,
        storeName: post.storeName,
        userId: post.userId,
        userNickname: post.userNickname,
        uploderRole: post.uploderRole,
        images: post.images,
        hashtags: post.hashtags,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
        liked: post.liked
      },
      type: 'post'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FBA542" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="가게 이름으로 검색"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          {/* 검색 결과 표시 */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.searchResultItem}
                  onPress={() => handleStoreSelect(store)}
                >
                  <Icon 
                    name={store.type === 'restaurant' ? 'restaurant' : 'local-cafe'} 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.searchResultText}>{store.name}</Text>
                  <Icon name="chevron-right" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>팔로우</Text>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>팔로우 게시글을 불러오는 중...</Text>
            </View>
          ) : followedPosts.length > 0 ? (
            followedPosts.map((post) => (
              <ReviewItem
                key={post.postId}
                post={post}
                onPress={() => handlePostPress(post)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>팔로우한 매장의 게시글이 없습니다</Text>
              <Text style={styles.emptySubText}>매장을 팔로우하고 최신 소식을 받아보세요!</Text>
            </View>
          )}
        </ScrollView>
      </View>

             {/* Floating Action Button */}
       <TouchableOpacity 
         style={styles.fab}
         onPress={() => navigation.navigate('CustomerPost')}
       >
         <Icon name="edit" size={24} color="#FFF" />
       </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3C35B',
  },
      header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#F3C35B',
    },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoStar: {
    fontSize: 20,
    color: '#FFF',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 80,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  reviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cameraIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 15,
    backgroundColor: '#FBA542',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTab: {
    color: '#000',
    fontWeight: '600',
  },
 });