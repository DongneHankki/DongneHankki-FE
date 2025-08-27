import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../../shared/store/authStore';
import { getTokenFromLocal, saveTokens } from '../../../shared/utils/tokenUtil';
import { verifyToken } from '../services/RefreshAPI';

type LogoScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const LogoScreen = ({ navigation }: LogoScreenProps) => {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("=== LogoScreen: 인증 상태 확인 시작 ===");
        
        const token = await getTokenFromLocal();
        console.log("로컬에서 가져온 토큰:", token ? {
          hasAccessToken: !!token.accessToken,
          hasRefreshToken: !!token.refreshToken,
          role: token.role,
          userId: token.userId,
          accessTokenLength: token.accessToken?.length,
          refreshTokenLength: token.refreshToken?.length
        } : "토큰 없음");
        
        if (token && token.accessToken && token.refreshToken) {
          console.log('토큰 발견, 유효성 검증 시작');
          console.log('RefreshToken 첫 20자:', token.refreshToken.substring(0, 20));
          
          const verificationResult = await verifyToken(token.refreshToken);
          console.log('검증 결과:', verificationResult);
          
          if (verificationResult.success) {
            console.log('토큰 유효성 검증 성공 - 적절한 화면으로 네비게이션');
            
            // 새로운 토큰이 있으면 저장
            let finalTokens = {
              accessToken: token.accessToken,
              refreshToken: token.refreshToken
            };
            
            if (verificationResult.newTokens) {
              console.log('새로운 토큰들로 업데이트');
              finalTokens = verificationResult.newTokens;
              
              // tokenUtil의 saveTokens 함수를 사용하여 Keychain에 저장
              await saveTokens(finalTokens.accessToken, finalTokens.refreshToken, token.loginId);
              console.log('새로운 토큰들 Keychain에 저장 완료');
            }
            
            // Zustand store 업데이트
            setAuth({
              role: token.role || 'customer',
              userId: token.userId || '',
              loginId: token.loginId || '',
              accessToken: finalTokens.accessToken,
              refreshToken: finalTokens.refreshToken,
            });
            
            console.log('AuthStore 업데이트 완료, 네비게이션 시작');
            
            // 사용자 타입에 따라 적절한 화면으로 네비게이션
            if (token.role === 'owner') {
              console.log('Owner 화면으로 이동');
              navigation.replace("Owner");
            } else {
              console.log('Customer 화면으로 이동');
              navigation.replace("Customer");
            }
          } else {
            console.log('토큰 유효성 검증 실패 - 로그인 화면으로 이동');
            console.log('실패 메시지:', verificationResult.message);
            clearAuth();
            navigation.replace("Auth");
          }
        } else {
          console.log('토큰이 없거나 불완전함 - 로그인 화면으로 이동');
          console.log('토큰 상태:', {
            hasToken: !!token,
            hasAccessToken: token?.accessToken ? '있음' : '없음',
            hasRefreshToken: token?.refreshToken ? '있음' : '없음'
          });
          clearAuth();
          navigation.replace("Auth");
        }
      } catch (error) {
        console.error("LogoScreen: 인증 상태 확인 실패", error);
        clearAuth();
        navigation.replace("Auth");
      }
    };

    // 2초 후에 인증 상태 확인 (로고 화면 표시 시간)
    const timer = setTimeout(checkAuthStatus, 2000);
    
    return () => clearTimeout(timer);
  }, [navigation, setAuth, clearAuth]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../shared/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default LogoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 200,
    width: 200,
  },
  text: {
    fontSize: 24,
    marginTop: 20,
  },
});
