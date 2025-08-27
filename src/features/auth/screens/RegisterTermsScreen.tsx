import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '@env';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { common } from '../../../shared/styles/commonAuthStyles';
import RegisterHeader from '../components/RegisterHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterTerms'>;

const RegisterTerms: React.FC<Props> = ({ route, navigation }) => {
  const { id, password, name, phone, userType, nickname, address, addressDetail, storeName, birth } = route.params;

  const getTerms = (userType: 'owner' | 'consumer') => [
    { key: 'terms', label: '이용약관 필수 동의', required: true, detail: '상세 내용' },
    { key: 'privacy', label: '개인정보 처리방침 필수 동의', required: true, detail: '상세 내용' },
    { key: 'location', label: '위치정보 이용 약관 필수 동의', required: true, detail: '상세 내용' },
    ...(userType === 'owner' ? [
      { key: 'biz', label: '사업자등록증 정보 수집, 이용 동의', required: true, detail: '상세 내용' },
    ] : []),
    { key: 'age', label: '만 14세 이상임에 동의', required: true, detail: '상세 내용' },
    { key: 'marketing', label: '마케팅 정보 수신 선택 동의', required: false, detail: '상세 내용' },
  ];

  const TERMS = getTerms(userType);
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = (content: string) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  // 전체동의 체크박스
  const allChecked = TERMS.every(term => checked[term.key]);
  const handleAllCheck = () => {
    const newChecked: { [key: string]: boolean } = {};
    TERMS.forEach(term => { newChecked[term.key] = !allChecked; });
    setChecked(newChecked);
  };

  // 개별 체크박스
  const handleCheck = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 필수 약관 모두 체크됐는지
  const requiredChecked = TERMS.filter(t => t.required).every(t => checked[t.key]);

  const renderCheckbox = (checked: boolean) => (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Icon name="check-bold" size={18} color="#2E1404" />}
    </View>
  );

  // 회원가입 요청 함수
  const handleRegister = async () => {
    if (!requiredChecked) return;
    setLoading(true);
    
    console.log('API_BASE_URL:', API_BASE_URL);
    
    try {
      let url = '';
      let payload = {};

      if (userType === 'owner') {
        url = `${API_BASE_URL}/api/owners`;

        payload = {
          loginId: id,
          password,
          name,
          phoneNumber: phone,
          birth,
          storeId: 1,
        };

        console.log('Owner 회원가입 요청:', {
          url,
          payload,
          payloadType: typeof payload,
          phoneType: typeof phone
        });
      } else {
        url = `${API_BASE_URL}/api/customers`;

        payload = {
          loginId: id,
          password,
          name,
          nickname: nickname,
          phoneNumber: phone,
          birth,
        };
        console.log('Customer 회원가입 요청:', {
          url,
          payload,
          payloadType: typeof payload,
          phoneType: typeof phone
        });
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('회원가입 성공:', response.data);
      navigation.navigate('RegisterComplete');
    } catch (e: any) {
      console.error('회원가입 실패 상세:', {
        message: e.message,
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        headers: e.response?.headers,
        config: {
          url: e.config?.url,
          method: e.config?.method,
          data: e.config?.data,
          headers: e.config?.headers,
        }
      });
      
      const errorMessage = e?.response?.data?.message || e?.response?.data?.error || e?.message || '오류가 발생했습니다.';
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={common.container}>
      <RegisterHeader title="회원가입" step={4} onBack={() => navigation.goBack()} />
      <View style={styles.termsBox}>
        <TouchableOpacity style={styles.termRow} onPress={handleAllCheck}>
          {renderCheckbox(allChecked)}
          <Text style={styles.allTermText}>아래 약관에 모두 동의합니다</Text>
        </TouchableOpacity>
        {TERMS.map(term => (
          <View key={term.key} style={styles.termRow}>
            <TouchableOpacity onPress={() => handleCheck(term.key)}>
              {renderCheckbox(checked[term.key])}
            </TouchableOpacity>
            <Text style={styles.termText}>
              {term.label}
              {term.required && <Text style={common.star}>*</Text>}
            </Text>
            <TouchableOpacity onPress={() => openModal(term.detail)}>
              <Text style={styles.detailText}>자세히 보기</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[common.brownButton, !requiredChecked && { backgroundColor: '#ccc' }]}
        onPress={handleRegister}
        disabled={!requiredChecked || loading}
      >
        <Text style={common.brownButtonText}>다음</Text>
        {loading && <ActivityIndicator color="#fff" style={{ marginLeft: 10 }} />}
      </TouchableOpacity>
      {modalVisible && (
        <View style={{
          position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 30, maxWidth: '80%' }}>
            <TouchableOpacity onPress={closeModal} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: '#2E1404', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, marginHorizontal: 15 }}>{modalContent}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  termsBox: {
    marginVertical: 50,
    padding: 12,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#2E1404',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#2E1404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#2E1404',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  allTermText: {
    margin: 4,
    fontSize: 20,
    fontWeight: 'bold',
  },
  termText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'semibold',
    flex: 1,
  },
  detailText: {
    color: '#727272',
    fontSize: 13,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});

export default RegisterTerms;
