import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation.types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

export default function WelcomeScreen({
  navigation,
}: Props) {
  return (
    <ImageBackground
      source={require('../assets/summit-welcome.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Summit branding */}

        <View style={styles.topContainer}>
          <View style={styles.brandContainer}>
            <Image
              source={require('../assets/reddit-icon-1.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.brandName}>
              SUMMIT
            </Text>
          </View>

          {/* Main welcome message */}

          <Text style={styles.title}>
            The most real place{'\n'}
            on the internet
          </Text>
        </View>

        {/* Bottom buttons */}

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() =>
              navigation.navigate('Signup')
            }
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() =>
              navigation.navigate('Login')
            }
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  topContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },

  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 9,
  },

  brandName: {
    color: '#1a1a1b',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    color: '#1a1a1b',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
  },

  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },

  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },

  primaryButtonText: {
    color: '#1a1a1b',
    fontSize: 17,
    fontWeight: '700',
  },

  secondaryButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  secondaryButtonText: {
    color: '#1a1a1b',
    fontSize: 16,
    fontWeight: '700',
  },

  pressedButton: {
    opacity: 0.8,
  },
});