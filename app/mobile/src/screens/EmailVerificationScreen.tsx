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

import {
  resendVerificationCode,
  verifyEmail,
} from '../services/authService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EmailVerification'
>;

export default function EmailVerificationScreen({
  navigation,
  route,
}: Props) {
  const { email } = route.params;

  const [verificationCode, setVerificationCode] =
    useState('');

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const codeInputRef = useRef<TextInput>(null);

  const handleCodeChange = (value: string) => {
    // Allow numbers only.
    const numericValue = value.replace(/[^0-9]/g, '');

    setVerificationCode(numericValue);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();

    if (!verificationCode) {
      setSuccessMessage('');
      setErrorMessage(
        'Please enter the verification code.'
      );
      return;
    }

    if (verificationCode.length !== 6) {
      setSuccessMessage('');
      setErrorMessage(
        'Verification code must be 6 digits.'
      );
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsVerifying(true);

    try {
      /*
       * MOCK AUTHENTICATION CALL
       *
       * For now, verifyEmail() uses the
       * temporary mock authentication service.
       *
       * Later, authService.ts will send the same
       * request to Wesley's real backend.
       */
      const response = await verifyEmail({
        email,
        code: verificationCode,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      setSuccessMessage(
        `${response.message} Redirecting to Login...`
      );

      /*
       * Login is the first screen in our auth stack,
       * so return to it after successful verification.
       */
      setTimeout(() => {
        navigation.popToTop();
      }, 1200);
    } catch {
      setErrorMessage(
        'Unable to verify email. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    Keyboard.dismiss();

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      /*
       * MOCK AUTHENTICATION CALL
       *
       * Later this same service function will call
       * Wesley's real resend-verification API.
       */
      const response =
        await resendVerificationCode({
          email,
        });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      setVerificationCode('');
      setSuccessMessage(response.message);

      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    } catch {
      setErrorMessage(
        'Unable to resend the verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
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
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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
            Verify Your Email
          </Text>

          <Text style={styles.subtitle}>
            We sent a verification code to:
          </Text>

          <Text style={styles.emailText}>
            {email}
          </Text>

          <Pressable
            style={styles.codeContainer}
            onPress={() =>
              codeInputRef.current?.focus()
            }
          >
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    verificationCode.length ===
                    index
                      ? styles.activeCodeBox
                      : null,
                  ]}
                >
                  <Text style={styles.codeDigit}>
                    {verificationCode[index] ??
                      ''}
                  </Text>
                </View>
              )
            )}
          </Pressable>

          <TextInput
            ref={codeInputRef}
            style={styles.hiddenInput}
            value={verificationCode}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />

          {errorMessage !== '' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {successMessage !== '' && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.button,
              isVerifying
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={handleVerify}
            disabled={
              isVerifying || isResending
            }
          >
            <Text style={styles.buttonText}>
              {isVerifying
                ? 'Verifying...'
                : 'Verify'}
            </Text>
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
            </Text>

            <Pressable
              onPress={handleResendCode}
              disabled={
                isResending || isVerifying
              }
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendLink,
                  isResending
                    ? styles.resendDisabled
                    : null,
                ]}
              >
                {isResending
                  ? 'Sending...'
                  : 'Resend Code'}
              </Text>
            </Pressable>
          </View>
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
    paddingVertical: 40,
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
    textAlign: 'center',
    marginTop: 10,
  },

  emailText: {
    color: '#e7c86e',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  codeBox: {
    width: 44,
    height: 54,
    backgroundColor: '#19191c',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeCodeBox: {
    borderColor: '#e7c86e',
  },

  codeDigit: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  errorContainer: {
    backgroundColor: '#2a1717',
    borderWidth: 1,
    borderColor: '#8a3d3d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 4,
  },

  errorText: {
    color: '#ffb4b4',
    fontSize: 13,
    textAlign: 'center',
  },

  successContainer: {
    backgroundColor: '#17271d',
    borderWidth: 1,
    borderColor: '#3d7950',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 4,
  },

  successText: {
    color: '#a8e6b8',
    fontSize: 13,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#e7c86e',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  resendText: {
    color: '#888888',
    fontSize: 14,
  },

  resendLink: {
    color: '#e7c86e',
    fontSize: 14,
    fontWeight: '600',
  },

  resendDisabled: {
    opacity: 0.6,
  },
});