import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFeed } from '../hooks/useFeed';

const FeedScreen = () => {
  const {
    selectedTab,
    posts,
    reviews,
    profile,
    recommendation,
    loading,
    error,
    handleTabChange,
    handleWritePost,
    handleEditProfile,
    handleHideRecommendation,
    handleRefresh,
  } = useFeed();

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
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <Icon name="pencil" size={24} color="#2E1404" />
        </TouchableOpacity>
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
            source={{ uri: profile.profileImage }} 
            style={styles.profileImage}
          />
          <Text style={styles.restaurantName}>{profile.restaurantName}</Text>
          <Icon name="silverware-fork-knife" size={16} color="#666" />
          <Text style={styles.address}>{profile.address}</Text>
          
          {/* 별점 */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon key={star} name="star" size={20} color="#FFD700" />
            ))}
          </View>
          
          <Text style={styles.followers}>팔로워 {profile.followers}</Text>
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
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleHideRecommendation}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationText}>{recommendation.text}</Text>
            <TouchableOpacity style={styles.writeButton} onPress={handleWritePost}>
              <Text style={styles.writeButtonText}>글쓰러 가기</Text>
              <Icon name="arrow-right" size={16} color="#2E1404" />
            </TouchableOpacity>
          </View>
        )}

        {/* 게시물 목록 */}
        {selectedTab === 'posts' && (
          <View style={styles.postsContainer}>
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postImageContainer}>
                  {post.image ? (
                    <Image source={{ uri: post.image }} style={styles.postImage} />
                  ) : (
                    <Icon name="image" size={40} color="#ccc" />
                  )}
                </View>
                <View style={styles.postContent}>
                  <Text style={styles.postText}>{post.content}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <Icon name="comment-outline" size={16} color="#666" />
                      <Text style={styles.statText}>{post.comments}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="thumb-up-outline" size={16} color="#666" />
                      <Text style={styles.statText}>{post.likes}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 리뷰 목록 */}
        {selectedTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon 
                        key={star} 
                        name="star" 
                        size={16} 
                        color={star <= review.rating ? "#FFD700" : "#ccc"} 
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewTime}>{review.time}</Text>
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
                <Text style={styles.reviewAuthor}>- {review.author}</Text>
              </View>
            ))}
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
    paddingTop: 50,
    paddingBottom: 20,
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
    marginBottom: 10,
  },
  followers: {
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
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  postContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 14,
    color: '#2E1404',
    lineHeight: 20,
    marginBottom: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  reviewsContainer: {
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewTime: {
    fontSize: 12,
    color: '#999',
  },
  reviewContent: {
    fontSize: 14,
    color: '#2E1404',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default FeedScreen;
