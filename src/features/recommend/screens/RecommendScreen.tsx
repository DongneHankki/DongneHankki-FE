import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../shared/store/authStore';
import { getRecommendPosts, RecommendPost } from '../services/recommendAPI';
import FoodGrid from '../components/FoodGrid';

const RecommendScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { getLoginId } = useAuthStore();
  const loginId = getLoginId() || '사용자';
  
  const [recommendPosts, setRecommendPosts] = useState<RecommendPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 추천 게시글 데이터 로드
  useEffect(() => {
    loadRecommendPosts();
  }, []);

  const loadRecommendPosts = async () => {
    try {
      setLoading(true);
      const response = await getRecommendPosts(10);
      setRecommendPosts(response.values);
      console.log('추천 게시글 로드 완료:', response.values.length, '개');
    } catch (error: any) {
      console.error('추천 게시글 로드 실패:', error);
      Alert.alert('오류', '추천 게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 추천 게시글 클릭 핸들러
  const handlePostPress = (post: RecommendPost) => {
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

  // 추천 게시글 데이터를 FoodGrid용으로 변환
  const getFoodItems = () => {
    if (recommendPosts.length === 0) {
      return [];
    }

    // 추천 게시글 데이터를 FoodGrid용으로 변환
    return recommendPosts.map((post, index) => ({
      id: post.postId,
      name: post.storeName,
      imageUrl: post.images && post.images.length > 0 ? post.images[0].imageUrl : undefined,
      image: require('../../../shared/images/food.png'), // fallback 이미지
      postId: post.postId
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={styles.title}>오늘의 추천</Text>
          <Text style={styles.subtitle}>✨{loginId}님 이런 매장은 어때요?</Text>
          <View style={styles.divider} />
        </View>


        {/* 음식 그리드 - 추천 게시글이 있을 때만 표시 */}
        {recommendPosts.length > 0 && (
          <FoodGrid 
            foodItems={getFoodItems()}
            onItemPress={(item) => {
              console.log('선택된 음식:', item.name);
            }}
          />
        )}
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
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  divider: {
    height: 2,
    backgroundColor: '#FF6B35',
    width: '100%',
  },

  // 추천 게시글 섹션 스타일
  recommendSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  postCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    fontSize: 12,
  },
  postInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 11,
    color: '#999',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  placeholderContainer: {
    padding: 20,
    paddingTop: 0,
  },
  placeholder: {
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecommendScreen;
