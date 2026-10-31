import {
  type ComponentRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
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
import { RootStackParamList } from '../types/navigation.types';

import {
  LoginFormErrors,
  hasLoginErrors,
  validateLoginForm,
} from '../utils/authValidation';

import { loginUser } from '../services/authService';
import { saveAuthToken } from '../utils/tokenStorage';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen({
  navigation,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] =
    useState<LoginFormErrors>({});

  const [errorMessage, setErrorMessage] =
    useState('');

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

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

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Sign-In',
      'Google sign-in is coming soon.'
    );
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    setErrorMessage('');

    const validationErrors =
      validateLoginForm({
        email,
        password,
      });

    setErrors(validationErrors);

    if (
      hasLoginErrors(validationErrors)
    ) {
      return;
    }

    const trimmedEmail = email.trim();

    setIsLoggingIn(true);

    try {
      const response = await loginUser({
        email: trimmedEmail,
        password,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      if (!response.token) {
        setErrorMessage(
          'Login succeeded, but no authentication token was returned.'
        );
        return;
      }

      await saveAuthToken(
        response.token
      );

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
          },
        ],
      });
    } catch {
      setErrorMessage(
        'Unable to log in. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailChange = (
    value: string
  ) => {
    setEmail(value);

    if (errors.email) {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          email: undefined,
        })
      );
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (
    value: string
  ) => {
    setPassword(value);

    if (errors.password) {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          password: undefined,
        })
      );
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const scrollToEmail = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 120,
        animated: true,
      });
    }, 200);
  };

  const scrollToPassword = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 240,
        animated: true,
      });
    }, 200);
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
          {/* Back button */}

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

          {/* Full header when keyboard is closed */}

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
                Log in to Summit
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Welcome back. Continue
                the conversation.
              </Text>

              {/* Google */}

              <Pressable
                style={
                  styles.googleButton
                }
                onPress={
                  handleGoogleLogin
                }
                accessibilityRole="button"
              >
                <View
                  style={
                    styles.googleIcon
                  }
                >
                  <Text
                    style={
                      styles.googleIconText
                    }
                  >
                    G
                  </Text>
                </View>

                <Text
                  style={
                    styles.googleButtonText
                  }
                >
                  Continue with Google
                </Text>
              </Pressable>

              {/* Divider */}

              <View
                style={
                  styles.dividerContainer
                }
              >
                <View
                  style={
                    styles.dividerLine
                  }
                />

                <Text
                  style={
                    styles.dividerText
                  }
                >
                  OR
                </Text>

                <View
                  style={
                    styles.dividerLine
                  }
                />
              </View>
            </>
          )}

          {/* Compact heading while keyboard is open */}

          {keyboardVisible && (
            <Text
              style={
                styles.compactTitle
              }
            >
              Log in to Summit
            </Text>
          )}

          {/* Email or Username */}

          <TextInput
            style={[
              styles.input,
              errors.email
                ? styles.inputError
                : null,
            ]}
            placeholder="Email or Username"
            placeholderTextColor="#6A6F73"
            value={email}
            onChangeText={
              handleEmailChange
            }
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onFocus={scrollToEmail}
            onSubmitEditing={() => {
              passwordRef.current?.focus();
              scrollToPassword();
            }}
          />

          {errors.email && (
            <Text
              style={styles.errorText}
            >
              {errors.email}
            </Text>
          )}

          {/* Password */}

          <PasswordInput
            ref={passwordRef}
            hasError={Boolean(
              errors.password
            )}
            placeholder="Password"
            value={password}
            onChangeText={
              handlePasswordChange
            }
            autoComplete="current-password"
            returnKeyType="done"
            onFocus={scrollToPassword}
            onSubmitEditing={
              handleLogin
            }
          />

          {errors.password && (
            <Text
              style={styles.errorText}
            >
              {errors.password}
            </Text>
          )}

          {/* Forgot Password */}

          <Pressable
            style={
              styles.forgotPasswordButton
            }
            onPress={() =>
              navigation.navigate(
                'ForgotPassword'
              )
            }
            accessibilityRole="button"
          >
            <Text
              style={
                styles.forgotPasswordText
              }
            >
              Forgot password?
            </Text>
          </Pressable>

          {/* Login Error */}

          {errorMessage !== '' && (
            <View
              style={
                styles.resultErrorContainer
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

          {/* Login Button */}

          <Pressable
            style={[
              styles.loginButton,
              isLoggingIn &&
                styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoggingIn}
            accessibilityRole="button"
          >
            <Text
              style={
                styles.loginButtonText
              }
            >
              {isLoggingIn
                ? 'Logging In...'
                : 'Log In'}
            </Text>
          </Pressable>

          {/* Signup */}

          <Text
            style={styles.signupText}
          >
            New to Summit?{' '}
            <Text
              style={styles.signupLink}
              onPress={() =>
                navigation.navigate(
                  'Signup'
                )
              }
            >
              Sign up
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#ffffff',
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
      marginBottom: 8,
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
      fontWeight: '800',
      textAlign: 'center',
    },

    subtitle: {
      color: '#576F76',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 26,
    },

    compactTitle: {
      color: '#1A1A1B',
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 22,
    },

    googleButton: {
      height: 54,
      borderWidth: 1,
      borderColor: '#D6D9DC',
      borderRadius: 27,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    googleIcon: {
      position: 'absolute',
      left: 20,
    },

    googleIconText: {
      color: '#4285F4',
      fontSize: 18,
      fontWeight: '700',
    },

    googleButtonText: {
      color: '#1A1A1B',
      fontSize: 15,
      fontWeight: '600',
    },

    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#EDEFF1',
    },

    dividerText: {
      color: '#878A8C',
      fontSize: 12,
      fontWeight: '600',
      marginHorizontal: 14,
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
      marginBottom: 14,
    },

    forgotPasswordButton: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: '#D6D9DC',
      borderRadius: 18,
      paddingHorizontal: 13,
      paddingVertical: 8,
      marginTop: 2,
      marginBottom: 18,
    },

    forgotPasswordText: {
      color: '#1A1A1B',
      fontSize: 13,
      fontWeight: '600',
    },

    resultErrorContainer: {
      backgroundColor: '#FFF3F0',
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },

    resultErrorText: {
      color: '#B32D00',
      fontSize: 13,
      textAlign: 'center',
    },

    loginButton: {
      minHeight: 54,
      borderRadius: 27,
      backgroundColor: '#FF4500',
      justifyContent: 'center',
      alignItems: 'center',
    },

    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    signupText: {
      color: '#1A1A1B',
      textAlign: 'center',
      marginTop: 22,
      fontSize: 14,
    },

    signupLink: {
      color: '#1A1A1B',
      fontWeight: '800',
    },
  });
