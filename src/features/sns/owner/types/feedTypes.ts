export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt?: string;
  comments: number;
  likes: number;
  image: string | null;
}

export interface Review {
  id: number;
  rating: number;
  content: string;
  author?: string;
  userName?: string;
  time?: string;
  createdAt?: string;
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
}

export interface Recommendation {
  id?: number;
  title: string;
  text?: string;
  content?: string;
  image?: string;
  show: boolean;
}
