import {
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

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const scrollViewRef =
    useRef<ScrollView>(null);

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

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const scrollFormIntoView = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 150,
        animated: true,
      });
    }, 200);
  };

  const handleRecovery = async () => {
    Keyboard.dismiss();

    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        'Email is required.'
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    if (
      !emailPattern.test(trimmedEmail)
    ) {
      setErrorMessage(
        'Please enter a valid email address.'
      );
      return;
    }

    setIsSending(true);

    try {
      /*
       * TEMPORARY MOCK PASSWORD RESET
       *
       * requestPasswordReset() currently uses
       * the mock authentication service.
       *
       * Later this will call the real backend.
       */
      const response =
        await requestPasswordReset({
          email: trimmedEmail,
        });

      if (!response.success) {
        setErrorMessage(
          response.message
        );
        return;
      }

      /*
       * Move to Reset Password after the
       * recovery request succeeds.
       */
      navigation.navigate(
        'ResetPassword',
        {
          email: trimmedEmail,
        }
      );
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
                Reset your password
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Enter your email address and
                we'll send you a recovery code
                to reset your password.
              </Text>
            </>
          )}

          {/* Compact heading while keyboard is open */}

          {keyboardVisible && (
            <Text
              style={
                styles.compactTitle
              }
            >
              Reset your password
            </Text>
          )}

          {/* Email */}

          <TextInput
            style={[
              styles.input,
              errorMessage
                ? styles.inputError
                : null,
            ]}
            placeholder="Email"
            placeholderTextColor="#6A6F73"
            value={email}
            onChangeText={
              handleEmailChange
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="done"
            onFocus={scrollFormIntoView}
            onSubmitEditing={
              handleRecovery
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

          {/* Reset button */}

          <Pressable
            style={[
              styles.button,

              isSending &&
                styles.buttonDisabled,
            ]}
            onPress={handleRecovery}
            disabled={isSending}
            accessibilityRole="button"
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {isSending
                ? 'Sending...'
                : 'Reset Password'}
            </Text>
          </Pressable>

          {/* Back to Login */}

          <Pressable
            style={
              styles.backToLoginButton
            }
            onPress={() =>
              navigation.navigate(
                'Login'
              )
            }
            accessibilityRole="button"
            disabled={isSending}
          >
            <Text
              style={
                styles.backToLoginText
              }
            >
              Back to Log In
            </Text>
          </Pressable>
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
      marginBottom: 18,
    },

    backButtonText: {
      color: '#1A1A1B',
      fontSize: 30,
    },

    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
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
      marginBottom: 32,
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

    errorContainer: {
      backgroundColor: '#FFF3F0',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },

    errorText: {
      color: '#B32D00',
      fontSize: 13,
      textAlign: 'center',
    },

    button: {
      minHeight: 54,
      backgroundColor: '#FF4500',
      borderRadius: 27,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 6,
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    backToLoginButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 14,
    },

    backToLoginText: {
      color: '#1A1A1B',
      fontSize: 14,
      fontWeight: '700',
    },
  });