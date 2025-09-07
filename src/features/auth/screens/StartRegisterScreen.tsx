import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../navigation/AuthNavigator';
import RegisterHeader from '../components/RegisterHeader';

type StartRegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'StartRegister'>;
};

const StartRegisterScreen: React.FC<StartRegisterScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <RegisterHeader title="회원가입" step={0} onBack={() => navigation.goBack()} />
      <View style={styles.contentWrapper}>
        <Text style={styles.subtitle}>동네한끼+는{"\n"}소상공인과 소비자{"\n"}모두를 위한 서비스입니다</Text>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>계속 진행하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'stretch',
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    color: '#111',
    width: '100%',
  },
  subtitle: {
    fontSize: 30,
    color: '#222',
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#2E1404',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    height: 66,
    justifyContent: 'center',
    marginBottom: 16,
    width: '90%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default StartRegisterScreen;
