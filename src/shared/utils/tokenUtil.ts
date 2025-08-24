import * as Keychain from 'react-native-keychain';
import axios from "axios";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '@env';
import { getRoleFromToken, getUserIdFromToken } from './jwtUtil';
import { useAuthStore } from '../store/authStore';

const URL = `${API_BASE_URL}/api`;

// Keychain 키 상수
const KEYCHAIN_KEYS = {
  ACCESS_TOKEN: 'dongnaehankki_access_token',
  REFRESH_TOKEN: 'dongnaehankki_refresh_token',
  USER_ID: 'dongnaehankki_user_id',
  LOGIN_ID: 'dongnaehankki_login_id',
  ROLE: 'dongnaehankki_role',
} as const;

const showToast = (text: string) =>{
    Toast.show({
        type: 'error',
        position: 'bottom',
        text1: text,
      });
};

// Keychain에 데이터 저장
const saveToKeychain = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value);
  } catch (error) {
    console.error(`Keychain 저장 실패 (${key}):`, error);
    throw new Error(`Keychain 저장에 실패했습니다: ${key}`);
  }
};

// Keychain에서 데이터 조회
const getFromKeychain = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username === key) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`Keychain 조회 실패 (${key}):`, error);
    return null;
  }
};

// Keychain에서 데이터 삭제
const removeFromKeychain = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword();
  } catch (error) {
    console.error(`Keychain 삭제 실패 (${key}):`, error);
  }
};

export const saveTokens = async (accessToken: string, refreshToken: string, loginId?: string): Promise<void> => {
  try {
    const role = getRoleFromToken(accessToken);
    const userId = getUserIdFromToken(accessToken);
    
    console.log('디코드된 정보:', { role, userId });
    
    // Zustand store에 정보 저장
    if (role && userId) {
      useAuthStore.getState().setAuth({
        role,
        userId,
        loginId: loginId || '',
        accessToken,
        refreshToken,
      });
    }
    
    // Keychain에 각각 저장
    await Promise.all([
      saveToKeychain(KEYCHAIN_KEYS.ACCESS_TOKEN, accessToken),
      saveToKeychain(KEYCHAIN_KEYS.REFRESH_TOKEN, refreshToken),
      saveToKeychain(KEYCHAIN_KEYS.USER_ID, userId ? String(userId) : ''),
      saveToKeychain(KEYCHAIN_KEYS.ROLE, role || ''),
      saveToKeychain(KEYCHAIN_KEYS.LOGIN_ID, loginId || ''),
    ]);
    
    console.log('토큰 Keychain 저장 완료');
  } catch (error: any) {
    console.error('토큰 저장 실패:', error.message);
    throw new Error('토큰 저장에 실패했습니다.');
  }
};

export const getTokens = async (
  id: string,
  password: string
): Promise<void> => {
  try {
    const res = await axios.post(`${URL}/login`, {
      loginId: id,
      password,
    });

    if (res.status === 200 && res.data.status === 'success') {
      const accessToken = res?.data?.data?.accessToken;
      const refreshToken = res?.data?.data?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("토큰이 없습니다.");
      }

      await saveTokens(accessToken, refreshToken, id);
    } else {
      throw new Error(res.data.message || '로그인에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw new Error(error.response.data.message || '가입되지 않은 id,pw 입니다');
    } else {
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }
};

export const getTokenFromLocal = async (): Promise<{
  accessToken: string;
  refreshToken: string;
  userId?: string;
  loginId?: string;
  role?: 'owner' | 'customer';
} | null> => {
  try {
    console.log("GETTOKEN 시작");
    
    // Keychain에서 모든 데이터 조회
    const [accessToken, refreshToken, userId, loginId, role] = await Promise.all([
      getFromKeychain(KEYCHAIN_KEYS.ACCESS_TOKEN),
      getFromKeychain(KEYCHAIN_KEYS.REFRESH_TOKEN),
      getFromKeychain(KEYCHAIN_KEYS.USER_ID),
      getFromKeychain(KEYCHAIN_KEYS.LOGIN_ID),
      getFromKeychain(KEYCHAIN_KEYS.ROLE),
    ]);
    
    if (!accessToken || !refreshToken) {
      console.log("저장된 토큰 없음");
      return null;
    }

    const tokenData = {
      accessToken,
      refreshToken,
      userId: userId || undefined,
      loginId: loginId || undefined,
      role: role as 'owner' | 'customer' | undefined,
    };

    // Zustand store에 정보 저장
    if (tokenData.role && tokenData.userId) {
      useAuthStore.getState().setAuth({
        role: tokenData.role,
        userId: tokenData.userId,
        loginId: tokenData.loginId || '',
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
      });
    }

    console.log("토큰 로드 성공");
    return tokenData;
    
  } catch (e: any) {
    console.error("토큰 로드 오류:", e.message);
    return null;
  }
};

export const logout = async (navigation: NativeStackNavigationProp<any>) => {
  try {
    // Keychain에서 모든 데이터 삭제
    await Promise.all([
      removeFromKeychain(KEYCHAIN_KEYS.ACCESS_TOKEN),
      removeFromKeychain(KEYCHAIN_KEYS.REFRESH_TOKEN),
      removeFromKeychain(KEYCHAIN_KEYS.USER_ID),
      removeFromKeychain(KEYCHAIN_KEYS.LOGIN_ID),
      removeFromKeychain(KEYCHAIN_KEYS.ROLE),
    ]);
    
    // Zustand store 초기화
    useAuthStore.getState().clearAuth();
    
    console.log('로그아웃 완료');
    
    // 로그인 화면으로 이동
    navigation.reset({ routes: [{ name: "Login" }] });
  } catch (error: any) {
    console.error('로그아웃 실패:', error.message);
  }
};

export const verifyTokens = async (
  navigation: NativeStackNavigationProp<any>
) => {
  try {
    console.log("VERIFYTOKEN 시작");
    
    const Token = await getTokenFromLocal();
    console.log("토큰 확인:", Token ? "토큰 있음" : "토큰 없음");

    // 최초 접속
    if (Token === null) {
      console.log("최초 접속 - 로그인 화면으로 이동");
      navigation.reset({ routes: [{ name: "Login" }] });
      return;
    }

    // 토큰 유효성 검사
    if (!Token.accessToken || !Token.refreshToken) {
      console.log("토큰이 유효하지 않음 - 로그인 화면으로 이동");
      navigation.reset({ routes: [{ name: "Login" }] });
      return;
    }

    // 로컬 스토리지에 Token데이터가 있으면 -> 토큰들을 헤더에 넣어 검증 
    const headers_config = {
      "refresh": Token.refreshToken,
      Authorization: `Bearer ${Token.accessToken}`
    };

    try {
      console.log("토큰 검증 요청 시작");
      const res = await axios.get(`${URL}/refresh`, { 
        headers: headers_config,
        timeout: 10000 // 10초 타임아웃
      });

      console.log("토큰 검증 성공");
      
      // accessToken 만료, refreshToken 정상 -> 재발급된 accessToken 저장 후 자동 로그인
      if (res.data && res.data.data && res.data.data.accessToken) {
        const newAccessToken = res.data.data.accessToken;
        
        // Zustand store 업데이트
        useAuthStore.getState().setTokens({
          accessToken: newAccessToken,
          refreshToken: Token.refreshToken,
        });
        
        // Keychain에 새 accessToken 저장
        await saveToKeychain(KEYCHAIN_KEYS.ACCESS_TOKEN, newAccessToken);
        console.log("새 토큰 저장 완료");
      }
      
      // AppNavigator에서 자동으로 처리하므로 네비게이션 제거
      // navigation.reset({ routes: [{ name: "Customer" }] });

    } catch (error: any) {
      console.log("토큰 검증 실패:", error.message);
      
      const code = error.response?.data?.code;
      const status = error.response?.status;

      // accessToken 만료, refreshToken 만료 -> 로그인 페이지
      if (code === 401 || status === 401) {
        console.log("인증 실패 - 로그인 화면으로 이동");
        useAuthStore.getState().clearAuth();
        navigation.reset({ routes: [{ name: "Login" }] });
      }
      // 네트워크 오류나 기타 오류 -> 로그인 페이지로 이동
      else {
        console.log("기타 오류 - 로그인 화면으로 이동");
        useAuthStore.getState().clearAuth();
        navigation.reset({ routes: [{ name: "Login" }] });
      }
    }

  } catch (error: any) {
    console.error("verifyTokens 전체 오류:", error.message);
    
    // 오류 발생 시 로그인 화면으로 이동
    try {
      useAuthStore.getState().clearAuth();
      navigation.reset({ routes: [{ name: "Login" }] });
    } catch (navError) {
      console.error("네비게이션 오류:", navError);
    }
  }
};