import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import RegisterHeader from '../components/RegisterHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { common } from '../../../shared/styles/commonAuthStyles';
import { globalTextStyles, FONTS } from '../../../shared/styles/globalStyles';
import { checkBusinessNumber } from '../services/CheckBusinessNumberAPI';

interface OwnerRegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OwnerRegister'>;
}

const OwnerRegisterScreen: React.FC<OwnerRegisterScreenProps> = ({ navigation }) => {
  const [businessNumber, setBusinessNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [businessNumberError, setBusinessNumberError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const route = useRoute<RouteProp<AuthStackParamList, 'OwnerRegister'>>();
  const { id, password, name, userType, phone, birth } = route.params;

  // 사업자 등록번호 확인 API 호출
  const handleBusinessNumberCheck = async () => {
    if (!businessNumber) {
      setBusinessNumberError('사업자 등록번호를 입력하세요.');
      return;
    }

    // 사업자 등록번호 형식 검증 (000-00-00000)
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberRegex.test(businessNumber)) {
      setBusinessNumberError('올바른 사업자 등록번호 형식으로 입력하세요. (000-00-00000)');
      return;
    }

    setIsLoading(true);
    setBusinessNumberError('');

    try {
      const storeData = await checkBusinessNumber(businessNumber);
      
      // 받은 데이터로 주소와 상호명 자동 채우기
      setStoreName(storeData.name);
      setAddress(storeData.address);
      setAddressDetail(storeData.address);
      
      Alert.alert('성공', '사업자 등록번호가 확인되었습니다.');
    } catch (error: any) {
      setBusinessNumberError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onNext = () => {
    let valid = true;
    
    if (!businessNumber) {
      setBusinessNumberError('사업자 등록번호를 입력하세요.');
      valid = false;
    } else {
      setBusinessNumberError('');
    }
    
    if (valid) {
      navigation.navigate('RegisterTerms', {
        id, 
        password,
        name,
        phone,
        userType: 'owner',
        address,
        addressDetail,
        storeName,
        birth
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={common.container}>
      <RegisterHeader title="회원가입" step={3} onBack={() => navigation.goBack()} />
      <Text style={common.subtitle}>사업자 번호를 입력해주세요!</Text>
      <View style={common.formWrapper}>
        <Text style={common.label}>사업자 등록 번호 <Text style={common.star}>*</Text></Text>
        <TextInput
          style={common.input}
          placeholder="000-00-00000"
          value={businessNumber}
          onChangeText={(text) => {
            setBusinessNumber(text);
            setBusinessNumberError('');
          }}
          keyboardType="numeric"
          maxLength={12}
        />
        {!!businessNumberError && <Text style={common.errorMsg}>{businessNumberError}</Text>}
        
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleBusinessNumberCheck}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? '확인 중...' : '확인'}
          </Text>
        </TouchableOpacity>

        <Text style={common.label}>주소</Text>
        <TextInput
          style={common.input}
          value={addressDetail}
          onChangeText={setAddressDetail}
        />

        <Text style={common.label}>상호명</Text>
        <TextInput
          style={common.input}
          value={storeName}
          onChangeText={setStoreName}
        />

        <TouchableOpacity style={common.brownButton} onPress={onNext}>
          <Text style={common.brownButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E1404',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmButtonText: {
    ...globalTextStyles.button,
    color: '#2E1404',
  },
});

export default OwnerRegisterScreen;