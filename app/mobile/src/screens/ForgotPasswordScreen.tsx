import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation.types';
import { requestPasswordReset } from '../services/authService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen({
  navigation,
}: Props) {
  const [email, setEmail] = useState('');

  const [errorMessage, setErrorMessage] =
    useState('');

  const [isSending, setIsSending] =
    useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const scrollFormIntoView = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 250);
  };

  const handleRecovery = async () => {
    Keyboard.dismiss();

    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Email is required.');
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage(
        'Please enter a valid email address.'
      );
      return;
    }

    setIsSending(true);

    try {
      /*
       * MOCK AUTHENTICATION CALL
       *
       * For now, requestPasswordReset() uses
       * the temporary mock authentication service.
       *
       * Later, authService.ts will send this same
       * request to Wesley's real backend:
       *
       * {
       *   email
       * }
       *
       * The backend response should remain
       * privacy-safe and should not reveal
       * whether the email is registered.
       */
      const response =
        await requestPasswordReset({
          email: trimmedEmail,
        });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      /*
       * After the recovery request succeeds,
       * immediately move to Reset Password.
       *
       * The Reset Password screen will show
       * the permanent recovery-code instruction.
       */
      navigation.navigate('ResetPassword', {
        email: trimmedEmail,
      });
    } catch {
      setErrorMessage(
        'Unable to send the recovery code. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brandName}>
              Summit
            </Text>
          </View>

          <Text style={styles.title}>
            Forgot Password
          </Text>

          <Text style={styles.subtitle}>
            Enter the email associated with your
            account and we will send a password
            recovery code.
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={[
              styles.input,
              errorMessage
                ? styles.inputError
                : null,
            ]}
            placeholder="Enter your email"
            placeholderTextColor="#777777"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="done"
            onFocus={scrollFormIntoView}
            onSubmitEditing={handleRecovery}
          />

          {errorMessage !== '' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.button,
              isSending
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={handleRecovery}
            disabled={isSending}
          >
            <Text style={styles.buttonText}>
              {isSending
                ? 'Sending...'
                : 'Send Recovery Code'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.backToLoginButton}
            onPress={() =>
              navigation.navigate('Login')
            }
            accessibilityRole="button"
            disabled={isSending}
          >
            <Text style={styles.backToLoginText}>
              Back to Login
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120,
  },

  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: '#e7c86e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  logoText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '600',
  },

  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#999999',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 32,
  },

  label: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#19191c',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },

  inputError: {
    borderColor: '#d96565',
  },

  errorContainer: {
    backgroundColor: '#2a1717',
    borderWidth: 1,
    borderColor: '#8a3d3d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 4,
  },

  errorText: {
    color: '#ffb4b4',
    fontSize: 13,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#e7c86e',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },

  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },

  backToLoginText: {
    color: '#e7c86e',
    fontSize: 14,
    fontWeight: '600',
  },
});