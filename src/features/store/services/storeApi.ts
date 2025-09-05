import api from '../../../shared/services/api';
import { getUserIdFromToken } from '../../../shared/utils/jwtUtil';
import { 
  MarketingPost, 
  AIResponse, 
  UploadResponse, 
  AIGenerationRequest, 
  AIGenerationResponse,
  OwnerPostRequest,
  OwnerPostResponse
} from '../types/storeTypes';

// 유저 정보 조회 인터페이스
interface UserInfo {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: 'OWNER' | 'CUSTOMER';
  storeId: number;
  birth: string;
  profileImageUrl: string;
}

interface UserInfoResponse {
  status: string;
  code: string;
  message: string;
  data: UserInfo;
}

// 유저 ID로 storeId 조회
export const getStoreIdByUserId = async (userId: number): Promise<number | null> => {
  try {
    console.log('유저 정보 조회 시작 - userId:', userId);
    
    const response = await api.get<UserInfoResponse>(`/api/users/${userId}`);
    
    console.log('유저 정보 조회 성공:', response.data);
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.storeId || null;
    }
    
    return null;
  } catch (error: any) {
    console.error('유저 정보 조회 실패:', error);
    
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
    }
    
    return null;
  }
};

// 현재 로그인한 유저의 storeId 조회
export const getCurrentUserStoreId = async (): Promise<number | null> => {
  try {
    // 토큰을 가져와야 합니다
    const { getTokenFromLocal } = await import('../../../shared/utils/tokenUtil');
    const tokens = await getTokenFromLocal();
    
    if (!tokens?.accessToken) {
      console.error('액세스 토큰을 찾을 수 없습니다.');
      return null;
    }
    
    const userId = getUserIdFromToken(tokens.accessToken);
    if (!userId) {
      console.error('유저 ID를 찾을 수 없습니다.');
      return null;
    }
    
    // userId를 숫자로 변환
    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      console.error('유효하지 않은 유저 ID:', userId);
      return null;
    }
    
    return await getStoreIdByUserId(userIdNumber);
  } catch (error: any) {
    console.error('현재 유저의 storeId 조회 실패:', error);
    return null;
  }
}; 

// AI 마케팅 글 생성 API
export const generateAIMarketingContent = async (image: string, keywords: string = '', storeId: number): Promise<AIGenerationResponse> => {
  try {
    console.log('AI 마케팅 글 생성 시작 - image:', image, 'keywords:', keywords, 'storeId:', storeId);
    
    // FormData 생성
    const formData = new FormData();
    
    // 이미지 파일 추가 (base64 또는 파일 URI)
    if (image.startsWith('data:')) {
      // base64 이미지인 경우
      const imageFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'marketing_image.jpg',
      } as any;
      formData.append('image', imageFile);
    } else if (image.startsWith('file://')) {
      // 로컬 파일인 경우
      const imageFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'marketing_image.jpg',
      } as any;
      formData.append('image', imageFile);
    } else {
      // URI인 경우
      const imageFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'marketing_image.jpg',
      } as any;
      formData.append('image', imageFile);
    }
    
    // 키워드 추가
    formData.append('text', keywords);
    
    console.log('FormData 생성 완료:', formData);
    
    // API 호출 - storeId를 path parameter로 전달
    const response = await api.post<AIGenerationResponse>(`/api/posts/generate/${storeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('AI API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
    
  } catch (error: any) {
    console.error('AI 마케팅 글 생성 실패:', error);
    
    // 에러 응답 데이터 확인
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      throw new Error(error.response.data.message || 'AI 마케팅 글 생성에 실패했습니다.');
    }
    
    // 네트워크 에러 등
    throw new Error('AI 마케팅 글 생성에 실패했습니다. 네트워크를 확인해주세요.');
  }
};

// 마케팅 포스트 업로드 API
export const uploadMarketingPost = async (postData: MarketingPost): Promise<UploadResponse> => {
  try {
    // 모의 업로드 응답
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 지연
    
    return {
      status: 'success',
      data: { postId: Date.now() },
      message: '마케팅 포스트가 성공적으로 업로드되었습니다.'
    };
  } catch (error: any) {
    console.error('마케팅 포스트 업로드 실패:', error);
    throw new Error('마케팅 포스트 업로드에 실패했습니다.');
  }
};

// 사장님 게시글 작성 API
export const createOwnerPost = async (postData: OwnerPostRequest): Promise<OwnerPostResponse> => {
  try {
    console.log('사장님 게시글 작성 시작:', postData);
    
    // FormData 생성
    const formData = new FormData();
    
    // storeId 추가
    formData.append('storeId', postData.storeId.toString());
    
    // content 추가
    formData.append('content', postData.content);
    
    // images 추가 (여러 이미지 지원)
    postData.images.forEach((image, index) => {
      if (image.startsWith('data:')) {
        // base64 이미지인 경우
        const imageFile = {
          uri: image,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any;
        formData.append('images', imageFile);
      } else if (image.startsWith('file://')) {
        // 로컬 파일인 경우
        const imageFile = {
          uri: image,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any;
        formData.append('images', imageFile);
      } else {
        // URI인 경우
        const imageFile = {
          uri: image,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any;
        formData.append('images', imageFile);
      }
    });
    
    // hashtags 추가 (배열 형태로 전송)
    if (postData.hashtags && Array.isArray(postData.hashtags)) {
      postData.hashtags.forEach((tag, index) => {
        formData.append('hashtags', tag);
      });
    }
    
    // FormData 내용 확인
    console.log('FormData 생성 완료');
    console.log('storeId:', postData.storeId);
    console.log('content:', postData.content);
    console.log('images:', postData.images);
    console.log('hashtags:', postData.hashtags);
    
    // API 호출
    const response = await api.post<OwnerPostResponse>('/api/posts/owners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('사장님 게시글 작성 API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || '게시글 작성에 실패했습니다.');
    }
    
    return response.data;
    
  } catch (error: any) {
    console.error('사장님 게시글 작성 실패:', error);
    
    // 에러 응답 데이터 확인
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      throw new Error(error.response.data.message || '게시글 작성에 실패했습니다.');
    }
    
    // 네트워크 에러 등
    throw new Error('게시글 작성에 실패했습니다. 네트워크를 확인해주세요.');
  }
};
