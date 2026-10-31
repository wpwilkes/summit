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
  SignupFormErrors,
  getEmailSuggestion,
  hasSignupErrors,
  validateSignupForm,
} from '../utils/authValidation';

import { registerUser } from '../services/authService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Signup'
>;

export default function SignupScreen({
  navigation,
}: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [errors, setErrors] =
    useState<SignupFormErrors>({});

  const [submitError, setSubmitError] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  const scrollViewRef =
    useRef<ComponentRef<typeof ScrollView>>(null);

  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const confirmPasswordRef =
    useRef<ComponentRef<typeof TextInput>>(null);

  const emailSuggestion =
    getEmailSuggestion(email);

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

  const handleGoogleSignup = () => {
    Alert.alert(
      'Google Sign-In',
      'Google sign-in is coming soon.'
    );
  };

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

  const handleSignup = async () => {
    Keyboard.dismiss();

    setSubmitError('');

    const validationErrors =
      validateSignupForm({
        username,
        email,
        password,
        confirmPassword,
      });

    setErrors(validationErrors);

    if (
      hasSignupErrors(validationErrors)
    ) {
      return;
    }

    const trimmedUsername =
      username.trim();

    const trimmedEmail =
      email.trim();

    setIsSubmitting(true);

    try {
      const response =
        await registerUser({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        });

      if (!response.success) {
        setSubmitError(
          response.message
        );
        return;
      }

      navigation.navigate(
        'EmailVerification',
        {
          email: trimmedEmail,
        }
      );
    } catch {
      setSubmitError(
        'Unable to create account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (
    value: string
  ) => {
    setUsername(value);

    if (errors.username) {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          username: undefined,
        })
      );
    }

    if (submitError) {
      setSubmitError('');
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

    if (submitError) {
      setSubmitError('');
    }
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

    if (submitError) {
      setSubmitError('');
    }
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

    if (submitError) {
      setSubmitError('');
    }
  };

  const useSuggestedEmail = () => {
    if (!emailSuggestion) {
      return;
    }

    setEmail(emailSuggestion);

    setErrors(
      (currentErrors) => ({
        ...currentErrors,
        email: undefined,
      })
    );

    setSubmitError('');
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

          {/* Full header when keyboard closed */}

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
                Hi new friend,
                {'\n'}
                welcome to Summit
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Create an account to
                get started
              </Text>

              {/* Google */}

              <Pressable
                style={
                  styles.googleButton
                }
                onPress={
                  handleGoogleSignup
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

              {/* OR */}

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

          {/* Compact title while typing */}

          {keyboardVisible && (
            <Text
              style={
                styles.compactTitle
              }
            >
              Create your Summit account
            </Text>
          )}

          {/* Username */}

          <TextInput
            style={[
              styles.input,
              errors.username
                ? styles.inputError
                : null,
            ]}
            placeholder="Username"
            placeholderTextColor="#6A6F73"
            value={username}
            onChangeText={
              handleUsernameChange
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onFocus={() =>
              scrollToPosition(80)
            }
            onSubmitEditing={() =>
              emailRef.current?.focus()
            }
          />

          {errors.username && (
            <Text
              style={styles.errorText}
            >
              {errors.username}
            </Text>
          )}

          {/* Email */}

          <TextInput
            ref={emailRef}
            style={[
              styles.input,
              errors.email
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
            returnKeyType="next"
            blurOnSubmit={false}
            onFocus={() =>
              scrollToPosition(130)
            }
            onSubmitEditing={() => {
              passwordRef.current?.focus();

              scrollToPosition(200);
            }}
          />

          {errors.email && (
            <Text
              style={styles.errorText}
            >
              {errors.email}
            </Text>
          )}

          {/* Email suggestion */}

          {emailSuggestion && (
            <View
              style={
                styles.suggestionContainer
              }
            >
              <Text
                style={
                  styles.suggestionText
                }
              >
                Did you mean{' '}
                <Text
                  style={
                    styles.suggestionLink
                  }
                  onPress={
                    useSuggestedEmail
                  }
                >
                  {emailSuggestion}
                </Text>
                ?
              </Text>
            </View>
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
            autoComplete="new-password"
            returnKeyType="next"
            onFocus={() =>
              scrollToPosition(230)
            }
            onSubmitEditing={() => {
              confirmPasswordRef.current?.focus();

              scrollToPosition(300);
            }}
          />

          {errors.password && (
            <Text
              style={styles.errorText}
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
            ref={confirmPasswordRef}
            hasError={Boolean(
              errors.confirmPassword
            )}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={
              handleConfirmPasswordChange
            }
            autoComplete="new-password"
            returnKeyType="done"
            onFocus={() =>
              scrollToPosition(350)
            }
            onSubmitEditing={
              handleSignup
            }
          />

          {errors.confirmPassword && (
            <Text
              style={styles.errorText}
            >
              {
                errors.confirmPassword
              }
            </Text>
          )}

          {/* Submit Error */}

          {submitError !== '' && (
            <View
              style={
                styles.submitErrorContainer
              }
            >
              <Text
                style={
                  styles.submitErrorText
                }
              >
                {submitError}
              </Text>
            </View>
          )}

          {/* Create Account */}

          <Pressable
            style={[
              styles.signupButton,
              isSubmitting &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleSignup
            }
            disabled={
              isSubmitting
            }
            accessibilityRole="button"
          >
            <Text
              style={
                styles.signupButtonText
              }
            >
              {isSubmitting
                ? 'Creating Account...'
                : 'Create Account'}
            </Text>
          </Pressable>

          {/* Login */}

          <Text
            style={styles.loginText}
          >
            Already have an account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() =>
                navigation.navigate(
                  'Login'
                )
              }
            >
              Log in
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
      backgroundColor: '#FFFFFF',
    },

    container: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 200,
    },

    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginBottom: 6,
    },

    backButtonText: {
      color: '#1A1A1B',
      fontSize: 30,
    },

    logoContainer: {
      alignItems: 'center',
      marginBottom: 16,
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
      fontSize: 29,
      lineHeight: 35,
      fontWeight: '800',
      textAlign: 'center',
    },

    subtitle: {
      color: '#576F76',
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 26,
    },

    compactTitle: {
      color: '#1A1A1B',
      fontSize: 23,
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
      marginVertical: 22,
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
      marginBottom: 12,
    },

    suggestionContainer: {
      marginTop: -4,
      marginBottom: 12,
    },

    suggestionText: {
      color: '#576F76',
      fontSize: 13,
    },

    suggestionLink: {
      color: '#1A1A1B',
      fontWeight: '700',
    },

    passwordHint: {
      color: '#6A6F73',
      fontSize: 12,
      lineHeight: 17,
      marginTop: -2,
      marginBottom: 14,
    },

    submitErrorContainer: {
      backgroundColor: '#FFF3F0',
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },

    submitErrorText: {
      color: '#B32D00',
      fontSize: 13,
      textAlign: 'center',
    },

    signupButton: {
      minHeight: 54,
      borderRadius: 27,
      backgroundColor: '#FF4500',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },

    signupButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    loginText: {
      color: '#1A1A1B',
      textAlign: 'center',
      marginTop: 22,
      marginBottom: 10,
      fontSize: 14,
    },

    loginLink: {
      color: '#1A1A1B',
      fontWeight: '800',
    },
  });
