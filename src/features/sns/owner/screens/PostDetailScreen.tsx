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
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Post, Comment, Review } from '../types/feedTypes';
import { getPostDetail, getPostComments, updatePost, deletePost, createComment, updateComment, deleteComment, addPostLike, removePostLike } from '../services/feedApi';

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
  
  // 수정/삭제 관련 상태
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // 댓글 관련 상태
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // 댓글 수정/삭제 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  
  // 좋아요 관련 상태
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

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
        // API 응답에서 좋아요 상태 설정
        setIsLiked(postDetail.liked || false);
        setLikeCount(postDetail.likeCount || 0);
      } else if (type === 'review' && initialReview && initialReview.postId) {
        const [reviewDetail, reviewComments] = await Promise.all([
          getPostDetail(initialReview.postId),
          getPostComments(initialReview.postId)
        ]);
        
        // Post 타입을 Review 타입으로 변환
        const reviewData: Review = {
          ...initialReview,
          postId: reviewDetail.postId,
          content: reviewDetail.content,
          images: reviewDetail.images,
          hashtags: reviewDetail.hashtags,
          likeCount: reviewDetail.likeCount,
          liked: reviewDetail.liked,
          createdAt: reviewDetail.createdAt
        };
        
        setReview(reviewData);
        setComments(reviewComments);
        // API 응답에서 좋아요 상태 설정
        setIsLiked(reviewDetail.liked || false);
        setLikeCount(reviewDetail.likeCount || 0);
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
        rating: null,
        userId: post.userId
      };
         } else if (type === 'review' && review) {
       return {
         name: review.userName,
         content: review.content,
         time: review.createdAt || '',
         images: review.images || null,
         hashtags: review.hashtags, 
         likeCount: review.likeCount || 0,
         rating: review.rating,
         userId: review.userId
       };
     }
    return null;
  };

  // 본인 게시글인지 확인 (일단 모든 게시글에 수정/삭제 버튼 표시)
  const isOwner = () => {
    return true; // 임시로 모든 게시글에 수정/삭제 버튼 표시
  };

  // 수정 모달 열기
  const handleEdit = () => {
    const currentData = getDisplayData();
    if (currentData) {
      setEditContent(currentData.content);
      setEditHashtags(currentData.hashtags?.join(', ') || '');
      setShowEditModal(true);
    }
    setShowOptions(false);
  };

  // 게시글 수정
  const handleUpdate = async () => {
    if (!post && !review) return;
    
    setIsUpdating(true);
    try {
      const postId = post?.postId || review?.postId;
      if (!postId) throw new Error('게시글 ID를 찾을 수 없습니다.');

      const hashtagArray = editHashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      await updatePost(postId, {
        content: editContent.trim(),
        hashtags: hashtagArray
      });

      // 로컬 상태 업데이트
      if (type === 'post' && post) {
        setPost({ ...post, content: editContent.trim(), hashtags: hashtagArray });
      } else if (type === 'review' && review) {
        setReview({ ...review, content: editContent.trim(), hashtags: hashtagArray });
      }

      setShowEditModal(false);
      Alert.alert('성공', '게시글이 수정되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '게시글 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 게시글 삭제
  const handleDelete = () => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
    setShowOptions(false);
  };

  const confirmDelete = async () => {
    if (!post && !review) return;
    
    setIsDeleting(true);
    try {
      const postId = post?.postId || review?.postId;
      if (!postId) throw new Error('게시글 ID를 찾을 수 없습니다.');

      await deletePost(postId);
      
      // 삭제 성공 후 상태 업데이트
      setIsDeleted(true);
      setPost(null);
      setReview(null);
      setComments([]);
      
      Alert.alert('성공', '게시글이 삭제되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    if (!post && !review) {
      Alert.alert('오류', '게시글 정보를 찾을 수 없습니다.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const postId = post?.postId || review?.postId;
      if (!postId) throw new Error('게시글 ID를 찾을 수 없습니다.');

      await createComment(postId, newComment);
      
      // 댓글 작성 성공 후 댓글 목록 새로고침
      await loadComments(postId);
      
      // 입력 필드 초기화
      setNewComment('');
      
      Alert.alert('성공', '댓글이 작성되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 댓글 목록 새로고침
  const loadComments = async (postId: number) => {
    try {
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
    } catch (error: any) {
      console.error('댓글 조회 에러:', error);
    }
  };

  // 댓글 수정 시작
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  // 댓글 수정 완료
  const handleUpdateComment = async () => {
    if (!editingCommentId || !editCommentContent.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    setIsUpdatingComment(true);
    try {
      await updateComment(editingCommentId, editCommentContent);
      
      // 댓글 목록 새로고침
      const postId = post?.postId || review?.postId;
      if (postId) {
        await loadComments(postId);
      }
      
      // 수정 상태 초기화
      setEditingCommentId(null);
      setEditCommentContent('');
      
      Alert.alert('성공', '댓글이 수정되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '댓글 수정에 실패했습니다.');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => confirmDeleteComment(commentId)
        }
      ]
    );
  };

  const confirmDeleteComment = async (commentId: number) => {
    setIsDeletingComment(true);
    try {
      await deleteComment(commentId);
      
      // 댓글 목록 새로고침
      const postId = post?.postId || review?.postId;
      if (postId) {
        await loadComments(postId);
      }
      
      Alert.alert('성공', '댓글이 삭제되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setIsDeletingComment(false);
    }
  };

  // 본인 댓글인지 확인 (임시로 모든 댓글에 수정/삭제 버튼 표시)
  const isMyComment = (comment: Comment) => {
    return true; // 임시로 모든 댓글에 수정/삭제 버튼 표시
  };

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (isLiking) return;
    
    const postId = post?.postId || review?.postId;
    if (!postId) {
      Alert.alert('오류', '게시글 정보를 찾을 수 없습니다.');
      return;
    }
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await removePostLike(postId);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await addPostLike(postId);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
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

  if (isDeleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#2E1404" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.deletedContainer}>
          <Icon name="delete" size={64} color="#ccc" />
          <Text style={styles.deletedText}>게시글이 삭제되었습니다</Text>
          <TouchableOpacity style={styles.backToListButton} onPress={handleGoBack}>
            <Text style={styles.backToListButtonText}>목록으로 돌아가기</Text>
          </TouchableOpacity>
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
        {isOwner() && (
          <TouchableOpacity 
            style={styles.optionsButton} 
            onPress={() => setShowOptions(!showOptions)}
          >
            <Icon name="dots-vertical" size={24} color="#2E1404" />
          </TouchableOpacity>
        )}
      </View>

      {/* 옵션 메뉴 */}
      {showOptions && (
        <View style={styles.optionsMenu}>
          <TouchableOpacity style={styles.optionItem} onPress={handleEdit}>
            <Icon name="pencil" size={20} color="#2E1404" />
            <Text style={styles.optionText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
            <Icon name="delete" size={20} color="#FF4444" />
            <Text style={[styles.optionText, { color: '#FF4444' }]}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      )}

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
                <View key={index} style={styles.hashtagButton}>
                  <Icon name="map-marker" size={12} color="#666" />
                  <Text style={styles.hashtagText}>{hashtag.replace('#', '')}</Text>
                </View>
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
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleLikeToggle}
            disabled={isLiking}
          >
            <Icon 
              name={isLiked ? "thumb-up" : "thumb-up-outline"} 
              size={20} 
              color={isLiked ? "#FF6B35" : "#666"} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>
          
          {/* 댓글 작성 */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="댓글을 입력하세요..."
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={[styles.commentSubmitButton, !newComment.trim() && styles.commentSubmitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.commentSubmitText, !newComment.trim() && styles.commentSubmitTextDisabled]}>
                  등록
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentNickname}>{comment.nickname}</Text>
                  <View style={styles.commentHeaderRight}>
                    <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                    {isMyComment(comment) && (
                      <TouchableOpacity 
                        style={styles.commentActionButton}
                        onPress={() => {
                          Alert.alert(
                            '댓글 옵션',
                            '댓글을 수정하거나 삭제하시겠습니까?',
                            [
                              { text: '취소', style: 'cancel' },
                              { text: '수정', onPress: () => handleEditComment(comment) },
                              { text: '삭제', style: 'destructive', onPress: () => handleDeleteComment(comment.id) }
                            ]
                          );
                        }}
                      >
                        <Icon name="dots-vertical" size={16} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {editingCommentId === comment.id ? (
                  <View style={styles.commentEditContainer}>
                    <TextInput
                      style={styles.commentEditInput}
                      value={editCommentContent}
                      onChangeText={setEditCommentContent}
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={styles.commentEditButtons}>
                      <TouchableOpacity 
                        style={styles.commentEditButton}
                        onPress={handleCancelEditComment}
                      >
                        <Text style={styles.commentEditButtonText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.commentEditButton, styles.commentEditButtonPrimary]}
                        onPress={handleUpdateComment}
                        disabled={isUpdatingComment || !editCommentContent.trim()}
                      >
                        {isUpdatingComment ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.commentEditButtonTextPrimary}>수정</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity style={styles.commentLikeButton}>
                        <Icon name="thumb-up-outline" size={14} color="#666" />
                        <Text style={styles.commentLikeText}>{comment.likeCount || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.commentReplyButton}>
                        <Text style={styles.commentReplyText}>답글쓰기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>아직 댓글이 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 수정 모달 */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>게시글 수정</Text>
            <TouchableOpacity 
              onPress={handleUpdate}
              disabled={isUpdating || !editContent.trim()}
            >
              <Text style={[
                styles.modalSaveText,
                (!editContent.trim() || isUpdating) && styles.modalSaveTextDisabled
              ]}>
                {isUpdating ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>내용</Text>
              <TextInput
                style={styles.editContentInput}
                value={editContent}
                onChangeText={setEditContent}
                placeholder="내용을 입력하세요"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editSection}>
              <Text style={styles.editLabel}>해시태그</Text>
              <TextInput
                style={styles.editHashtagInput}
                value={editHashtags}
                onChangeText={setEditHashtags}
                placeholder="해시태그를 쉼표로 구분하여 입력하세요"
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    marginTop: 10,
  },
  hashtagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  // 좋아요 스타일
  likedText: {
    color: '#FF6B35',
    fontWeight: '600',
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
  // 옵션 메뉴 스타일
  optionsButton: {
    padding: 5,
  },
  optionsMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 120,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#2E1404',
    fontWeight: '500',
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E1404',
    marginBottom: 8,
  },
  editContentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editHashtagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // 삭제된 상태 스타일
  deletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  deletedText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  backToListButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 댓글 작성 스타일
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  commentSubmitButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  commentSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentSubmitTextDisabled: {
    color: '#999',
  },
  // 댓글 수정/삭제 스타일
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  commentActionButton: {
    padding: 4,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentLikeText: {
    fontSize: 12,
    color: '#666',
  },
  commentReplyButton: {
    // 답글 버튼 스타일
  },
  commentReplyText: {
    fontSize: 12,
    color: '#666',
  },
  commentEditContainer: {
    marginTop: 8,
  },
  commentEditInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  commentEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  commentEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  commentEditButtonPrimary: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  commentEditButtonText: {
    fontSize: 14,
    color: '#666',
  },
  commentEditButtonTextPrimary: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default PostDetailScreen;
