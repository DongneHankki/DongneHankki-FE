import { create } from 'zustand';

interface Time {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

interface OperatingHours {
  dayOfWeek: string;
  openTime: Time;
  closeTime: Time;
}

interface Owner {
  userId: number;
  loginId: string;
  nickname: string;
  name: string;
  phoneNumber: string;
  role: string;
  storeId: number;
  birth: string;
}

interface StoreDetail {
  storeId: number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  sigun: string;
  address: string;
  industryCode: number;
  businessRegistrationNumber: number;
  avgStar: number;
  operatingHours: OperatingHours[];
  owner: Owner;
  menus: any[];
  reviews: any[];
}

interface MarketState {
  // 상태
  storeDetail: StoreDetail | null;
  loading: boolean;
  error: Error | null;
  
  // 액션
  setStoreDetail: (storeDetail: StoreDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  resetMarketState: () => void;
  
  // 선택된 매장 상세 정보 가져오기
  getStoreDetail: () => StoreDetail | null;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  // 초기 상태
  storeDetail: null,
  loading: false,
  error: null,
  
  // 액션들
  setStoreDetail: (storeDetail) => {
    console.log('marketStore - setStoreDetail 호출됨:', storeDetail);
    set({ storeDetail });
  },
  
  setLoading: (loading) => {
    console.log('marketStore - setLoading 호출됨:', loading);
    set({ loading });
  },
  
  setError: (error) => {
    console.log('marketStore - setError 호출됨:', error);
    set({ error });
  },
  
  resetMarketState: () => {
    console.log('marketStore - 상태 초기화');
    set({
      storeDetail: null,
      loading: false,
      error: null,
    });
  },
  
  // 선택된 매장 상세 정보 가져오기
  getStoreDetail: () => {
    const { storeDetail } = get();
    return storeDetail;
  },
}));
