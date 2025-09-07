import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import RegisterHeader from '../components/RegisterHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { common } from '../../../shared/styles/commonAuthStyles';
import { globalTextStyles, FONTS } from '../../../shared/styles/globalStyles';
import { searchStores, StoreData } from '../services/CheckStoreNameAPI';
import StoreSearchDropdown from '../components/StoreSearchDropdown';

interface OwnerRegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OwnerRegister'>;
}

const OwnerRegisterScreen: React.FC<OwnerRegisterScreenProps> = ({ navigation }) => {
  const [businessNumber, setBusinessNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  
  const route = useRoute<RouteProp<AuthStackParamList, 'OwnerRegister'>>();
  const { id, password, name, userType, phone, birth } = route.params;

  const handleStoreSelect = (store: StoreData) => {
    setSelectedStore(store);
    setStoreName(store.name);
    setAddress(store.address);
    setStoreId(store.storeId);
    setStoreNameError('');
  };

  const handleStoreNameCheck = async () => {
    if (!storeName) {
      setStoreNameError('상호명을 입력하세요.');
      return;
    }

    const response = await searchStores(storeName);
    if (response.length > 0) {
      setStoreId(response[0].storeId);
      setAddress(response[0].address);
    }
  };

  const onNext = () => {
    let valid = true;
    
    if (!storeName) {
      setStoreNameError('상호명을 입력하세요.');
      valid = false;
    } else {
      setStoreNameError('');
    }
    
    if (valid) {
      navigation.navigate('RegisterTerms', {
        id, 
        password,
        name,
        phone,
        userType: 'owner',
        storeName,
        birth,
        storeId: storeId || 0,
      });
    }
  };

  return (
    <View style={common.container}>
      <RegisterHeader title="회원가입" step={3} onBack={() => navigation.goBack()} />
      <Text style={common.subtitle}>가게를 검색하여 선택해주세요!</Text>
      <View style={common.formWrapper}>
        <Text style={common.label}>가게 검색 <Text style={common.star}>*</Text></Text>
        <StoreSearchDropdown
          onStoreSelect={handleStoreSelect}
          placeholder="가게 이름을 검색하세요"
        />
        {!!storeNameError && <Text style={common.errorMsg}>{storeNameError}</Text>}

        <TouchableOpacity style={common.brownButton} onPress={onNext}>
          <Text style={common.brownButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
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