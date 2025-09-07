import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigation from '../shared/components/BottomNavigation';
import CustomerPostScreen from '../features/sns/customer/screens/CustomerPostScreen';
import PostDetailScreen from '../shared/components/PostDetailScreen';

const Stack = createNativeStackNavigator();

// BottomNavigation을 래핑하는 컴포넌트
const CustomerMainScreen = () => {
  return <BottomNavigation userType="customer" />;
};

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerMain" component={CustomerMainScreen} />
      <Stack.Screen name="CustomerPost" component={CustomerPostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
