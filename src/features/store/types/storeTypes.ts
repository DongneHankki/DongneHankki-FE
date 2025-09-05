export interface MarketingPost {
  image: string;
  content: string;
}

export interface AIResponse {
  status: string;
  data: string;
  message?: string;
}

export interface UploadResponse {
  status: string;
  data?: any;
  message?: string;
}

// AI 마케팅 게시글 생성 API 타입
export interface AIGenerationRequest {
  image: string;
  text: string;
}

export interface AIGenerationResponse {
  content: string;
  tag: string[]
}

// 사장님 게시글 작성 API 타입
export interface OwnerPostRequest {
  storeId: number;
  content: string;
  images: string[];
  hashtags: string[];
}

export interface OwnerPostResponse {
  status: string;
  code: string;
  message: string;
  data: any;
}
