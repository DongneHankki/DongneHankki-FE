export interface Post {
  postId: number;
  content: string;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  uploderRole: 'OWNER' | 'CUSTOMER';
  images: PostImage[];
  hashtags: string[];
  likeCount: number;
  createdAt: string;
}

export interface PostImage {
  imageUrl: string;
  imageId: number;
  displayOrder: number;
}

export interface Comment {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorePost {
  postId: number;
  content: string;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  uploderRole: 'OWNER';
  images: PostImage[];
  hashtags: string[];
  likeCount: number;
  createdAt: string;
}

export interface StorePostsResponse {
  status: string;
  code: string;
  message: string;
  data: {
    values: StorePost[];
    nextCursor: number | null;
  };
}

export interface Review {
  [x: string]: any;
  id: number;
  postId?: number;
  rating: number;
  content: string;
  author?: string;
  userName?: string;
  time?: string;
  createdAt?: string;
  images?: PostImage[];
  hashtags?: string[];
  likeCount?: number;
  userId?: number;
}

export interface User {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: string;
  storeId: number;
  birth: string | null;
}

export interface UserResponse {
  status: string;
  code: string;
  message: string;
  data: User;
}

export interface Owner {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: string;
  storeId: number;
  birth: string | null;
}

export interface Store {
  storeId: number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number | null;
  sigun: string;
  address: string;
  industryCode: number;
  businessRegistrationNumber: number;
  avgStar: number;
  operatingHours: any[];
  owner: Owner;
  menus: any[];
  reviews: any[];
}

export interface StoreResponse {
  status: string;
  code: string;
  message: string;
  data: Store;
}

export interface Profile {
  restaurantName: string;
  address: string;
  rating: number;
  followers?: number;
  reviewCount?: number;
  phone?: string;
  profileImage?: string;
  image?: string;
  storeId?: number;
}

export interface Recommendation {
  id?: number;
  title: string;
  text?: string;
  content?: string;
  image?: string;
  show: boolean;
}

// 가게별 사장님 게시글 조회 API 응답 타입
export interface StoreOwnerPostsResponse {
  status: string;
  code: string;
  message: string;
  data: {
    values: Post[];
    nextCursor: number | null;
  };
}

// 가게별 일반 유저 게시글 조회 API 응답 타입
export interface StoreCustomerPostsResponse {
  status: string;
  code: string;
  message: string;
  data: {
    values: Post[];
    nextCursor: number | null;
  };
}
