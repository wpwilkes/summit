import {
  type ComponentRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Image,
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

import { StatusBar } from 'expo-status-bar';
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

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [codeError, setCodeError] =
    useState('');

  const [errors, setErrors] =
    useState<ResetPasswordFormErrors>({});

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [isResetting, setIsResetting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [
    isResetComplete,
    setIsResetComplete,
  ] = useState(false);

  const [
    keyboardVisible,
    setKeyboardVisible,
  ] = useState(false);

  const scrollViewRef =
    useRef<ComponentRef<typeof ScrollView>>(null);

  const codeRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef =
    useRef<ComponentRef<typeof TextInput>>(null);
  const confirmPasswordRef =
    useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const showSubscription =
      Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        }
      );

    const hideSubscription =
      Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);

          scrollViewRef.current?.scrollTo({
            y: 0,
            animated: true,
          });
        }
      );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollToPosition = (
    y: number
  ) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 200);
  };

  const clearResultMessages = () => {
    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCodeChange = (
    value: string
  ) => {
    const digitsOnly =
      value.replace(/[^0-9]/g, '');

    setCode(digitsOnly);

    if (codeError) {
      setCodeError('');
    }

    clearResultMessages();
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (
      errors.password ||
      errors.confirmPassword
    ) {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          password: undefined,
          confirmPassword: undefined,
        })
      );
    }

    clearResultMessages();
  };

  const handleConfirmPasswordChange = (
    value: string
  ) => {
    setConfirmPassword(value);

    if (errors.confirmPassword) {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          confirmPassword: undefined,
        })
      );
    }

    clearResultMessages();
  };

  const handleResetPassword =
    async () => {
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
        hasResetPasswordErrors(
          validationErrors
        )
      ) {
        return;
      }

      setIsResetting(true);

      try {
        /*
         * TEMPORARY MOCK PASSWORD RESET
         *
         * Later this will call the real
         * backend reset-password endpoint.
         */
        const response =
          await resetPassword({
            email,
            code,
            newPassword: password,
          });

        if (!response.success) {
          setErrorMessage(
            response.message
          );

          return;
        }

        setSuccessMessage(
          response.message
        );

        setIsResetComplete(true);

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

  const handleResendCode =
    async () => {
      Keyboard.dismiss();

      setErrorMessage('');
      setSuccessMessage('');
      setIsResending(true);

      try {
        const response =
          await requestPasswordReset({
            email,
          });

        if (!response.success) {
          setErrorMessage(
            response.message
          );

          return;
        }

        setCode('');
        setCodeError('');

        setSuccessMessage(
          'A new recovery code was requested. Check your email.'
        );

        setTimeout(() => {
          codeRef.current?.focus();
        }, 150);
      } catch {
        setErrorMessage(
          'Unable to resend the recovery code. Please try again.'
        );
      } finally {
        setIsResending(false);
      }
    };

  const handleBackToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Login',
        },
      ],
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* Back */}

          {!isResetComplete && (
            <Pressable
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
              accessibilityRole="button"
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ←
              </Text>
            </Pressable>
          )}

          {/* Full header */}

          {!keyboardVisible && (
            <>
              <View
                style={
                  styles.logoContainer
                }
              >
                <Image
                  source={require('../assets/reddit-icon-1.jpg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />

                <Text
                  style={
                    styles.brandName
                  }
                >
                  SUMMIT
                </Text>
              </View>

              <Text
                style={styles.title}
              >
                Reset your password
              </Text>

              {!isResetComplete && (
                <>
                  <Text
                    style={
                      styles.subtitle
                    }
                  >
                    Enter the recovery
                    code and create a new
                    password.
                  </Text>

                  <Text
                    style={
                      styles.emailText
                    }
                  >
                    {email}
                  </Text>
                </>
              )}
            </>
          )}

          {/* Compact header while typing */}

          {keyboardVisible &&
            !isResetComplete && (
              <Text
                style={
                  styles.compactTitle
                }
              >
                Reset your password
              </Text>
            )}

          {!isResetComplete ? (
            <>
              {/* Verification Code */}

              <TextInput
                ref={codeRef}
                style={[
                  styles.input,
                  codeError
                    ? styles.inputError
                    : null,
                ]}
                value={code}
                onChangeText={
                  handleCodeChange
                }
                placeholder="6-digit recovery code"
                placeholderTextColor="#6A6F73"
                keyboardType="number-pad"
                maxLength={6}
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() =>
                  scrollToPosition(100)
                }
                onSubmitEditing={() => {
                  passwordRef.current?.focus();

                  scrollToPosition(170);
                }}
              />

              {codeError !== '' && (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {codeError}
                </Text>
              )}

              {/* New Password */}

              <PasswordInput
                ref={passwordRef}
                value={password}
                onChangeText={
                  handlePasswordChange
                }
                placeholder="New Password"
                hasError={Boolean(
                  errors.password
                )}
                autoComplete="new-password"
                returnKeyType="next"
                onFocus={() =>
                  scrollToPosition(180)
                }
                onSubmitEditing={() => {
                  confirmPasswordRef.current?.focus();

                  scrollToPosition(260);
                }}
              />

              {errors.password && (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errors.password}
                </Text>
              )}

              <Text
                style={
                  styles.passwordHint
                }
              >
                Use at least 8 characters
                with uppercase, lowercase,
                a number, and a special
                character.
              </Text>

              {/* Confirm Password */}

              <PasswordInput
                ref={
                  confirmPasswordRef
                }
                value={confirmPassword}
                onChangeText={
                  handleConfirmPasswordChange
                }
                placeholder="Confirm New Password"
                hasError={Boolean(
                  errors.confirmPassword
                )}
                autoComplete="new-password"
                returnKeyType="done"
                onFocus={() =>
                  scrollToPosition(300)
                }
                onSubmitEditing={
                  handleResetPassword
                }
              />

              {errors.confirmPassword && (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errors.confirmPassword
                  }
                </Text>
              )}

              {/* Error */}

              {errorMessage !== '' && (
                <View
                  style={
                    styles.errorContainer
                  }
                >
                  <Text
                    style={
                      styles.resultErrorText
                    }
                  >
                    {errorMessage}
                  </Text>
                </View>
              )}

              {/* Success / resend message */}

              {successMessage !== '' && (
                <View
                  style={
                    styles.successContainer
                  }
                >
                  <Text
                    style={
                      styles.successText
                    }
                  >
                    {successMessage}
                  </Text>
                </View>
              )}

              {/* Reset button */}

              <Pressable
                style={[
                  styles.resetButton,

                  isResetting &&
                    styles.buttonDisabled,
                ]}
                onPress={
                  handleResetPassword
                }
                disabled={
                  isResetting ||
                  isResending
                }
                accessibilityRole="button"
              >
                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  {isResetting
                    ? 'Resetting...'
                    : 'Reset Password'}
                </Text>
              </Pressable>

              {/* Resend */}

              <Pressable
                style={
                  styles.resendButton
                }
                onPress={
                  handleResendCode
                }
                disabled={
                  isResending ||
                  isResetting
                }
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.resendText,

                    isResending &&
                      styles.resendDisabled,
                  ]}
                >
                  {isResending
                    ? 'Sending...'
                    : "Didn't receive the code? Resend Code"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Reset completed */}

              <View
                style={
                  styles.successLargeContainer
                }
              >
                <Text
                  style={
                    styles.successLargeTitle
                  }
                >
                  Password reset
                </Text>

                <Text
                  style={
                    styles.successLargeText
                  }
                >
                  Your password was reset
                  successfully. You can now
                  log in with your new
                  password.
                </Text>
              </View>

              <Pressable
                style={
                  styles.resetButton
                }
                onPress={
                  handleBackToLogin
                }
                accessibilityRole="button"
              >
                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  Back to Log In
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    container: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 180,
    },

    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginBottom: 10,
    },

    backButtonText: {
      color: '#1A1A1B',
      fontSize: 30,
    },

    logoContainer: {
      alignItems: 'center',
      marginBottom: 18,
    },

    logoImage: {
      width: 54,
      height: 54,
      borderRadius: 27,
      marginBottom: 8,
    },

    brandName: {
      color: '#1A1A1B',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 1,
    },

    title: {
      color: '#1A1A1B',
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      textAlign: 'center',
    },

    subtitle: {
      color: '#576F76',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 10,
    },

    emailText: {
      color: '#1A1A1B',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 28,
    },

    compactTitle: {
      color: '#1A1A1B',
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 24,
    },

    input: {
      minHeight: 56,
      backgroundColor: '#F2F2F2',
      borderWidth: 0,
      borderRadius: 14,
      paddingHorizontal: 16,
      color: '#1A1A1B',
      fontSize: 16,
      marginBottom: 12,
    },

    inputError: {
      borderWidth: 1,
      borderColor: '#D93900',
    },

    errorText: {
      color: '#D93900',
      fontSize: 13,
      marginBottom: 12,
    },

    passwordHint: {
      color: '#6A6F73',
      fontSize: 12,
      lineHeight: 17,
      marginTop: -2,
      marginBottom: 14,
    },

    errorContainer: {
      backgroundColor: '#FFF3F0',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },

    resultErrorText: {
      color: '#B32D00',
      fontSize: 13,
      textAlign: 'center',
    },

    successContainer: {
      backgroundColor: '#F0F8F2',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },

    successText: {
      color: '#216E39',
      fontSize: 13,
      textAlign: 'center',
    },

    resetButton: {
      minHeight: 54,
      borderRadius: 27,
      backgroundColor: '#FF4500',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },

    resetButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    resendButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 8,
    },

    resendText: {
      color: '#1A1A1B',
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },

    resendDisabled: {
      opacity: 0.5,
    },

    successLargeContainer: {
      backgroundColor: '#F2F2F2',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 24,
      marginTop: 30,
      marginBottom: 20,
    },

    successLargeTitle: {
      color: '#1A1A1B',
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },

    successLargeText: {
      color: '#576F76',
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
