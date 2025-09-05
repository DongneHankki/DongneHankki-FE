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
    console.log(`Keychain 저장 시작 - 키: ${key}, 값 길이: ${value.length}`);
    await Keychain.setGenericPassword(key, value);
    console.log(`Keychain 저장 성공 - 키: ${key}`);
  } catch (error) {
    console.error(`Keychain 저장 실패 (${key}):`, error);
    throw new Error(`Keychain 저장에 실패했습니다: ${key}`);
  }
};

// Keychain에서 데이터 조회
const getFromKeychain = async (key: string): Promise<string | null> => {
  try {
    console.log(`Keychain 조회 시작 - 키: ${key}`);
    
    // 모든 저장된 credentials 조회
    const credentials = await Keychain.getAllGenericPasswordServices();
    console.log(`Keychain에 저장된 모든 서비스:`, credentials);
    
    // 특정 키로 데이터 조회
    const result = await Keychain.getGenericPassword();
    console.log(`Keychain 조회 결과 - 키: ${key}, result 존재: ${!!result}`);
    
    if (result && result.username === key && result.password) {
      console.log(`Keychain 조회 성공 - 키: ${key}, 값 길이: ${result.password.length}`);
      return result.password;
    }
    
    console.log(`Keychain 조회 실패 - 키: ${key}, 일치하는 데이터 없음`);
    return null;
  } catch (error) {
    console.error(`Keychain 조회 실패 (${key}):`, error);
    return null;
  }
};

// Keychain에서 데이터 삭제
const removeFromKeychain = async (key: string): Promise<void> => {
  try {
    console.log(`Keychain 삭제 시작 - 키: ${key}`);
    await Keychain.resetGenericPassword({ service: key });
    console.log(`Keychain 삭제 성공 - 키: ${key}`);
  } catch (error) {
    console.error(`Keychain 삭제 실패 (${key}):`, error);
  }
};

// 모든 토큰 데이터를 하나의 객체로 저장
const saveAllTokensToKeychain = async (tokenData: {
  accessToken: string;
  refreshToken: string;
  userId: string;
  loginId: string;
  role: string;
}): Promise<void> => {
  try {
    console.log('모든 토큰 데이터를 Keychain에 저장 시작');
    const tokenJson = JSON.stringify(tokenData);
    await Keychain.setGenericPassword('dongnaehankki_tokens', tokenJson);
    console.log('모든 토큰 데이터 Keychain 저장 완료');
  } catch (error) {
    console.error('토큰 데이터 저장 실패:', error);
    throw new Error('토큰 데이터 저장에 실패했습니다.');
  }
};

// Keychain에서 모든 토큰 데이터 조회
const getAllTokensFromKeychain = async (): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
  loginId: string;
  role: string;
} | null> => {
  try {
    console.log('Keychain에서 모든 토큰 데이터 조회 시작');
    const result = await Keychain.getGenericPassword();
    
    if (result && result.username === 'dongnaehankki_tokens' && result.password) {
      const tokenData = JSON.parse(result.password);
      console.log('Keychain에서 토큰 데이터 조회 성공');
      return tokenData;
    }
    
    console.log('Keychain에 토큰 데이터 없음');
    return null;
  } catch (error) {
    console.error('토큰 데이터 조회 실패:', error);
    return null;
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
    
    // 모든 토큰 데이터를 하나의 객체로 Keychain에 저장
    await saveAllTokensToKeychain({
      accessToken,
      refreshToken,
      userId: userId ? String(userId) : '',
      loginId: loginId || '',
      role: role || '',
    });
    
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
    console.log("=== GETTOKEN 시작 ===");
    
    // Keychain에서 모든 토큰 데이터 조회
    const tokenData = await getAllTokensFromKeychain();
    
    if (!tokenData || !tokenData.accessToken || !tokenData.refreshToken) {
      console.log("저장된 토큰 없음 - accessToken 또는 refreshToken이 없음");
      return null;
    }

    const result = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      userId: tokenData.userId || undefined,
      loginId: tokenData.loginId || undefined,
      role: tokenData.role as 'owner' | 'customer' | undefined,
    };

    console.log("토큰 데이터 구성 완료:", {
      hasUserId: !!result.userId,
      hasLoginId: !!result.loginId,
      hasRole: !!result.role,
      role: result.role
    });

    // Zustand store에 정보 저장
    if (result.role && result.userId) {
      console.log("Zustand store에 인증 정보 저장");
      useAuthStore.getState().setAuth({
        role: result.role,
        userId: result.userId,
        loginId: result.loginId || '',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } else {
      console.log("Zustand store 저장 건너뜀 - role 또는 userId 없음");
    }

    console.log("토큰 로드 성공");
    return result;
    
  } catch (e: any) {
    console.error("토큰 로드 오류:", e.message);
    return null;
  }
};

export const logout = async (navigation: NativeStackNavigationProp<any>) => {
  try {
    console.log('로그아웃 시작 - Keychain 데이터 삭제');
    
    // 모든 Keychain 데이터 삭제
    await Keychain.resetGenericPassword();
    console.log('모든 Keychain 데이터 삭제 완료');
    
    // Zustand store 초기화
    useAuthStore.getState().clearAuth();
    
    console.log('로그아웃 완료');
    
    // 로그인 화면으로 이동
    navigation.reset({ routes: [{ name: "Auth" }] });
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