import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogoScreen from '../features/auth/screens/LogoScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import StartRegisterScreen from '../features/auth/screens/StartRegisterScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import UserTypeSelectionScreen from '../features/auth/screens/UserTypeSelectionScreen';
import OwnerRegisterScreen from '../features/auth/screens/OwnerRegisterScreen';
import RegisterTermsScreen from '../features/auth/screens/RegisterTermsScreen';
import ConsumerRegisterScreen from '../features/auth/screens/ConsumerRegisterScreen';
import RegisterCompleteScreen from '../features/auth/screens/RegisterCompleteScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  StartRegister: undefined;
  Register: undefined;
  UserTypeSelection: { id: string; password: string; name: string; phone: string };
  OwnerRegister: { id: string; password: string; name: string; phone: string; userType: 'owner' };
  ConsumerRegister: { id: string; password: string; name: string; phone: string; userType: 'consumer' };
  RegisterTerms: {
    id: string;
    password: string;
    name: string;
    phone: string;
    userType: 'owner' | 'consumer';
    nickname?: string;
    address?: string;
    addressDetail?: string;
    storeName?: string;
  };
  RegisterComplete: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={LogoScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="StartRegister" component={StartRegisterScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
    <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
    <Stack.Screen name="RegisterTerms" component={RegisterTermsScreen} />
    <Stack.Screen name="ConsumerRegister" component={ConsumerRegisterScreen} />
    <Stack.Screen name="RegisterComplete" component={RegisterCompleteScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
