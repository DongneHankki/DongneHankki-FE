import { Alert } from 'react-native';
import { validatePhoneFormat, validateVerificationCode } from './validationUtils';
import { sendAuthCode, checkAuthCode } from '../services/CheckPhoneNumberAPI';

// 타이머 포맷팅
export const formatTime = (seconds: number): string => {
  try {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '00:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('타이머 포맷팅 오류:', error);
    return '00:00';
  }
};

// 전화번호 입력 처리
export const formatPhoneNumber = (text: string): string => {
  try {
    if (typeof text !== 'string') {
      return '';
    }
    
    // 숫자와 하이픈만 허용
    const cleaned = text.replace(/[^0-9-]/g, '');
    let formatted = cleaned;
    
    // 하이픈 자동 추가 (11자리 숫자인 경우)
    const numbersOnly = cleaned.replace(/[^0-9]/g, '');
    if (numbersOnly.length >= 3 && numbersOnly.length <= 11) {
      if (numbersOnly.length >= 7) {
        formatted = numbersOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      } else if (numbersOnly.length >= 3) {
        formatted = numbersOnly.replace(/(\d{3})(\d{0,4})/, '$1-$2');
      }
    }
    
    return formatted;
  } catch (error) {
    console.error('전화번호 포맷팅 오류:', error);
    return text;
  }
};

// 인증번호 입력 처리
export const formatVerificationCode = (text: string): string => {
  try {
    if (typeof text !== 'string') {
      return '';
    }
    
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned;
  } catch (error) {
    console.error('인증번호 포맷팅 오류:', error);
    return text;
  }
};

// 인증번호 전송 처리
export const handleSendVerification = async (
  phone: string,
  setIsVerificationSent: (value: boolean) => void,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setPhoneError: (value: string) => void,
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>
): Promise<void> => {
  try {
    const phoneError = validatePhoneFormat(phone);
    if (phoneError) {
      setPhoneError(phoneError);
      return;
    }

    // 기존 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // API 호출하여 인증번호 전송
    const phoneNumberOnly = phone.replace(/[^0-9]/g, '');
    const result = await sendAuthCode(phoneNumberOnly);
    
    if (result.status === 'success') {
      setIsVerificationSent(true);
      setCountdown(180); // 3분 타이머
      setPhoneError('');
      
      // 타이머 시작 - useRef를 사용하여 메모리 누수 방지
      timerRef.current = setInterval(() => {
        try {
          setCountdown((prev: number) => {
            if (prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setIsVerificationSent(false);
              return 0;
            }
            return prev - 1;
          });
        } catch (error) {
          console.error('타이머 오류:', error);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsVerificationSent(false);
          setCountdown(0);
        }
      }, 1000);

      Alert.alert('인증번호 전송', '인증번호가 전송되었습니다.');
    } else {
      setPhoneError(result.message || '인증번호 전송에 실패했습니다.');
    }
  } catch (error: any) {
    console.error('인증번호 전송 오류:', error);
    setPhoneError(error.message || '인증번호 전송에 실패했습니다.');
  }
};

// 인증번호 확인 처리
export const handleVerifyCode = async (
  verificationCode: string,
  phone: string,
  name: string,
  setIsVerificationCompleted: (value: boolean) => void,
  setVerificationCodeError: (value: string) => void,
  setAuthData: (data: any) => void
): Promise<void> => {
  try {
    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setVerificationCodeError(codeError);
      return;
    }

    // API 호출하여 인증번호 확인
    const phoneNumberOnly = phone.replace(/[^0-9]/g, '');
    const result = await checkAuthCode(phoneNumberOnly, verificationCode);
    
    if (result.status === 'success') {
      setIsVerificationCompleted(true);
      setVerificationCodeError('');
      setAuthData({
        name: name || '',
        phone: phone || '',
        code: parseInt(verificationCode) || 0
      });
      Alert.alert('인증 완료', '본인인증이 완료되었습니다.');
    } else {
      setVerificationCodeError(result.message || '인증번호가 일치하지 않습니다.');
    }
  } catch (error: any) {
    console.error('인증번호 확인 오류:', error);
    setVerificationCodeError(error.message || '인증번호 확인에 실패했습니다.');
  }
};

// 전화번호 변경 시 상태 초기화
export const resetVerificationState = (
  setIsVerificationSent: (value: boolean) => void,
  setIsVerificationCompleted: (value: boolean) => void,
  setVerificationCode: (value: string) => void,
  setVerificationCodeError: (value: string) => void,
  setCountdown: (value: number) => void,
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>
): void => {
  try {
    setIsVerificationSent(false);
    setIsVerificationCompleted(false);
    setVerificationCode('');
    setVerificationCodeError('');
    setCountdown(0);
    
    // 기존 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  } catch (error) {
    console.error('인증 상태 초기화 오류:', error);
  }
}; 