import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import WelcomeScreen from './src/screens/WelcomeScreen';
import PublicFeedScreen from './src/screens/PublicFeedScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';

import PopularScreen from './src/screens/PopularScreen';
import NewsScreen from './src/screens/NewsScreen';

import DiscoverCommunitiesScreen from './src/screens/DiscoverCommunitiesScreen';
import TopicCommunitiesScreen from './src/screens/TopicCommunitiesScreen';
import SubtopicCommunitiesScreen from './src/screens/SubtopicCommunitiesScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import StartCommunityScreen from './src/screens/StartCommunityScreen';
import SearchScreen from './src/screens/SearchScreen';

import type {
  RootStackParamList,
} from './src/types/navigation.types';

import {
  getAuthToken,
} from './src/utils/tokenStorage';

const Stack =
  createNativeStackNavigator<
    RootStackParamList
  >();

type InitialRoute =
  | 'Welcome'
  | 'Home';

export default function App() {
  const [
    initialRoute,
    setInitialRoute,
  ] =
    useState<InitialRoute>(
      'Welcome',
    );

  const [
    isCheckingAuth,
    setIsCheckingAuth,
  ] = useState(true);

  useEffect(() => {
    const checkStoredLogin =
      async () => {
        try {
          const token =
            await getAuthToken();

          if (token) {
            setInitialRoute(
              'Home',
            );
          } else {
            setInitialRoute(
              'Welcome',
            );
          }
        } catch {
          setInitialRoute(
            'Welcome',
          );
        } finally {
          setIsCheckingAuth(
            false,
          );
        }
      };

    checkStoredLogin();
  }, []);

  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#e7c86e"
          />
        </View>

        <StatusBar
          style="light"
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={
            initialRoute
          }
          screenOptions={{
            contentStyle: {
              backgroundColor:
                '#0f0f10',
            },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={
              WelcomeScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="PublicFeed"
            component={
              PublicFeedScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Login"
            component={
              LoginScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Signup"
            component={
              SignupScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="EmailVerification"
            component={
              EmailVerificationScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={
              ForgotPasswordScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="ResetPassword"
            component={
              ResetPasswordScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Home"
            component={
              HomeScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Popular"
            component={
              PopularScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="News"
            component={
              NewsScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="DiscoverCommunities"
            component={
              DiscoverCommunitiesScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="TopicCommunities"
            component={
              TopicCommunitiesScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="SubtopicCommunities"
            component={
              SubtopicCommunitiesScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Community"
            component={
              CommunityScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="StartCommunity"
            component={
              StartCommunityScreen
            }
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Search"
            component={
              SearchScreen
            }
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

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      backgroundColor:
        '#0f0f10',
      justifyContent:
        'center',
      alignItems: 'center',
    },
  });