import api from '../../../shared/services/api';
import { MarketingPost, AIResponse, UploadResponse } from '../types/storeTypes';

// AI 마케팅 글 생성 API
export const generateAIMarketingContent = async (image: string): Promise<string> => {
  try {
    // 실제 API가 구현되기 전까지는 모의 응답을 반환
    // const response = await api.post(`/ai/generate-marketing`, { image });
    // return response.data.data;
    
    // 모의 AI 응답
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 지연
    
    const mockResponses = [
      "오늘도 깨끗하게 정리된 주방에서 맛있는 음식을 만들어드리겠습니다! 손님이 안 보셔도 매일 청소하는 것이 저희의 자존심입니다. 🧹✨",
      "마감 청소 완료! 내일도 신선한 재료로 정성스럽게 요리하겠습니다. 깨끗한 환경에서 만드는 음식이 더욱 맛있답니다. 🍽️",
      "하루의 마무리, 주방 정리 끝! 내일도 최고의 서비스로 찾아주시는 고객님들을 기다리겠습니다. 항상 감사합니다! 🙏",
      "오늘도 열심히 일한 주방을 깨끗하게 정리했습니다. 내일도 같은 마음으로 정성스럽게 요리하겠습니다. 맛있는 하루 되세요! 😊"
    ];
    
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  } catch (error: any) {
    console.error('AI 마케팅 글 생성 실패:', error);
    throw new Error('AI 마케팅 글 생성에 실패했습니다.');
  }
};

// 마케팅 포스트 업로드 API
export const uploadMarketingPost = async (postData: MarketingPost): Promise<UploadResponse> => {
  try {
    // 실제 API가 구현되기 전까지는 모의 응답을 반환
    // const response = await api.post(`/marketing/upload`, postData);
    // return response.data;
    
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
