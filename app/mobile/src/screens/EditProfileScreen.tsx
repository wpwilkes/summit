import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
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

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import {
  getSummitProfile,
  updateSummitProfile,
  type SummitProfile,
} from '../services/summitProfileService';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'EditProfile'
  >;

export default function EditProfileScreen({
  navigation,
}: Props) {
  const [
    profile,
    setProfile,
  ] =
    useState<SummitProfile | null>(
      null,
    );

  const [
    username,
    setUsername,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    const controller =
      new AbortController();

    getSummitProfile(
      controller.signal,
    )
      .then(
        (loadedProfile) => {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          setProfile(
            loadedProfile,
          );

          setUsername(
            loadedProfile.username,
          );
        },
      )
      .catch(
        (error: unknown) => {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Could not load your profile. Please try again.',
          );
        },
      )
      .finally(() => {
        if (
          !controller.signal.aborted
        ) {
          setLoading(
            false,
          );
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const handleSave =
    async () => {
      const trimmedUsername =
        username.trim();

      if (
        trimmedUsername.length <
          3 ||
        trimmedUsername.length >
          30
      ) {
        setErrorMessage(
          'Username must be between 3 and 30 characters.',
        );

        return;
      }

      if (saving) {
        return;
      }

      if (
        profile &&
        trimmedUsername ===
          profile.username
      ) {
        navigation.goBack();

        return;
      }

      setSaving(true);
      setErrorMessage('');

      try {
        await updateSummitProfile(
          trimmedUsername,
        );

        navigation.goBack();
      } catch (
        error: unknown
      ) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not update your profile. Please try again.',
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <SafeAreaView
        style={ui.page}
      >
        <StatusBar style="dark" />

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              colors.accent
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={ui.page}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            disabled={saving}
            onPress={() =>
              navigation.goBack()
            }
            style={
              ui.iconButton
            }
          >
            <PostIcon
              name="back"
            />
          </Pressable>

          <Text
            style={
              styles.headerTitle
            }
          >
            Edit Profile
          </Text>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Account information
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Update the information
            associated with your
            Summit profile.
          </Text>

          {errorMessage ? (
            <View
              style={
                styles.errorBox
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
          ) : null}

          {profile ? (
            <>
              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  Username
                </Text>

                <TextInput
                  value={username}
                  editable={
                    !saving
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={30}
                  placeholder="Username"
                  placeholderTextColor={
                    colors.muted
                  }
                  onChangeText={(
                    value,
                  ) => {
                    setUsername(
                      value,
                    );

                    setErrorMessage(
                      '',
                    );
                  }}
                  style={
                    styles.input
                  }
                />

                <Text
                  style={
                    styles.helperText
                  }
                >
                  Username must be
                  between 3 and 30
                  characters.
                </Text>
              </View>

              <View
                style={
                  styles.fieldGroup
                }
              >
                <Text
                  style={
                    styles.label
                  }
                >
                  Email
                </Text>

                <TextInput
                  value={
                    profile.email
                  }
                  editable={false}
                  style={[
                    styles.input,
                    styles.readOnlyInput,
                  ]}
                />

                <Text
                  style={
                    styles.helperText
                  }
                >
                  Email cannot be
                  changed from the
                  profile screen.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save profile changes"
                accessibilityState={{
                  disabled: saving,
                  busy: saving,
                }}
                disabled={saving}
                onPress={
                  handleSave
                }
                style={({
                  pressed,
                }) => [
                  styles.saveButton,

                  pressed &&
                    !saving &&
                    styles.pressed,

                  saving &&
                    styles.disabledButton,
                ]}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Changes
                  </Text>
                )}
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    keyboardView: {
      flex: 1,
    },

    header: {
      minHeight: 58,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
      paddingHorizontal:
        12,
      borderBottomWidth:
        1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    headerTitle: {
      color:
        colors.text,
      fontSize: 20,
      fontWeight:
        '700',
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 12,
    },

    loadingText: {
      color:
        colors.muted,
      fontSize: 14,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    title: {
      color:
        colors.text,
      fontSize: 26,
      fontWeight:
        '700',
    },

    subtitle: {
      marginTop: 8,
      color:
        colors.muted,
      fontSize: 15,
      lineHeight: 21,
    },

    fieldGroup: {
      marginTop: 24,
    },

    label: {
      color:
        colors.text,
      fontSize: 15,
      fontWeight:
        '600',
      marginBottom: 8,
    },

    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      paddingHorizontal:
        14,
      color:
        colors.text,
      backgroundColor:
        '#fff',
      fontSize: 16,
    },

    readOnlyInput: {
      backgroundColor:
        '#f3f3f3',
      color:
        colors.muted,
    },

    helperText: {
      marginTop: 7,
      color:
        colors.muted,
      fontSize: 12,
      lineHeight: 17,
    },

    errorBox: {
      marginTop: 20,
      borderRadius: 10,
      paddingHorizontal:
        14,
      paddingVertical:
        12,
      backgroundColor:
        '#fff2f0',
    },

    errorText: {
      color:
        '#c62828',
      fontSize: 14,
      lineHeight: 19,
    },

    saveButton: {
      minHeight: 50,
      marginTop: 28,
      borderRadius: 25,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        '#ff4500',
    },

    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight:
        '700',
    },

    disabledButton: {
      opacity: 0.6,
    },

    pressed: {
      opacity: 0.8,
    },
  });