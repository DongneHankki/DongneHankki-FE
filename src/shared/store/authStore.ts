import { create } from 'zustand';
import { useMapStore } from '../../features/map/store/mapStore';

interface AuthState {
  role: 'owner' | 'customer' | null;
  userId: string | null;
  loginId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (auth: {
    role: 'owner' | 'customer';
    userId: string;
    loginId: string;
    accessToken: string;
    refreshToken: string;
  }) => void;
  
  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  
  setUserInfo: (userInfo: {
    role: 'owner' | 'customer';
    userId: string;
    loginId: string;
  }) => void;
  
  clearAuth: () => void;
  
  // Computed
  isOwner: () => boolean;
  isCustomer: () => boolean;
  
  // Token getters
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  
  // LoginId getter
  getLoginId: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  role: null,
  userId: null,
  loginId: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  
  setAuth: (auth) => {
    console.log('AuthStore - setAuth 호출됨:', {
      role: auth.role,
      userId: auth.userId,
      loginId: auth.loginId,
      accessToken: auth.accessToken ? auth.accessToken.substring(0, 20) + '...' : null,
      refreshToken: auth.refreshToken ? auth.refreshToken.substring(0, 20) + '...' : null,
    });
    
    set({
      role: auth.role,
      userId: auth.userId,
      loginId: auth.loginId,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      isAuthenticated: true,
    });
  },
  
  setTokens: (tokens) => {
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },
  
  setUserInfo: (userInfo) => {
    set({
      role: userInfo.role,
      userId: userInfo.userId,
      loginId: userInfo.loginId,
      isAuthenticated: true,
    });
  },
  
  clearAuth: () => {
    set({
      role: null,
      userId: null,
      loginId: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    
    // 맵 상태도 초기화
    const mapStore = useMapStore.getState();
    mapStore.resetMapState();
  },
  
  isOwner: () => {
    return get().role === 'owner';
  },
  
  isCustomer: () => {
    return get().role === 'customer';
  },
  
  getAccessToken: () => {
    return get().accessToken;
  },
  
  getRefreshToken: () => {
    return get().refreshToken;
  },
  
  getLoginId: () => {
    const loginId = get().loginId;
    console.log('AuthStore - getLoginId 호출됨:', loginId);
    return loginId;
  },
}));
