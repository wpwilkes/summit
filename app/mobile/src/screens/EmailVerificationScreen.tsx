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

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const codeInputRef = useRef<ComponentRef<typeof TextInput>>(null);

  const scrollViewRef =
    useRef<ComponentRef<typeof ScrollView>>(null);

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

  const handleCodeChange = (
    value: string
  ) => {
    const numericValue =
      value.replace(/[^0-9]/g, '');

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
       * TEMPORARY MOCK VERIFICATION
       *
       * For now, verifyEmail() checks the
       * temporary mock code.
       *
       * This will later be replaced with
       * the real backend verification endpoint.
       */
      const response = await verifyEmail({
        email,
        code: verificationCode,
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

      /*
       * After successful verification,
       * go directly to Login.
       */
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
            },
          ],
        });
      }, 1000);
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
      const response =
        await resendVerificationCode({
          email,
        });

      if (!response.success) {
        setErrorMessage(
          response.message
        );

        return;
      }

      setVerificationCode('');

      setSuccessMessage(
        response.message
      );

      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
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
                Verify your email
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                We sent a 6-digit
                verification code to
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

          {/* Compact header while keyboard open */}

          {keyboardVisible && (
            <>
              <Text
                style={
                  styles.compactTitle
                }
              >
                Verify your email
              </Text>

              <Text
                style={
                  styles.compactEmail
                }
              >
                {email}
              </Text>
            </>
          )}

          {/* Verification code */}

          <Pressable
            style={
              styles.codeContainer
            }
            onPress={() =>
              codeInputRef.current?.focus()
            }
            accessibilityRole="button"
          >
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.codeBox,

                  verificationCode.length ===
                  index
                    ? styles.activeCodeBox
                    : null,

                  verificationCode[index]
                    ? styles.filledCodeBox
                    : null,
                ]}
              >
                <Text
                  style={
                    styles.codeDigit
                  }
                >
                  {verificationCode[
                    index
                  ] ?? ''}
                </Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={codeInputRef}
            style={styles.hiddenInput}
            value={verificationCode}
            onChangeText={
              handleCodeChange
            }
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={
              handleVerify
            }
          />

          {/* Error */}

          {errorMessage !== '' && (
            <View
              style={
                styles.errorContainer
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Success */}

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

          {/* Verify */}

          <Pressable
            style={[
              styles.verifyButton,

              isVerifying &&
                styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={
              isVerifying ||
              isResending
            }
            accessibilityRole="button"
          >
            <Text
              style={
                styles.verifyButtonText
              }
            >
              {isVerifying
                ? 'Verifying...'
                : 'Verify'}
            </Text>
          </Pressable>

          {/* Resend */}

          <View
            style={
              styles.resendContainer
            }
          >
            <Text
              style={
                styles.resendText
              }
            >
              Didn't receive the code?
            </Text>

            <Pressable
              onPress={
                handleResendCode
              }
              disabled={
                isResending ||
                isVerifying
              }
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendLink,

                  isResending &&
                    styles.resendDisabled,
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
      paddingBottom: 120,
    },

    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginBottom: 16,
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
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 10,
    },

    emailText: {
      color: '#1A1A1B',
      fontSize: 15,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 34,
    },

    compactTitle: {
      color: '#1A1A1B',
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 6,
    },

    compactEmail: {
      color: '#576F76',
      fontSize: 14,
      marginBottom: 24,
    },

    codeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },

    codeBox: {
      width: 46,
      height: 58,
      backgroundColor: '#F2F2F2',
      borderWidth: 1,
      borderColor: '#E5E5E5',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    activeCodeBox: {
      borderWidth: 2,
      borderColor: '#1A1A1B',
    },

    filledCodeBox: {
      backgroundColor: '#F7F7F7',
    },

    codeDigit: {
      color: '#1A1A1B',
      fontSize: 22,
      fontWeight: '700',
    },

    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
    },

    errorContainer: {
      backgroundColor: '#FFF3F0',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 10,
      marginBottom: 4,
    },

    errorText: {
      color: '#B32D00',
      fontSize: 13,
      textAlign: 'center',
    },

    successContainer: {
      backgroundColor: '#F0F8F2',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 10,
      marginBottom: 4,
    },

    successText: {
      color: '#216E39',
      fontSize: 13,
      textAlign: 'center',
    },

    verifyButton: {
      minHeight: 54,
      borderRadius: 27,
      backgroundColor: '#FF4500',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },

    verifyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    resendContainer: {
      alignItems: 'center',
      marginTop: 24,
    },

    resendText: {
      color: '#1A1A1B',
      fontSize: 14,
      marginBottom: 6,
    },

    resendLink: {
      color: '#1A1A1B',
      fontSize: 14,
      fontWeight: '800',
    },

    resendDisabled: {
      opacity: 0.5,
    },
  });
