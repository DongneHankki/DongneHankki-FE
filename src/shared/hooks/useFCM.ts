import { useEffect, useState, useRef } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { API_BASE_URL } from '../../config/env';
import { useAuthStore } from '../store/authStore';

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const { isAuthenticated, accessToken } = useAuthStore();
  const retryCount = useRef(0);
  const maxRetries = 10; // 최대 10번 재시도

  // Firebase 앱 준비 상태 확인
  useEffect(() => {
    const checkFirebaseReady = async () => {
      try {
        console.log(`Firebase 앱 준비 상태 확인 시작... (시도 ${retryCount.current + 1}/${maxRetries})`);
        
        // Firebase 앱이 준비되었는지 확인
        const app = getApp();
        console.log('Firebase 앱 인스턴스 가져오기 성공');
        
        const messaging = getMessaging(app);
        console.log('Firebase Messaging 인스턴스 가져오기 성공');
        
        // 간단한 준비 상태 확인 (토큰 가져오기 시도하지 않음)
        console.log('Firebase 앱 준비 완료');
        
        setIsFirebaseReady(true);
        retryCount.current = 0; // 성공 시 카운터 리셋
        console.log('Firebase 앱 준비 완료 - FCM 사용 가능');
      } catch (error) {
        retryCount.current += 1;
        console.log(`Firebase 앱 아직 준비되지 않음 (${retryCount.current}/${maxRetries}):`, error);
        
        if (retryCount.current < maxRetries) {
          // 재시도 간격을 점진적으로 늘림 (1초, 2초, 3초...)
          const delay = Math.min(retryCount.current * 1000, 5000);
          console.log(`${delay}ms 후 재시도...`);
          setTimeout(() => {
            checkFirebaseReady();
          }, delay);
        } else {
          console.error('Firebase 앱 준비 최대 재시도 횟수 초과. FCM 기능을 사용할 수 없습니다.');
          // 최대 재시도 횟수 초과 시에도 계속 시도 (백그라운드에서)
          setTimeout(() => {
            retryCount.current = 0;
            checkFirebaseReady();
          }, 10000); // 10초 후 다시 시작
        }
      }
    };

    // 앱 시작 후 5초 후에 Firebase 준비 상태 확인 시작
    const initialDelay = setTimeout(() => {
      checkFirebaseReady();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  // FCM 토큰을 서버로 전송
  const sendTokenToServer = async (fcmToken: string) => {
    try {
      // 로그인 상태가 아니면 토큰 전송하지 않음
      if (!isAuthenticated || !accessToken) {
        console.log('FCM 토큰 전송 실패: 로그인되지 않음');
        return false;
      }

      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/fcm/token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token: fcmToken,
        }),
      });

      if (response.ok) {
        console.log('FCM 토큰 서버 전송 성공');
        return true;
      } else {
        console.error('FCM 토큰 서버 전송 실패:', response.status);
        return false;
      }
    } catch (error) {
      console.error('FCM 토큰 서버 전송 오류:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // FCM 토큰 받기 및 서버로 전송
  const getAndSendToken = async () => {
    try {
      // Firebase가 준비되지 않았으면 대기
      if (!isFirebaseReady) {
        console.log('Firebase 앱이 아직 준비되지 않음, FCM 토큰 받기 대기');
        return;
      }

      const app = getApp();
      const messaging = getMessaging(app);

      // 로그인 상태가 아니면 FCM 토큰만 받고 서버 전송은 하지 않음
      if (!isAuthenticated) {
        console.log('FCM 토큰 받기만 실행 (로그인되지 않음)');
        try {
          const fcmToken = await getToken(messaging);
          setToken(fcmToken);
          console.log('FCM 토큰 받기 성공 (로그인되지 않음)');
        } catch (error) {
          console.error('FCM 토큰 받기 실패 (로그인되지 않음):', error);
        }
        return;
      }

      console.log('FCM 권한 요청 시작');
      
      // FCM 권한 요청
      const authStatus = await requestPermission(messaging);
      const enabled = 
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log('FCM 권한 상태:', authStatus, '활성화됨:', enabled);

      if (enabled) {
        console.log('FCM 토큰 받기 시작');
        
        // FCM 토큰 받기
        const fcmToken = await getToken(messaging);
        setToken(fcmToken);
        console.log('FCM 토큰 받기 성공:', fcmToken ? fcmToken.substring(0, 20) + '...' : '토큰 없음');
        
        // 로그인된 경우에만 서버로 토큰 전송
        if (fcmToken) {
          console.log('FCM 토큰 서버 전송 시작');
          await sendTokenToServer(fcmToken);
        }
      } else {
        console.log('FCM 권한이 거부됨');
      }
    } catch (error) {
      console.error('FCM 토큰 받기 실패:', error);
    }
  };

  // 로그인 상태가 변경될 때마다 FCM 토큰 처리
  useEffect(() => {
    if (isFirebaseReady) {
      if (isAuthenticated && accessToken) {
        console.log('로그인 상태 감지, FCM 토큰 서버 전송 시작');
        getAndSendToken();
      } else {
        console.log('로그아웃 상태, FCM 토큰만 로컬에 저장');
        // 로그아웃 상태에서는 FCM 토큰만 받기
        try {
          const app = getApp();
          const messaging = getMessaging(app);
          getToken(messaging).then(setToken).catch(error => {
            console.error('로그아웃 상태에서 FCM 토큰 받기 실패:', error);
          });
        } catch (error) {
          console.error('Firebase 앱 가져오기 실패:', error);
        }
      }
    }
  }, [isAuthenticated, accessToken, isFirebaseReady]);

  return { 
    token, 
    isLoading, 
    isFirebaseReady,
    refreshToken: getAndSendToken 
  };
};