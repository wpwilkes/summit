import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Summit Brand */}

        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>S</Text>
          </View>

          <Text style={styles.brandName}>
            Summit
          </Text>
        </View>

        {/* Welcome Message */}

        <View style={styles.messageContainer}>
          <Text style={styles.title}>
            Find the discussion that matters.
          </Text>

          <Text style={styles.subtitle}>
            Explore posts, join conversations, and
            understand long discussions faster with
            AI-generated reply summaries.
          </Text>
        </View>

        {/* Entry Options */}

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('Signup')
            }
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Create Account
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Login')
            }
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              Log In
            </Text>
          </Pressable>

          <Pressable
            style={styles.browseButton}
            onPress={() =>
              navigation.navigate('PublicFeed')
            }
            accessibilityRole="button"
          >
            <Text style={styles.browseButtonText}>
              Browse Summit
            </Text>

            <Text style={styles.browseDescription}>
              Continue without an account
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Summit — discussions made easier to follow.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f10',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 42,
    height: 42,
    backgroundColor: '#e7c86e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  logoText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '600',
  },

  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  subtitle: {
    color: '#999999',
    fontSize: 16,
    lineHeight: 24,
  },

  buttonContainer: {
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: '#e7c86e',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#e7c86e',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: '#e7c86e',
    fontSize: 16,
    fontWeight: '700',
  },

  browseButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  browseButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  browseDescription: {
    color: '#777777',
    fontSize: 12,
    marginTop: 4,
  },

  footerText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
});