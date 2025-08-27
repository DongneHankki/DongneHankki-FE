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
