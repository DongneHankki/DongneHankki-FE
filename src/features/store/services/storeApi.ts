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

// AI 마케팅 글 생성 API
export const generateAIMarketingContent = async (image: string, keywords: string = ''): Promise<string> => {
  try {
    console.log('AI 마케팅 글 생성 시작 - image:', image, 'keywords:', keywords);
    
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
    
    // API 호출
    const response = await api.post<AIGenerationResponse>('/api/posts/generate/1', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('AI API 응답 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'AI 마케팅 글 생성에 실패했습니다.');
    }
    
    return response.data.data;
    
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
    console.log('마케팅 포스트 업로드 시작:', postData);
    
    // createOwnerPostFormData를 사용하여 실제 API 호출
    const formData = {
      storeId: 1, // TODO: 실제 storeId 가져오기
      content: postData.content,
      images: [postData.image],
      hashtags: ['#커피'] // 하드코딩된 해시태그
    };
    
    const response = await createOwnerPostFormData(formData);
    
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

// 사장님 게시글 작성 API (multipart/form-data)
export const createOwnerPostFormData = async (data: {
  storeId: number;
  content: string;
  images: string[];
  hashtags: string[];
}): Promise<any> => {
  try {
    console.log('사장님 게시글 작성 시작:', data);
    
    const formData = new FormData();
    
    // storeId 추가
    formData.append('storeId', data.storeId.toString());
    
    // content 추가
    formData.append('content', data.content);
    
    // images 추가 (파일 URI를 File 객체로 변환)
    data.images.forEach((imageUri, index) => {
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      } as any;
      formData.append('images', imageFile);
    });
    
    // hashtags 추가 (배열을 JSON 문자열로 변환)
    formData.append('hashtags', JSON.stringify(data.hashtags));
    
    console.log('FormData 생성 완료');
    
    const response = await api.post('/api/posts/owners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('사장님 게시글 작성 성공:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('사장님 게시글 작성 에러:', error);
    console.error('에러 응답 데이터:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};
