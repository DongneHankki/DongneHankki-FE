import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFeed } from '../hooks/useFeed';
import { addPostLike, removePostLike } from '../services/feedApi';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3; // 3열 그리드, 좌우 패딩 20씩
const reviewImageWidth = imageSize;
const reviewImageHeight = (imageSize * 3) / 2; // 2:3 비율

const FeedScreen = () => {
  const navigation = useNavigation();
  const {
    selectedTab,
    storePosts,
    reviews,
    profile,
    recommendation,
    commentCounts,
    loading,
    error,
    handleTabChange,
    handleWritePost,
    handleHideRecommendation,
    handleRefresh,
  } = useFeed();

  // 좋아요 관련 상태
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [postLikeCounts, setPostLikeCounts] = useState<Record<number, number>>({});
  const [isLiking, setIsLiking] = useState(false);

  const handlePostPress = (post: any) => {
    // 게시글 상세 화면으로 이동
    (navigation as any).navigate('PostDetail', { post, type: 'post' });
  };

  const handleReviewPress = (review: any) => {
    // 리뷰 상세 화면으로 이동
    (navigation as any).navigate('PostDetail', { review, type: 'review' });
  };

  // 게시물 좋아요 토글
  const handlePostLikeToggle = async (postId: number) => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const isCurrentlyLiked = likedPosts.has(postId);
      
      if (isCurrentlyLiked) {
        await removePostLike(postId);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPostLikeCounts(prev => ({
          ...prev,
          [postId]: Math.max(0, (prev[postId] || 0) - 1)
        }));
      } else {
        await addPostLike(postId);
        setLikedPosts(prev => new Set(prev).add(postId));
        setPostLikeCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1
        }));
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>데이터 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>프로필 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <Image 
            source={profile.image || require('../../../../shared/images/profile.png')} 
            style={styles.profileImage}
          />
          <Text style={styles.restaurantName}>{profile.restaurantName}</Text>
          <Icon name="silverware-fork-knife" size={16} color="#666" />
          <Text style={styles.address}>{profile.address}</Text>
          
          {/* 별점 */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon 
                key={star} 
                name="star" 
                size={20} 
                color={star <= Math.floor(profile.rating) ? "#FFD700" : "#ccc"} 
              />
            ))}
            <Text style={styles.ratingText}>{profile.rating}</Text>
          </View>
          
          <Text style={styles.reviewCount}>리뷰 {profile.reviewCount}개</Text>
        </View>

        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'posts' && styles.activeTab]} 
            onPress={() => handleTabChange('posts')}
          >
            <Text style={[styles.tabText, selectedTab === 'posts' && styles.activeTabText]}>글</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]} 
            onPress={() => handleTabChange('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>리뷰</Text>
          </TouchableOpacity>
        </View>

        {/* 오늘의 게시물 추천 */}
        {selectedTab === 'posts' && recommendation?.show && (
          <View style={styles.recommendationBox}>
            <TouchableOpacity onPress={handleHideRecommendation} style={styles.closeButton}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.recommendationTitle}>오늘의 게시물 추천</Text>
            <Text style={styles.recommendationText}>{recommendation.content}</Text>
            <TouchableOpacity onPress={handleWritePost} style={styles.writeButton}>
              <Text style={styles.writeButtonText}>게시글 작성하기</Text>
              <Icon name="arrow-right" size={16} color="#2E1404" />
            </TouchableOpacity>
          </View>
        )}

        {/* 게시글 그리드 */}
        {selectedTab === 'posts' && (
          <View style={styles.postsContainer}>
            {storePosts && storePosts.length > 0 ? (
              <View style={styles.postsList}>
                {storePosts.map((post, index) => (
                  <TouchableOpacity 
                    key={post.postId || index} 
                    style={styles.postCard}
                    onPress={() => handlePostPress(post)}
                  >
                    {/* 게시글 이미지 */}
                    <Image 
                      source={
                        post.images && post.images.length > 0 
                          ? { uri: post.images[0].imageUrl }
                          : require('../../../../shared/images/food.png')
                      } 
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                    
                    {/* 게시글 내용 */}
                    <View style={styles.postContent}>
                      <Text style={styles.postText} numberOfLines={3}>
                        {post.content}
                      </Text>
                      
                      {/* 게시글 정보 */}
                      <View style={styles.postInfo}>
                        <Text style={styles.postTime}>
                          {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </Text>
                        
                        <View style={styles.postActions}>
                          <View style={styles.actionItem}>
                            <Icon name="comment-outline" size={16} color="#666" />
                            <Text style={styles.actionText}>{commentCounts[post.postId] || 0}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.actionItem} 
                            onPress={() => handlePostLikeToggle(post.postId)}
                            disabled={isLiking}
                          >
                            <Icon 
                              name={likedPosts.has(post.postId) ? "thumb-up" : "thumb-up-outline"} 
                              size={16} 
                              color={likedPosts.has(post.postId) ? "#FF6B35" : "#666"} 
                            />
                            <Text style={[
                              styles.actionText, 
                              likedPosts.has(post.postId) && styles.likedText
                            ]}>
                              {postLikeCounts[post.postId] !== undefined ? postLikeCounts[post.postId] : post.likeCount}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPostsContainer}>
                <Icon name="post-outline" size={48} color="#ccc" />
                <Text style={styles.emptyPostsText}>아직 게시글이 없습니다.</Text>
                <Text style={styles.emptyPostsSubText}>첫 번째 게시글을 작성해보세요!</Text>
              </View>
            )}
          </View>
        )}

        {/* 리뷰 사진 그리드 */}
        {selectedTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            {reviews && reviews.length > 0 ? (
              <View style={styles.imageGrid}>
                {reviews.map((review, index) => (
                  <TouchableOpacity 
                    key={review.id || index} 
                    style={styles.reviewImageContainer}
                    onPress={() => handleReviewPress(review)}
                  >
                    <Image 
                      source={
                        review.images && review.images.length > 0 
                          ? { uri: review.images[0].imageUrl }
                          : require('../../../../shared/images/food.png')
                      }
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyReviewsContainer}>
                <Icon name="star-outline" size={48} color="#ccc" />
                <Text style={styles.emptyReviewsText}>아직 리뷰가 없습니다.</Text>
                <Text style={styles.emptyReviewsSubText}>첫 번째 리뷰를 기다려보세요!</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  editButton: {
    padding: 8,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2E1404',
    fontWeight: 'bold',
  },
  recommendationBox: {
    backgroundColor: '#FFF9C4',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  writeButtonText: {
    fontSize: 14,
    color: '#2E1404',
    fontWeight: 'bold',
    marginRight: 5,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  postsList: {
    // 리스트 레이아웃
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  postInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postActions: {
    flexDirection: 'row',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  // 좋아요 스타일
  likedText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  reviewsContainer: {
    paddingHorizontal: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  reviewImageContainer: {
    width: reviewImageWidth,
    height: reviewImageHeight,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  imageText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  reviewInfo: {
    alignItems: 'center',
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reviewUserName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyPostsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyPostsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyPostsSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyReviewsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyReviewsSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default FeedScreen;
