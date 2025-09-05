import api from '../../../shared/services/api';
import { 
  MarketingPost, 
  AIResponse, 
  UploadResponse, 
  AIGenerationRequest, 
  AIGenerationResponse,
  OwnerPostRequest,
  OwnerPostResponse
} from '../types/storeTypes';
import { getTokenFromLocal } from '../../../shared/utils/tokenUtil';

// 유저 정보 조회 API
export const getUserInfo = async (userId: string): Promise<any> => {
  try {
    console.log('유저 정보 조회 시작 - userId:', userId);
    
    const response = await api.get(`/api/users/${userId}`);
    
    console.log('유저 정보 조회 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || '유저 정보 조회에 실패했습니다.');
    }
    
    return response.data.data;
    
  } catch (error: any) {
    console.error('유저 정보 조회 실패:', error);
    
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      throw new Error(error.response.data.message || '유저 정보 조회에 실패했습니다.');
    }
    
    throw new Error('유저 정보 조회에 실패했습니다. 네트워크를 확인해주세요.');
  }
};

// AI 마케팅 글 생성 API
export const generateAIMarketingContent = async (image: string, keywords: string = ''): Promise<string> => {
  try {
    console.log('AI 마케팅 글 생성 시작 - image:', image, 'keywords:', keywords);
    
    // FormData 생성
    const formData = new FormData();
    
    // 이미지 파일 추가 (React Native FormData 방식)
    console.log('이미지 URI:', image);
    
    if (image.startsWith('data:')) {
      // base64 이미지인 경우
      const mimeMatch = image.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const extension = mimeType.includes('jpeg') ? 'jpg' : 'png';
      
      formData.append('image', {
        uri: image,
        type: mimeType,
        name: `marketing_image.${extension}`,
      });
    } else {
      // 파일 URI인 경우 (file:// 또는 기타)
      const isJpg = image.toLowerCase().includes('.jpg') || image.toLowerCase().includes('.jpeg');
      
      formData.append('image', {
        uri: image,
        type: isJpg ? 'image/jpeg' : 'image/png',
        name: isJpg ? 'marketing_image.jpg' : 'marketing_image.png',
      });
    }
    
    console.log('FormData에 이미지 추가 완료');
    
    const tokenData = await getTokenFromLocal();
    const userId = tokenData?.userId || '1';
    const userInfo = await getUserInfo(userId);
    const storeId = userInfo?.storeId || 1;
    
    console.log('토큰 데이터:', tokenData);
    console.log('유저 ID:', userId);
    console.log('유저 정보:', userInfo);
    console.log('스토어 ID:', storeId);
    // 키워드 추가 (빈 문자열이면 기본값 사용)
    formData.append('text', keywords || '커피');
    
    // FormData 내용 확인
    console.log('FormData 생성 완료');
    console.log('FormData _parts:', (formData as any)._parts);
    console.log('API 호출 URL:', '/api/posts/generate/'+storeId);
    console.log('storeId:', storeId);
    
    const response = await api.post('/api/posts/generate/'+storeId, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('AI API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    console.log('응답 데이터 타입:', typeof response.data);
    
    // AI API는 문자열을 직접 반환하지만, 경우에 따라 객체일 수도 있음
    if (typeof response.data === 'string') {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // 객체인 경우 data 필드나 message 필드 확인
      return response.data.data || response.data.message || JSON.stringify(response.data);
    } else {
      return String(response.data);
    }
    
  } catch (error: any) {
    console.error('AI 마케팅 글 생성 실패:', error);
    console.error('에러 상태 코드:', error.response?.status);
    console.error('에러 상태 텍스트:', error.response?.statusText);
    
    // 에러 응답 데이터 확인
    if (error.response?.data) {
      console.error('에러 응답 데이터:', JSON.stringify(error.response.data, null, 2));
      throw new Error(error.response.data.message || `AI 마케팅 글 생성에 실패했습니다. (${error.response.status})`);
    }
    
    // 네트워크 에러 등
    throw new Error(`AI 마케팅 글 생성에 실패했습니다. 네트워크를 확인해주세요. (${error.message})`);
  }
};

// 마케팅 포스트 업로드 API
export const uploadMarketingPost = async (postData: MarketingPost): Promise<UploadResponse> => {
  try {
    console.log('마케팅 포스트 업로드 시작:', postData);
    
    // keychain에서 userId 가져오기
    const tokenData = await getTokenFromLocal();
    const userId = tokenData?.userId || '1';
    
    // userId로 유저 정보 조회해서 storeId 가져오기
    const userInfo = await getUserInfo(userId);
    const storeId = userInfo?.storeId || 1;

    const formData = {
      storeId: storeId,
      content: postData.content,
      images: [postData.image],
      hashtags: ['#커피'] // 하드코딩된 해시태그
    };
    
    const response = await createOwnerPost(formData);
    
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
    postData.hashtags.forEach((tag, index) => {
      formData.append('hashtags', tag);
    });
    
    console.log('FormData 생성 완료:', formData);
    
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

