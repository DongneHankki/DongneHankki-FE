import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { checkIdDuplicate } from '../services/CheckLoginIdAPI';
import RegisterHeader from '../components/RegisterHeader';
import { common } from '../../../shared/styles/commonAuthStyles';
import { 
  validatePasswordFormat, 
  validatePasswordCheck, 
  validateIdFormat,
  validateName 
} from '../utils/validationUtils';
import {
  formatTime,
  formatPhoneNumber,
  formatVerificationCode,
  handleSendVerification,
  handleVerifyCode,
  resetVerificationState
} from '../utils/phoneVerificationUtils';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordCheckError, setPasswordCheckError] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationCompleted, setIsVerificationCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [authData, setAuthData] = useState<{
    name: string;
    phone: string;
    code: number;
  } | null>(null);



  // 인증번호 전송 처리
  const onSendVerification = async () => {
    await handleSendVerification(
      phone,
      setIsVerificationSent,
      setCountdown,
      setPhoneError,
      timerRef
    );
  };

  // 인증번호 확인
  // 인증번호 확인 처리
  const onVerifyCode = async () => {
    await handleVerifyCode(
      verificationCode,
      phone,
      name,
      setIsVerificationCompleted,
      setVerificationCodeError,
      setAuthData
    );
  };

  // 전화번호 입력 처리
  const handlePhoneChange = (text: string) => {
    try {
      const formatted = formatPhoneNumber(text);
      setPhone(formatted);
      setPhoneError('');
      
      // 전화번호가 변경되면 인증 상태 초기화
      if (isVerificationSent || isVerificationCompleted) {
        resetVerificationState(
          setIsVerificationSent,
          setIsVerificationCompleted,
          setVerificationCode,
          setVerificationCodeError,
          setCountdown,
          timerRef
        );
      }
    } catch (error) {
      console.error('전화번호 입력 처리 오류:', error);
    }
  };

  // 인증번호 입력 처리
  const handleVerificationCodeChange = (text: string) => {
    try {
      const formatted = formatVerificationCode(text);
      setVerificationCode(formatted);
      setVerificationCodeError('');
    } catch (error) {
      console.error('인증번호 입력 처리 오류:', error);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleCheckId = async () => {
    if (!id) {
      setIdError('아이디를 입력하세요.');
      setIdChecked(false);
      return;
    }
    const idCheck = await validateIdFormat(id);
    const isDuplicate = await checkIdDuplicate(id);
    if (idCheck) {
      setIdError('아이디는 영문과 숫자를 모두 포함해야 합니다');
      setIdChecked(false);
    } else if (isDuplicate) {
      setIdError('이미 사용 중인 아이디입니다.');
      setIdChecked(false);
    } else {
      setIdError('사용 가능한 아이디입니다.');
      setIdChecked(true);
    }

  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const err = validatePasswordFormat(text);
    setPasswordError(err ? err : '');
    if (passwordCheck) {
      const checkErr = validatePasswordCheck(text, passwordCheck);
      setPasswordCheckError(checkErr ? checkErr : '');
    }
  };

  const handlePasswordCheckChange = (text: string) => {
    setPasswordCheck(text);
    const err = validatePasswordCheck(password, text);
    setPasswordCheckError(err ? err : '');
  };

  // 다음 버튼 클릭 시 전체 유효성 검사
  const onNextPress = async () => {
    let valid = true;

    // 아이디 검사
    if (!id) {
      setIdError('아이디를 입력하세요.');
      valid = false;
    } else if (!idChecked) {
      setIdError('아이디 중복확인을 해주세요.');
      valid = false;
    }

    // 비밀번호 검사
    const pwdFormatError = validatePasswordFormat(password);
    if (!password) {
      setPasswordError('비밀번호를 입력하세요.');
      valid = false;
    } else if (pwdFormatError) {
      setPasswordError(pwdFormatError);
      valid = false;
    }

    // 비밀번호 재확인 검사
    const pwdCheckError = validatePasswordCheck(password, passwordCheck);
    if (!passwordCheck) {
      setPasswordCheckError('비밀번호를 한 번 더 입력하세요.');
      valid = false;
    } else if (pwdCheckError) {
      setPasswordCheckError(pwdCheckError);
      valid = false;
    }

    // 이름 검사
    const nameError = validateName(name);
    if (nameError) {
      setNameError(nameError);
      valid = false;
    } else {
      setNameError('');
    }

    // 본인인증 검사
    if (!authData) {
      Alert.alert('본인인증 필요', '휴대폰 본인인증을 완료해주세요.');
      valid = false;
    }

    // 모든 조건이 맞으면 다음 단계로 진행
    if (valid) {
      navigation.navigate('UserTypeSelection', {
        id,
        password,
        name,
        phone: phone || '01000000000', 
      });
    }
  };



  return (
    <ScrollView contentContainerStyle={common.container}>
      <RegisterHeader title="회원가입" step={1} onBack={() => {
        try {
          navigation.goBack();
        } catch (error) {
          console.error('뒤로가기 오류:', error);
        }
      }} />
      <Text style={styles.label}><Text style={common.star}>*</Text> 는 필수 입력 사항입니다</Text>
      <View style={styles.formWrapper}>
        {/* 아이디 */}
        <Text style={common.label}>아이디 <Text style={common.star}>*</Text></Text>
        <View style={common.row}>
          <TextInput
            style={[common.input, { flex: 1 }]}
            placeholder="영문, 숫자 조합"
            value={id}
            onChangeText={text => { setId(text); setIdError(''); setIdChecked(false); }}
          />
          <TouchableOpacity style={styles.checkButton} onPress={handleCheckId}>
            <Text style={styles.checkButtonText}>중복확인</Text>
          </TouchableOpacity>
        </View>
        {!!idError && <Text style={common.errorMsg}>{idError}</Text>}

        {/* 비밀번호 */}
        <Text style={common.label}>비밀번호 <Text style={common.star}>*</Text></Text>
        <View style={styles.inputIconRow}>
          <TextInput
            style={[common.input, { width: '100%' }]}
            placeholder="영문, 숫자 조합 8-16자"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
            <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        {!!passwordError && <Text style={common.errorMsg}>{passwordError}</Text>}

        {/* 비밀번호 재확인 */}
        <Text style={common.label}>비밀번호 재확인 <Text style={common.star}>*</Text></Text>
        <View style={styles.inputIconRow}>
          <TextInput
            style={[common.input, { width: '100%' }]}
            placeholder="영문, 숫자 조합 8-16자"
            value={passwordCheck}
            onChangeText={handlePasswordCheckChange}
            secureTextEntry={!showPasswordCheck}
          />
          <TouchableOpacity onPress={() => setShowPasswordCheck(!showPasswordCheck)} style={styles.icon}>
            <Icon name={showPasswordCheck ? 'eye-off-outline' : 'eye-outline'} size={24} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        {!!passwordCheckError && <Text style={common.errorMsg}>{passwordCheckError}</Text>}

        {/* 이름 */}
        <Text style={common.label}>이름 <Text style={common.star}>*</Text></Text>
        <TextInput
            style={[common.input, { width: '100%' }]}
            placeholder="예) 홍길동"
          value={name}
          onChangeText={text => { setName(text); setNameError(''); }}
        />
        {!!nameError && <Text style={common.errorMsg}>{nameError}</Text>}

        {/* 휴대폰 인증 */}
        <Text style={common.label}>휴대폰번호 본인인증 <Text style={common.star}>*</Text></Text>
        
        <View style={common.row}>
          <TextInput
            style={[common.input, { flex: 1 }]}
            placeholder="010-1234-5678"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
          <TouchableOpacity 
            style={[
              styles.verifyButton, 
              isVerificationSent && styles.verifyButtonSent,
              isVerificationCompleted && styles.verifyButtonSuccess
            ]} 
            onPress={onSendVerification}
            disabled={isVerificationSent && countdown > 0}
          >
            <Text style={[
              styles.verifyButtonText,
              isVerificationSent && styles.verifyButtonTextSent,
              isVerificationCompleted && styles.verifyButtonTextSuccess
            ]}>
              {isVerificationCompleted ? '인증완료' : isVerificationSent ? '재전송' : '인증번호 전송'}
            </Text>
          </TouchableOpacity>
        </View>
        {!!phoneError && <Text style={common.errorMsg}>{phoneError}</Text>}
        {isVerificationSent && countdown > 0 && (
          <Text style={styles.timerText}>남은 시간: {formatTime(countdown)}</Text>
        )}

        {isVerificationSent && (
          <View style={common.row}>
            <TextInput
              style={[common.input, { flex: 1 }]}
              placeholder="인증번호 6자리 입력"
              value={verificationCode}
              onChangeText={handleVerificationCodeChange}
              keyboardType="numeric"
              maxLength={6}
            />
            <TouchableOpacity 
              style={[
                styles.verifyButton,
                isVerificationCompleted && styles.verifyButtonSuccess
              ]} 
              onPress={onVerifyCode}
              disabled={isVerificationCompleted}
            >
              <Text style={[
                styles.verifyButtonText,
                isVerificationCompleted && styles.verifyButtonTextSuccess
              ]}>
                {isVerificationCompleted ? '인증완료' : '확인'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {!!verificationCodeError && <Text style={common.errorMsg}>{verificationCodeError}</Text>}

        {/* 다음 버튼 */}
        <TouchableOpacity style={styles.nextButton} onPress={onNextPress}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  checkButton: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 1,
    height: 30,
    textAlign: 'center',
  },
  checkButtonText: {
    color: '#2E1404',
    fontWeight: 'bold',
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
  verifyButton: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E1404',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  verifyButtonSent: {
    backgroundColor: '#f0f0f0',
    borderColor: '#BDBDBD',
  },
  verifyButtonSuccess: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  verifyButtonText: {
    color: '#2E1404',
    fontWeight: 'bold',
    fontSize: 12,
  },
  verifyButtonTextSent: {
    color: '#BDBDBD',
  },
  verifyButtonTextSuccess: {
    color: '#fff',
  },
  timerText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  certButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E1404',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    height: 58,
    justifyContent: 'center',
    boxShadow: '3px 3px 4px rgba(0, 0, 0, 0.2)',
  },
  certButtonText: {
    color: '#2E1404',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2E1404',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    height: 66,
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
  errorMsg: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 4,
  },
  formWrapper: {
    paddingHorizontal: 24,
    flex: 1,
  },
  certButtonSuccess: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  certButtonTextSuccess: {
    color: '#fff',
  },
  authInfo: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 