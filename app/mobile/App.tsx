import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

import { RootStackParamList } from './src/types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            contentStyle: {
              backgroundColor: '#0f0f10',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#0f0f10',
              },
              headerTintColor: '#e7c86e',
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}
          />

          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#0f0f10',
              },
              headerTintColor: '#e7c86e',
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#0f0f10',
              },
              headerTintColor: '#e7c86e',
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}
          />

          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: '#0f0f10',
              },
              headerTintColor: '#e7c86e',
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}