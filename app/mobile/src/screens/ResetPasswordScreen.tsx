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

import PasswordInput from '../components/PasswordInput';
import {
  ResetPasswordFormErrors,
  hasResetPasswordErrors,
  validateResetPasswordForm,
} from '../utils/authValidation';
import { RootStackParamList } from '../types/navigation.types';
import {
  requestPasswordReset,
  resetPassword,
} from '../services/authService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

export default function ResetPasswordScreen({
  navigation,
  route,
}: Props) {
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [codeError, setCodeError] = useState('');

  const [errors, setErrors] =
    useState<ResetPasswordFormErrors>({});

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [isResetting, setIsResetting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [isResetComplete, setIsResetComplete] =
    useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const codePosition = useRef(0);
  const passwordPosition = useRef(0);
  const confirmPasswordPosition = useRef(0);

  const scrollToField = (position: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(position - 80, 0),
        animated: true,
      });
    }, 250);
  };

  const clearResultMessages = () => {
    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');

    setCode(digitsOnly);

    if (codeError) {
      setCodeError('');
    }

    clearResultMessages();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (
      errors.password ||
      errors.confirmPassword
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        password: undefined,
        confirmPassword: undefined,
      }));
    }

    clearResultMessages();
  };

  const handleConfirmPasswordChange = (
    value: string
  ) => {
    setConfirmPassword(value);

    if (errors.confirmPassword) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        confirmPassword: undefined,
      }));
    }

    clearResultMessages();
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    setErrorMessage('');
    setSuccessMessage('');

    let currentCodeError = '';

    if (!code) {
      currentCodeError =
        'Verification code is required.';
    } else if (code.length !== 6) {
      currentCodeError =
        'Verification code must be 6 digits.';
    }

    const validationErrors =
      validateResetPasswordForm({
        password,
        confirmPassword,
      });

    setCodeError(currentCodeError);
    setErrors(validationErrors);

    if (
      currentCodeError ||
      hasResetPasswordErrors(validationErrors)
    ) {
      return;
    }

    setIsResetting(true);

    try {
      /*
       * MOCK AUTHENTICATION CALL
       *
       * For now, resetPassword() uses the
       * temporary mock authentication service.
       *
       * Later, authService.ts will send the
       * same request to Wesley's backend:
       *
       * {
       *   email,
       *   code,
       *   newPassword
       * }
       */
      const response = await resetPassword({
        email,
        code,
        newPassword: password,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      /*
       * Password reset succeeded.
       *
       * Stay on this screen so the user has
       * enough time to read the confirmation.
       * The user can then choose Back to Login.
       */
      setSuccessMessage(response.message);
      setIsResetComplete(true);

      /*
       * Clear sensitive values after success.
       */
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setCodeError('');
      setErrors({});
    } catch {
      setErrorMessage(
        'Unable to reset the password. Please try again.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleResendCode = async () => {
    Keyboard.dismiss();

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      /*
       * Request another recovery code.
       *
       * We use the same password-recovery
       * request again with the account email.
       */
      const response =
        await requestPasswordReset({
          email,
        });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      /*
       * Clear the previous code because a
       * new recovery code was requested.
       */
      setCode('');
      setCodeError('');

      setSuccessMessage(
        'A new recovery code was requested. Check your email.'
      );

      setTimeout(() => {
        codeRef.current?.focus();
      }, 100);
    } catch {
      setErrorMessage(
        'Unable to resend the recovery code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.popToTop();
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
              <Text style={styles.logoText}>
                S
              </Text>
            </View>

            <Text style={styles.brandName}>
              Summit
            </Text>
          </View>

          <Text style={styles.title}>
            Reset Password
          </Text>

          <Text style={styles.subtitle}>
            If an account exists for {email}, a
            6-digit recovery code has been sent.
            Enter the code below and create a new
            password.
          </Text>

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>
              Account
            </Text>

            <Text style={styles.emailText}>
              {email}
            </Text>
          </View>

          {/* Verification Code */}

          <View
            onLayout={(event) => {
              codePosition.current =
                event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.label}>
              Verification Code
            </Text>

            <TextInput
              ref={codeRef}
              style={[
                styles.input,
                codeError
                  ? styles.inputError
                  : null,
              ]}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
              maxLength={6}
              autoCorrect={false}
              returnKeyType="next"
              editable={!isResetComplete}
              onFocus={() =>
                scrollToField(
                  codePosition.current
                )
              }
              onSubmitEditing={() =>
                passwordRef.current?.focus()
              }
            />

            {codeError ? (
              <Text style={styles.errorText}>
                {codeError}
              </Text>
            ) : null}
          </View>

          {/* New Password */}

          <View
            onLayout={(event) => {
              passwordPosition.current =
                event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.label}>
              New Password
            </Text>

            <PasswordInput
              ref={passwordRef}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your new password"
              hasError={Boolean(errors.password)}
              autoComplete="new-password"
              returnKeyType="next"
              editable={!isResetComplete}
              onFocus={() =>
                scrollToField(
                  passwordPosition.current
                )
              }
              onSubmitEditing={() =>
                confirmPasswordRef.current?.focus()
              }
            />

            {errors.password ? (
              <Text style={styles.errorText}>
                {errors.password}
              </Text>
            ) : null}

            <Text style={styles.passwordHint}>
              Use at least 8 characters with
              uppercase, lowercase, a number, and a
              special character (! @ # $ % ^ & *).
            </Text>
          </View>

          {/* Confirm Password */}

          <View
            onLayout={(event) => {
              confirmPasswordPosition.current =
                event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.label}>
              Confirm New Password
            </Text>

            <PasswordInput
              ref={confirmPasswordRef}
              value={confirmPassword}
              onChangeText={
                handleConfirmPasswordChange
              }
              placeholder="Enter new password again"
              hasError={Boolean(
                errors.confirmPassword
              )}
              autoComplete="new-password"
              returnKeyType="done"
              editable={!isResetComplete}
              onFocus={() =>
                scrollToField(
                  confirmPasswordPosition.current
                )
              }
              onSubmitEditing={
                handleResetPassword
              }
            />

            {errors.confirmPassword ? (
              <Text style={styles.errorText}>
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>

          {/* Mock / Backend Result */}

          {errorMessage !== '' && (
            <View style={styles.resultErrorContainer}>
              <Text style={styles.resultErrorText}>
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

          {!isResetComplete ? (
            <>
              <Pressable
                style={[
                  styles.button,
                  isResetting
                    ? styles.buttonDisabled
                    : null,
                ]}
                onPress={handleResetPassword}
                disabled={
                  isResetting ||
                  isResending
                }
              >
                <Text style={styles.buttonText}>
                  {isResetting
                    ? 'Resetting...'
                    : 'Reset Password'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={
                  isResending ||
                  isResetting
                }
                accessibilityRole="button"
              >
                <Text style={styles.resendText}>
                  {isResending
                    ? 'Sending...'
                    : "Didn't receive the code? Resend Recovery Code"}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.button}
              onPress={handleBackToLogin}
            >
              <Text style={styles.buttonText}>
                Back to Login
              </Text>
            </Pressable>
          )}
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
    marginBottom: 36,
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
    marginBottom: 24,
  },

  emailContainer: {
    backgroundColor: '#181819',
    borderWidth: 1,
    borderColor: '#2c2c2e',
    padding: 14,
    marginBottom: 24,
  },

  emailLabel: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 4,
  },

  emailText: {
    color: '#dddddd',
    fontSize: 14,
  },

  label: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#181819',
    borderWidth: 1,
    borderColor: '#333333',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },

  inputError: {
    borderColor: '#ff7777',
  },

  errorText: {
    color: '#ff9f9f',
    fontSize: 13,
    marginBottom: 14,
  },

  passwordHint: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },

  resultErrorContainer: {
    backgroundColor: '#2a1717',
    borderWidth: 1,
    borderColor: '#8a3d3d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  resultErrorText: {
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
    marginBottom: 12,
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
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },

  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },

  resendText: {
    color: '#e7c86e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});