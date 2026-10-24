import {
  forwardRef,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

type Props = TextInputProps & {
  hasError?: boolean;
};

const PasswordInput = forwardRef<
  TextInput,
  Props
>(
  (
    {
      hasError = false,
      style,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] =
      useState(false);

    return (
      <View
        style={[
          styles.container,
          hasError && styles.inputError,
        ]}
      >
        <TextInput
          ref={ref}
          {...props}
          style={[styles.input, style]}
          placeholderTextColor="#6A6F73"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={styles.eyeButton}
          onPress={() =>
            setShowPassword(
              (current) => !current
            )
          }
          accessibilityRole="button"
        >
          <Ionicons
            name={
              showPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={21}
            color="#555555"
          />
        </Pressable>
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingRight: 4,
    color: '#1A1A1B',
    fontSize: 16,
  },

  eyeButton: {
    width: 52,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputError: {
    borderWidth: 1,
    borderColor: '#D93900',
  },
});