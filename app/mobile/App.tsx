import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';

import { RootStackParamList } from './src/types/navigation.types';
import { getAuthToken } from './src/utils/tokenStorage';

const Stack = createNativeStackNavigator<RootStackParamList>();

type InitialRoute = 'Login' | 'Home';

export default function App() {
  const [initialRoute, setInitialRoute] =
    useState<InitialRoute>('Login');

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  useEffect(() => {
    const checkStoredLogin = async () => {
      try {
        /*
         * Check SecureStore when the app starts.
         *
         * If a token exists, the user has already
         * logged in and can enter the authenticated
         * part of the app.
         */
        const token = await getAuthToken();

        if (token) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch {
        /*
         * If SecureStore cannot be read for some
         * reason, safely send the user to Login.
         */
        setInitialRoute('Login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkStoredLogin();
  }, []);

  /*
   * Do not briefly show Login while SecureStore
   * is still being checked.
   */
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#e7c86e"
          />
        </View>

        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
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

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f10',
    justifyContent: 'center',
    alignItems: 'center',
  },
});