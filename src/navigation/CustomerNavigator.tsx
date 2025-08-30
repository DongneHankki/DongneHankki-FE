import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigation from '../shared/components/BottomNavigation';
import CustomerPostScreen from '../features/sns/customer/screens/CustomerPostScreen';

const Stack = createNativeStackNavigator();

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerMain" component={() => <BottomNavigation userType="customer" />} />
      <Stack.Screen name="CustomerPost" component={CustomerPostScreen} />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
