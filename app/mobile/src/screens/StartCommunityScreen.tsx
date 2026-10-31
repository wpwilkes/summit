import {
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
  createCommunity,
} from '../services/communityService';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'StartCommunity'
  >;

/*
 * For now, Summit uses predefined topics
 * and subtopics.
 *
 * Later, TopicCommunitiesScreen and
 * SubtopicCommunitiesScreen will use the
 * same category structure with real
 * backend community data.
 */
const TOPIC_SUBTOPICS: Record<
  string,
  string[]
> = {
  'Internet Culture': [
    'Memes',
    'Social Media',
    'Online Communities',
    'Creators',
  ],

  Games: [
    'PC Gaming',
    'Console Gaming',
    'Mobile Gaming',
    'Esports',
  ],

  'Q&As': [
    'General Q&A',
    'Advice',
    'Ask Me Anything',
    'Learning',
  ],

  Technology: [
    'Programming',
    'AI',
    'Hardware',
    'Mobile',
  ],

  'Pop Culture': [
    'Celebrities',
    'Music',
    'Trends',
    'Entertainment',
  ],

  'Movies & TV': [
    'Movies',
    'Television',
    'Streaming',
    'Reviews',
  ],

  Education: [
    'College',
    'Study Help',
    'Careers',
    'Online Learning',
  ],

  Science: [
    'Space',
    'Biology',
    'Physics',
    'Environment',
  ],
};

const TOPICS =
  Object.keys(
    TOPIC_SUBTOPICS,
  );

export default function StartCommunityScreen({
  navigation,
}: Props) {
  const [
    name,
    setName,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    topic,
    setTopic,
  ] = useState('');

  const [
    subtopic,
    setSubtopic,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const availableSubtopics =
    topic
      ? TOPIC_SUBTOPICS[
          topic
        ] ?? []
      : [];

  const handleTopicPress = (
    selectedTopic: string,
  ) => {
    setTopic(
      selectedTopic,
    );

    /*
     * Reset subtopic whenever
     * the topic changes.
     */
    setSubtopic('');
    setErrorMessage('');
  };

  const handleCreateCommunity =
    async () => {
      const trimmedName =
        name.trim();

      const trimmedDescription =
        description.trim();

      if (!trimmedName) {
        setErrorMessage(
          'Please enter a community name.',
        );
        return;
      }

      if (!trimmedDescription) {
        setErrorMessage(
          'Please enter a community description.',
        );
        return;
      }

      if (!topic) {
        setErrorMessage(
          'Please select a topic.',
        );
        return;
      }

      if (!subtopic) {
        setErrorMessage(
          'Please select a subtopic.',
        );
        return;
      }

      if (submitting) {
        return;
      }

      setSubmitting(true);
      setErrorMessage('');

      const result =
        await createCommunity({
          name:
            trimmedName,

          description:
            trimmedDescription,

          topic,

          subtopic,
        });

      if (!result.success) {
        setErrorMessage(
          result.message,
        );

        setSubmitting(false);
        return;
      }

      setSubmitting(false);

      navigation.replace(
        'Community',
        {
          communityId:
            String(
              result.community.id,
            ),

          communityName:
            result.community.name,
        },
      );
    };

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
            disabled={
              submitting
            }
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
            Start a Community
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
            Create your community
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Choose a name,
            description, topic,
            and subtopic for your
            community.
          </Text>

          {/* Community name */}

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
              Community name
            </Text>

            <TextInput
              value={name}
              editable={
                !submitting
              }
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="example: programming"
              placeholderTextColor={
                colors.muted
              }
              onChangeText={
                setName
              }
              style={
                styles.input
              }
            />

            <Text
              style={
                styles.helperText
              }
            >
              This will appear as
              {' '}
              s/
              {name.trim() ||
                'community-name'}.
            </Text>
          </View>

          {/* Description */}

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
              Description
            </Text>

            <TextInput
              value={
                description
              }
              editable={
                !submitting
              }
              multiline
              textAlignVertical="top"
              placeholder="What is this community about?"
              placeholderTextColor={
                colors.muted
              }
              onChangeText={
                setDescription
              }
              style={[
                styles.input,
                styles.descriptionInput,
              ]}
            />
          </View>

          {/* Topic */}

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
              Topic
            </Text>

            <Text
              style={
                styles.helperAbove
              }
            >
              Choose the main
              category for this
              community.
            </Text>

            <View
              style={
                styles.selectionContainer
              }
            >
              {TOPICS.map(
                (
                  topicOption,
                ) => {
                  const selected =
                    topic ===
                    topicOption;

                  return (
                    <Pressable
                      key={
                        topicOption
                      }
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}
                      disabled={
                        submitting
                      }
                      onPress={() =>
                        handleTopicPress(
                          topicOption,
                        )
                      }
                      style={[
                        styles.optionChip,

                        selected &&
                          styles.selectedChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,

                          selected &&
                            styles.selectedText,
                        ]}
                      >
                        {
                          topicOption
                        }
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>

          {/* Subtopic */}

          {topic ? (
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
                Subtopic
              </Text>

              <Text
                style={
                  styles.helperAbove
                }
              >
                Choose where this
                community belongs
                inside {topic}.
              </Text>

              <View
                style={
                  styles.selectionContainer
                }
              >
                {availableSubtopics.map(
                  (
                    subtopicOption,
                  ) => {
                    const selected =
                      subtopic ===
                      subtopicOption;

                    return (
                      <Pressable
                        key={
                          subtopicOption
                        }
                        accessibilityRole="button"
                        accessibilityState={{
                          selected,
                        }}
                        disabled={
                          submitting
                        }
                        onPress={() => {
                          setSubtopic(
                            subtopicOption,
                          );

                          setErrorMessage(
                            '',
                          );
                        }}
                        style={[
                          styles.optionChip,

                          selected &&
                            styles.selectedChip,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,

                            selected &&
                              styles.selectedText,
                          ]}
                        >
                          {
                            subtopicOption
                          }
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>
            </View>
          ) : null}

          {/* Selected category */}

          {topic &&
          subtopic ? (
            <View
              style={
                styles.categorySummary
              }
            >
              <Text
                style={
                  styles.categorySummaryLabel
                }
              >
                Community category
              </Text>

              <Text
                style={
                  styles.categorySummaryText
                }
              >
                {topic}
                {'  →  '}
                {subtopic}
              </Text>
            </View>
          ) : null}

          {/* Error */}

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
                {
                  errorMessage
                }
              </Text>
            </View>
          ) : null}

          {/* Create */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create community"
            accessibilityState={{
              disabled:
                submitting,

              busy:
                submitting,
            }}
            disabled={
              submitting
            }
            onPress={
              handleCreateCommunity
            }
            style={({
              pressed,
            }) => [
              styles.createButton,

              pressed &&
                !submitting &&
                styles.pressed,

              submitting &&
                styles.disabledButton,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.createButtonText
                }
              >
                Create Community
              </Text>
            )}
          </Pressable>
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

    descriptionInput: {
      minHeight: 130,
      paddingTop: 14,
      paddingBottom: 14,
    },

    helperText: {
      marginTop: 7,
      color:
        colors.muted,
      fontSize: 12,
    },

    helperAbove: {
      marginBottom: 10,
      color:
        colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },

    selectionContainer: {
      flexDirection:
        'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    optionChip: {
      minHeight: 38,
      justifyContent:
        'center',
      paddingHorizontal:
        14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 20,
      backgroundColor:
        '#fff',
    },

    selectedChip: {
      borderColor:
        '#ff4500',
      backgroundColor:
        '#ff4500',
    },

    optionText: {
      color:
        colors.text,
      fontSize: 14,
      fontWeight:
        '500',
    },

    selectedText: {
      color: '#fff',
      fontWeight:
        '700',
    },

    categorySummary: {
      marginTop: 24,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      backgroundColor:
        '#f7f7f7',
    },

    categorySummaryLabel: {
      color:
        colors.muted,
      fontSize: 12,
      fontWeight:
        '600',
    },

    categorySummaryText: {
      marginTop: 5,
      color:
        colors.text,
      fontSize: 15,
      fontWeight:
        '700',
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

    createButton: {
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

    createButtonText: {
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