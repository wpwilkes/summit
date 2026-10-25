import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  colors,
} from '../components/posts/postsTheme';

import type {
  RootStackParamList,
} from '../types/navigation.types';

import {
  getAuthToken,
  removeAuthToken,
} from '../utils/tokenStorage';

import SummitPostsScreen from './SummitPostsScreen';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Home'
  >;

/** Keep Khan's existing Home route and replace only its temporary content. */
export default function HomeScreen({
  navigation,
}: Props) {
  const [
    ready,
    setReady,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState('');

  const logoutPending =
    useRef(false);

  const mounted =
    useRef(false);

  useEffect(() => {
    let active = true;

    mounted.current =
      true;

    getAuthToken()
      .then(
        (token) => {
          if (!active) {
            return;
          }

          if (token) {
            setReady(
              true,
            );
          } else {
            navigation.reset({
              index: 0,

              routes: [
                {
                  name:
                    'Welcome',
                },
              ],
            });
          }
        },
      )
      .catch(() => {
        if (active) {
          navigation.reset({
            index: 0,

            routes: [
              {
                name:
                  'Welcome',
              },
            ],
          });
        }
      });

    return () => {
      active = false;

      mounted.current =
        false;
    };
  }, [navigation]);

  const handleLogout =
    async () => {
      if (
        logoutPending.current
      ) {
        return;
      }

      logoutPending.current =
        true;

      setLoggingOut(
        true,
      );

      setLogoutError(
        '',
      );

      try {
        await removeAuthToken();

        if (
          !mounted.current
        ) {
          return;
        }

        setReady(false);

        navigation.reset({
          index: 0,

          routes: [
            {
              name: 'Login',
            },
          ],
        });
      } catch {
        if (
          mounted.current
        ) {
          setLogoutError(
            'Unable to log out. Please try again.',
          );
        }
      } finally {
        logoutPending.current =
          false;

        if (
          mounted.current
        ) {
          setLoggingOut(
            false,
          );
        }
      }
    };

  if (!ready) {
    return (
      <View
        style={
          styles.loading
        }
      >
        <ActivityIndicator
          color={
            colors.accent
          }
          size="large"
        />
      </View>
    );
  }

  return (
    <SummitPostsScreen
      onLogout={
        handleLogout
      }
      loggingOut={
        loggingOut
      }
      logoutError={
        logoutError
      }
      onPopularPress={() =>
        navigation.navigate(
          'Popular',
        )
      }
      onNewsPress={() =>
        navigation.navigate(
          'News',
        )
      }
      onDiscoverCommunitiesPress={() =>
        navigation.navigate(
          'DiscoverCommunities',
        )
      }
      onStartCommunityPress={() =>
        navigation.navigate(
          'StartCommunity',
        )
      }
      onRecentCommunityPress={(
        community,
      ) =>
        navigation.navigate(
          'Community',
          {
            communityId:
              community.id,

            communityName:
              community.name,
          },
        )
      }
    />
  );
}

const styles =
  StyleSheet.create({
    loading: {
      flex: 1,

      backgroundColor:
        colors.background,

      alignItems:
        'center',

      justifyContent:
        'center',
    },
  });