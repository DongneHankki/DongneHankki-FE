import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import OwnerNavigator from './OwnerNavigator';
import LogoScreen from '../features/auth/screens/LogoScreen';
import { useAuthStore } from '../shared/store/authStore';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string>('Auth');
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    // 인증 상태에 따라 초기 라우트 설정
    if (isAuthenticated) {
      if (role === 'owner') {
        setInitialRoute('Owner');
      } else {
        setInitialRoute('Customer');
      }
    } else {
      setInitialRoute('Auth');
    }
  }, [isAuthenticated, role]);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Logo"
      >
        <Stack.Screen name="Logo" component={LogoScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Customer" component={CustomerNavigator} />
        <Stack.Screen name="Owner" component={OwnerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
