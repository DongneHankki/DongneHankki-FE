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
  const [selectedCarrier, setSelectedCarrier] = useState('SKT');
  const [showCarrierModal, setShowCarrierModal] = useState(false);



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
    if (!isVerificationCompleted) {
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
      <Text style={[common.label, { textAlign: 'center' }]}><Text style={common.star}>*</Text> 는 필수 입력 사항입니다</Text>
      <View style={common.formWrapper}>
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
        <Text style={common.label}>휴대폰번호 <Text style={common.star}>*</Text></Text>
        
        {/* 통신사 선택 */}
        <View style={styles.carrierContainer}>
          <TouchableOpacity 
            style={styles.carrierSelector}
            onPress={() => setShowCarrierModal(true)}
          >
            <Text style={styles.carrierText}>{selectedCarrier}</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            style={[common.input, { flex: 1, marginLeft: 8 }]}
            placeholder="숫자만 입력해 주세요."
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={13}
          />
        </View>
        
        {/* 인증번호 입력 */}
        <View style={styles.verificationContainer}>
          <TextInput
            style={[common.input, { flex: 1 }]}
            placeholder="인증번호를 입력해 주세요."
            value={verificationCode}
            onChangeText={handleVerificationCodeChange}
            keyboardType="numeric"
            maxLength={6}
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
              {isVerificationCompleted ? '인증완료' : isVerificationSent ? '재전송' : '인증요청'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 인증번호 확인 버튼 */}
        {isVerificationSent && !isVerificationCompleted && (
          <View style={styles.verificationContainer}>
            <TouchableOpacity 
              style={[styles.verifyButton, { width: '100%' }]} 
              onPress={onVerifyCode}
            >
              <Text style={styles.verifyButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!!phoneError && <Text style={common.errorMsg}>{phoneError}</Text>}
        {!!verificationCodeError && <Text style={common.errorMsg}>{verificationCodeError}</Text>}
        
        {isVerificationCompleted && (
          <View style={styles.verificationStatusRow}>
            <Text style={styles.verificationSuccess}>휴대폰 번호가 인증되었습니다</Text>
          </View>
        )}
        
        {/* 타이머만 표시 (인증 완료되지 않은 경우) */}
        {isVerificationSent && countdown > 0 && !isVerificationCompleted && (
          <Text style={styles.timerText}>남은 시간: {formatTime(countdown)}</Text>
        )}

        {/* 휴대폰 본인인증 서비스 체크박스 */}
        <View style={styles.verificationCheckbox}>
          <TouchableOpacity style={styles.checkbox}>
            <Icon name="check" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.checkboxText}>휴대폰 본인인증 서비스</Text>
          <Text style={styles.checkboxText}>*</Text>
          <TouchableOpacity>
            <Text style={styles.detailLink}>자세히 보기</Text>
          </TouchableOpacity>
        </View>
        

        {/* 다음 버튼 */}
        <TouchableOpacity style={common.brownButton} onPress={onNextPress}>
          <Text style={common.brownButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
      
      {/* 통신사 선택 하단 탭 */}
      {showCarrierModal && (
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackdrop}
            onPress={() => setShowCarrierModal(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>통신사</Text>
            <Text style={styles.bottomSheetSubtitle}>이용 중이신 통신사를 선택해주세요</Text>
            
            {['SKT', 'KT', 'LG U+', '알뜰폰'].map((carrier) => (
              <TouchableOpacity
                key={carrier}
                style={[
                  styles.carrierOption,
                  selectedCarrier === carrier && styles.carrierOptionSelected
                ]}
                onPress={() => {
                  setSelectedCarrier(carrier);
                }}
              >
                <Text style={[
                  styles.carrierOptionText,
                  selectedCarrier === carrier && styles.carrierOptionTextSelected
                ]}>
                  {carrier}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.bottomSheetConfirmButton}
              onPress={() => setShowCarrierModal(false)}
            >
              <Text style={styles.bottomSheetConfirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  verificationStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  verifyButton: {
    marginLeft: 8,
    marginTop: 0,
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
    backgroundColor: '#BDBDBD',
    borderColor: '#BDBDBD',
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
  certButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  carrierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  carrierSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minWidth: 80,
    justifyContent: 'space-between',
  },
  carrierText: {
    color: '#2E1404',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: 0,
  },
  verificationCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: '#2E1404',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#2E1404',
    marginRight: 4,
  },
  detailLink: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  verificationSuccess: {
    fontSize: 14,
    color: '#2E1404',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 8,
    textAlign: 'right',
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
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  bottomSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E1404',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  carrierOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  carrierOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  carrierOptionText: {
    fontSize: 16,
    color: '#2E1404',
    textAlign: 'center',
  },
  carrierOptionTextSelected: {
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#2E1404',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSheetConfirmButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#AEAEAE',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  bottomSheetConfirmButtonText: {
    color: '#AEAEAE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 