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

  const [successMessage, setSuccessMessage] =
    useState('');

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();

    setErrorMessage('');
    setSuccessMessage('');

    const validationErrors = validateLoginForm({
      email,
      password,
    });

    setErrors(validationErrors);

    if (hasLoginErrors(validationErrors)) {
      return;
    }

    const trimmedEmail = email.trim();

    setIsLoggingIn(true);

    try {
      /*
       * MOCK AUTHENTICATION CALL
       *
       * For now, loginUser() returns a mock
       * authentication response.
       *
       * Later, authService.ts will send the same
       * email and password to Wesley's backend.
       */
      const response = await loginUser({
        email: trimmedEmail,
        password,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      /*
       * Wesley confirmed that successful login
       * will return an authentication token.
       */
      if (!response.token) {
        setErrorMessage(
          'Login succeeded, but no authentication token was returned.'
        );
        return;
      }

      /*
       * Store the authentication token securely.
       *
       * Right now this stores the mock token.
       * Later it will store the real backend token.
       */
      await saveAuthToken(response.token);

      setSuccessMessage(response.message);

      /*
       * Later:
       *
       * Navigate to the authenticated Summit
       * Home/Feed screen after login succeeds.
       *
       * For now, stay on this screen because
       * the authenticated main screen is not
       * connected yet.
       */
    } catch {
      setErrorMessage(
        'Unable to log in. Please try again.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errors.email) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: undefined,
      }));
    }

    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        password: undefined,
      }));
    }

    if (errorMessage) {
      setErrorMessage('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
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
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summit Brand */}

          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brandName}>
              Summit
            </Text>
          </View>

          <Text style={styles.title}>
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Log in to continue the discussion.
          </Text>

          {/* Email */}

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={[
              styles.input,
              errors.email
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
            returnKeyType="next"
            onSubmitEditing={() =>
              passwordRef.current?.focus()
            }
          />

          {errors.email && (
            <Text style={styles.errorText}>
              {errors.email}
            </Text>
          )}

          {/* Password */}

          <Text style={styles.label}>
            Password
          </Text>

          <PasswordInput
            ref={passwordRef}
            hasError={Boolean(errors.password)}
            placeholder="Enter your password"
            value={password}
            onChangeText={handlePasswordChange}
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {errors.password && (
            <Text style={styles.errorText}>
              {errors.password}
            </Text>
          )}

          {/* Forgot Password */}

          <Pressable
            style={styles.forgotPasswordButton}
            onPress={() =>
              navigation.navigate('ForgotPassword')
            }
            accessibilityRole="button"
          >
            <Text style={styles.forgotPasswordText}>
              Forgot password?
            </Text>
          </Pressable>

          {/* Mock Login Result */}

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

          {/* Login */}

          <Pressable
            style={[
              styles.button,
              isLoggingIn
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            <Text style={styles.buttonText}>
              {isLoggingIn
                ? 'Logging In...'
                : 'Log In'}
            </Text>
          </Pressable>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text
              style={styles.signupLink}
              onPress={() =>
                navigation.navigate('Signup')
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
    marginTop: 8,
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

  errorText: {
    color: '#ff9f9f',
    fontSize: 13,
    marginBottom: 14,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingLeft: 12,
    marginBottom: 8,
  },

  forgotPasswordText: {
    color: '#e7c86e',
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },

  signupText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 10,
    fontSize: 14,
  },

  signupLink: {
    color: '#e7c86e',
    fontWeight: '600',
  },
});