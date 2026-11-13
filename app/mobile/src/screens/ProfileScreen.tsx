import {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
} from '@react-navigation/native';

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
  type SummitProfile,
} from '../services/summitProfileService';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Profile'
  >;

function formatMemberSince(
  createdAt: string,
): string {
  const date = new Date(createdAt);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Unknown';
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );
}

export default function ProfileScreen({
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const controller =
        new AbortController();

      setLoading(true);
      setErrorMessage('');

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
    }, [reloadKey]),
  );

  return (
    <SafeAreaView
      style={ui.page}
    >
      <StatusBar style="dark" />

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
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
          Profile
        </Text>
      </View>

      {loading &&
      !profile ? (
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
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
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

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setReloadKey(
                    (value) =>
                      value + 1,
                  )
                }
                style={
                  styles.retryButton
                }
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            </View>
          ) : null}

          {profile ? (
            <>
              <View
                style={
                  styles.profileHeader
                }
              >
                <View
                  style={
                    styles.avatar
                  }
                >
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {profile.username
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <Text
                  style={
                    styles.username
                  }
                >
                  {profile.username}
                </Text>

                <Text
                  style={
                    styles.emailSummary
                  }
                >
                  {profile.email}
                </Text>
              </View>

              <View
                style={
                  styles.card
                }
              >
                <View
                  style={
                    styles.infoRow
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Username
                  </Text>

                  <Text
                    style={
                      styles.value
                    }
                  >
                    {profile.username}
                  </Text>
                </View>

                <View
                  style={
                    styles.separator
                  }
                />

                <View
                  style={
                    styles.infoRow
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Email
                  </Text>

                  <Text
                    style={
                      styles.value
                    }
                  >
                    {profile.email}
                  </Text>
                </View>

                <View
                  style={
                    styles.separator
                  }
                />

                <View
                  style={
                    styles.infoRow
                  }
                >
                  <Text
                    style={
                      styles.label
                    }
                  >
                    Member since
                  </Text>

                  <Text
                    style={
                      styles.value
                    }
                  >
                    {formatMemberSince(
                      profile.createdAt,
                    )}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                onPress={() =>
                  navigation.navigate(
                    'EditProfile',
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.editButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <PostIcon
                  name="edit"
                  color="#fff"
                  size={20}
                />

                <Text
                  style={
                    styles.editButtonText
                  }
                >
                  Edit Profile
                </Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
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

    profileHeader: {
      alignItems:
        'center',
      paddingVertical: 20,
    },

    avatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        '#e8eaed',
    },

    avatarText: {
      color:
        colors.text,
      fontSize: 34,
      fontWeight:
        '700',
    },

    username: {
      marginTop: 14,
      color:
        colors.text,
      fontSize: 24,
      fontWeight:
        '700',
    },

    emailSummary: {
      marginTop: 5,
      color:
        colors.muted,
      fontSize: 14,
    },

    card: {
      marginTop: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      backgroundColor:
        '#fff',
      overflow:
        'hidden',
    },

    infoRow: {
      paddingHorizontal:
        16,
      paddingVertical:
        15,
    },

    label: {
      color:
        colors.muted,
      fontSize: 13,
      fontWeight:
        '600',
    },

    value: {
      marginTop: 5,
      color:
        colors.text,
      fontSize: 16,
    },

    separator: {
      height: 1,
      backgroundColor:
        colors.border,
    },

    editButton: {
      minHeight: 50,
      marginTop: 24,
      borderRadius: 25,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 9,
      backgroundColor:
        '#ff4500',
    },

    editButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight:
        '700',
    },

    pressed: {
      opacity: 0.8,
    },

    errorBox: {
      marginBottom: 20,
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

    retryButton: {
      alignSelf:
        'flex-start',
      marginTop: 10,
      paddingVertical: 7,
      paddingHorizontal:
        12,
      borderRadius: 18,
      backgroundColor:
        '#ff4500',
    },

    retryButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight:
        '700',
    },
  });