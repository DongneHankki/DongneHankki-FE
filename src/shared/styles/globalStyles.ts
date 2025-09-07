import { StyleSheet } from 'react-native';

// 폰트 패밀리 상수 정의
export const FONTS = {
  // KoddiUDOnGothic-Bold.ttf 파일 사용
  primary: 'KoddiUDOnGothic-Bold',
  regular: 'KoddiUDOnGothic-Bold',
  bold: 'KoddiUDOnGothic-Bold',
  light: 'KoddiUDOnGothic-Bold',
};

// 전역 텍스트 스타일
export const globalTextStyles = StyleSheet.create({
  defaultText: {
    fontFamily: FONTS.primary,
    fontSize: 16,
    color: '#333333',
  },
  heading1: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    fontWeight: '700',
    color: '#2E1404',
  },
  heading2: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    fontWeight: '600',
    color: '#2E1404',
  },
  heading3: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    fontWeight: '600',
    color: '#2E1404',
  },
  body1: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#333333',
  },
  body2: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#666666',
  },
  caption: {
    fontFamily: FONTS.light,
    fontSize: 12,
    color: '#999999',
  },
  button: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    fontWeight: '600',
  },
}); 