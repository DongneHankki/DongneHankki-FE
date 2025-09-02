import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Post, Comment, Review } from '../types/feedTypes';
import { getPostDetail, getPostComments } from '../services/feedApi';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  PostDetail: { 
    post?: Post; 
    review?: Review; 
    type: 'post' | 'review';
  };
};

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

interface PostDetailScreenProps {
  route?: PostDetailScreenRouteProp;
}

const PostDetailScreen = ({ route }: PostDetailScreenProps) => {
  const navigation = useNavigation();
  const { post: initialPost, review: initialReview, type } = route?.params || {};
  
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [review, setReview] = useState<Review | null>(initialReview || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'post' && initialPost) {
        const [postDetail, postComments] = await Promise.all([
          getPostDetail(initialPost.postId),
          getPostComments(initialPost.postId)
        ]);

        setPost(postDetail);
        setComments(postComments);
      } else if (type === 'review' && initialReview) {
        const reviewComments = await getPostComments(initialReview.id);
        setReview(initialReview);
        setComments(reviewComments);
      }
    } catch (err: any) {
      console.error('데이터 로드 에러:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const getDisplayData = () => {
    if (type === 'post' && post) {
      return {
        name: post.storeName,
        content: post.content,
        time: post.createdAt,
        images: post.images,
        hashtags: post.hashtags,
        likeCount: post.likeCount,
        rating: null
      };
         } else if (type === 'review' && review) {
       return {
         name: review.userName,
         content: review.content,
         time: review.createdAt || '',
         images: review.images || null,
         hashtags: review.hashtags, 
         likeCount: 0,
         rating: review.rating
       };
     }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayData = getDisplayData();
  if (!displayData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>데이터를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#2E1404" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 게시글/리뷰 정보 */}
        <View style={styles.postHeader}>
          <View style={styles.postInfo}>
            <View style={styles.authorInfo}>
              <Image 
                source={require('../../../../shared/images/profile.png')}
                style={styles.authorProfileImage}
              />
              <Text style={styles.authorName}>{displayData.name}</Text>
            </View>
            <Text style={styles.postTime}>{formatDate(displayData.time)}</Text>
          </View>
        </View>

        {/* 이미지 */}
        {displayData.images && displayData.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: displayData.images[0].imageUrl }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* 내용 */}
        <View style={styles.contentContainer}>
          <Text style={styles.postContent}>{displayData.content}</Text>
          
          {displayData.hashtags && displayData.hashtags.length > 0 && (
            <View style={styles.hashtagContainer}>
              {displayData.hashtags.map((hashtag, index) => (
                <Text key={index} style={styles.hashtag}>#{hashtag}</Text>
              ))}
            </View>
          )}
           {displayData.hashtags && displayData.hashtags.length > 0 && (
             <View style={styles.hashtagContainer}>
               {displayData.hashtags.map((hashtag, index) => (
                 <Text key={index} style={styles.hashtag}>#{hashtag}</Text>
               ))}
             </View>
           )}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionContainer}>
          <View style={styles.actionItem}>
            <Icon name="comment-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </View>
          <View style={styles.actionItem}>
            <Icon name="thumb-up-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{displayData.likeCount}</Text>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>
          
          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentNickname}>{comment.nickname}</Text>
                  <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>아직 댓글이 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 10,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  postHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  postTime: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#f5f5f5',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    fontSize: 14,
    color: '#FF6B35',
    marginRight: 10,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  commentsSection: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
    marginBottom: 15,
  },
  commentItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentNickname: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#999',
  },
});

export default PostDetailScreen;
