import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import RegisterHeader from '../components/RegisterHeader';
import { common } from '../../../shared/styles/commonAuthStyles';

type UserTypeSelectionScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'UserTypeSelection'>;
};

type UserTypeSelectionParams = {
  id: string;
  password: string;
  name: string;
  phone: string;
  birth: string;
};

const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ navigation }) => {
  const route = useRoute<RouteProp<AuthStackParamList, 'UserTypeSelection'>>();
  const { id, password, name, phone, birth } = route.params;

  return (
    <View style={common.container}>
      <RegisterHeader title="회원가입" step={2} onBack={() => navigation.goBack()} />
      <View style={common.contentWrapper}>
        <Text style={common.subtitle}>가입 방식을{"\n"}선택해주세요!</Text>
        <TouchableOpacity
          style={common.brownButton}
          onPress={() => navigation.navigate('OwnerRegister', { id, password, name, phone, birth, userType: 'owner' })}
        >
            <Text style={common.brownButtonText}>점주</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={common.brownButton}
          onPress={() => navigation.navigate('ConsumerRegister', { id, password, name, phone, birth, userType: 'consumer' })}
        >
            <Text style={common.brownButtonText}>소비자</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  stepText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 20,
  },
  
});

export default UserTypeSelectionScreen;
