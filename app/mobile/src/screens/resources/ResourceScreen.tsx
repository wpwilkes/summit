import { useCallback, useRef, type ComponentRef } from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import PostIcon from '../../components/posts/PostIcon';
import {
  CAREER_VALUES,
  COMMUNITY_RULES,
  ENFORCEMENT_ACTIONS,
  PARTICIPATION,
  RESOURCE_PAGES,
  RULES_INTRO,
  type ResourcePage,
} from '../../data/resources';
import { ink, styles } from './resourceStyles';

const mascot = require('../../assets/resources/summit-mascot.png');

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function Button({
  label,
  onPress,
  dark = false,
}: {
  label: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        dark && styles.blackButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, dark && styles.whiteText]}>{label}</Text>
      <PostIcon name="arrow" size={20} color={dark ? '#fff' : ink} />
    </Pressable>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot} accessible={false}>
        •
      </Text>
      <Text selectable style={[styles.body, styles.bulletText]}>
        {children}
      </Text>
    </View>
  );
}

export default function ResourceScreen({ page }: { page: ResourcePage }) {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360;
  const wide = width >= 840 && fontScale < 1.5;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const content = useRef<ComponentRef<typeof View>>(null);
  const targets = useRef<Record<string, ComponentRef<typeof View> | null>>({});
  const activePage = RESOURCE_PAGES.find((item) => item.id === page)!;
  const sectionStyle = [styles.section, wide && styles.sectionWide];
  const headingStyle = [styles.sectionTitle, wide && styles.sectionTitleWide];

  // Handle Android Back at this layer while the existing feed stack is retained below it.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, []),
  );

  const jumpTo = (name: string) => {
    const node = targets.current[name];
    if (node && content.current) {
      node.measureLayout(
        content.current,
        (_x, y) =>
          scroll.current?.scrollTo({ y: Math.max(0, y - 16), animated: true }),
        () => {},
      );
    }
  };

  const isHeroPage = page === 'about' || page === 'careers';

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar style="dark" />
      <View style={styles.toolbar}>
        <View style={styles.toolbarInner}>
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Summit"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <PostIcon name="back" size={22} />
          </Pressable>
          <View style={styles.brand} accessibilityLabel="Summit">
            <Svg width={31} height={29} viewBox="0 0 32 30" accessible={false}>
              <Path d="M1 26 12 7l5 9 5-13 9 23H1Z" fill="#ff4500" />
              <Path
                d="m12 7-4 7 4-2 3 1-3-6ZM22 3l-4 10 4-3 3 1-3-8Z"
                fill="#ffbe9e"
              />
            </Svg>
            <Text style={styles.brandText}>summit</Text>
          </View>
          {width >= 380 && <Text style={styles.toolbarLabel}>RESOURCES</Text>}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={[styles.tabRow, compact && styles.tabRowCompact]}
      >
        {RESOURCE_PAGES.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.id === page }}
            aria-selected={item.id === page}
            onPress={() => {
              if (item.id !== page) router.replace(item.href);
            }}
            style={[
              styles.tab,
              compact && styles.tabCompact,
              page === item.id && styles.activeTab,
            ]}
          >
            <Text
              style={[styles.tabText, page === item.id && styles.activeTabText]}
            >
              {item.shortLabel}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentInsetAdjustmentBehavior="never"
      >
        <View ref={content} collapsable={false} style={styles.main}>
          {isHeroPage ? (
            <View style={styles.hero}>
              <View style={[styles.heroInner, wide && styles.heroInnerWide]}>
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>
                    {page === 'about'
                      ? 'A place for your people'
                      : 'Careers at Summit'}
                  </Text>
                  <Text
                    accessibilityRole="header"
                    style={[
                      styles.heroTitle,
                      compact && styles.heroTitleCompact,
                      wide && styles.heroTitleWide,
                    ]}
                  >
                    {page === 'about'
                      ? 'The heart of\nthe internet.'
                      : 'Join the\nconversation.'}
                  </Text>
                  <Text style={[styles.heroBody, wide && styles.heroBodyWide]}>
                    {page === 'about'
                      ? 'Summit is a place for communities, endless conversation, and authentic human connection. Whether you’re into breaking news, sports, technology, or something entirely your own, there’s a conversation for you.'
                      : 'Help build a place that encourages people to think more, do more, learn more, feel more—and maybe even laugh more. Bring your curiosity. Find your people. Build something together.'}
                  </Text>
                  <Button
                    label={
                      page === 'about'
                        ? 'How Summit works'
                        : 'View job openings'
                    }
                    onPress={() =>
                      jumpTo(page === 'about' ? 'how-it-works' : 'openings')
                    }
                  />
                </View>
                <Image
                  source={mascot}
                  accessibilityLabel="A friendly Summit explorer waving hello"
                  resizeMode="contain"
                  style={[styles.heroImage, wide && styles.heroImageWide]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.policyHero}>
              <View
                style={[
                  styles.policyHeroInner,
                  wide && styles.policyHeroInnerWide,
                ]}
              >
                <View style={styles.policyHeroCopy}>
                  <Text style={styles.eyebrow}>
                    {page === 'rules' ? 'Made for community' : 'Using Summit'}
                  </Text>
                  <Text
                    accessibilityRole="header"
                    style={[styles.policyTitle, wide && styles.policyTitleWide]}
                  >
                    {activePage.label}
                  </Text>
                  <Text style={styles.policySubtitle}>
                    {page === 'rules'
                      ? 'Good communities start with a shared understanding. Here’s ours.'
                      : 'A shared understanding for a better place to connect.'}
                  </Text>
                </View>
                {!compact && (
                  <View style={[styles.badge, wide && styles.badgeWide]}>
                    <PostIcon
                      name={page === 'rules' ? 'shield' : 'document'}
                      size={wide ? 56 : 30}
                      color="#a93200"
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {page === 'about' && (
            <>
              <View
                ref={(node) => {
                  targets.current['how-it-works'] = node;
                }}
                collapsable={false}
                style={sectionStyle}
              >
                <Text style={styles.eyebrow}>How it works</Text>
                <Text accessibilityRole="header" style={headingStyle}>
                  A little curiosity.{'\n'}A lot of connection.
                </Text>
                <Text style={styles.sectionLead}>
                  The people make the platform. Every post, comment, and vote
                  helps shape what happens next.
                </Text>
                <View style={[styles.cards, wide && styles.cardsWide]}>
                  {PARTICIPATION.map((item) => (
                    <View key={item.number} style={styles.card}>
                      <View style={styles.cardTop}>
                        <PostIcon name={item.icon} size={30} />
                        <Text style={styles.cardNumber}>{item.number}</Text>
                      </View>
                      <Text accessibilityRole="header" style={styles.cardTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.body}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.callout}>
                <View style={[...sectionStyle, styles.calloutInner]}>
                  <Text style={styles.eyebrow}>
                    Different interests. Shared belonging.
                  </Text>
                  <Text accessibilityRole="header" style={headingStyle}>
                    There’s a place for you here.
                  </Text>
                  <Text style={styles.sectionLead}>
                    From everyday questions to your next big idea, communities
                    bring people together around what matters to them.
                  </Text>
                  <View style={styles.topicRow}>
                    {[
                      'Technology',
                      'Sports',
                      'Education',
                      'Entertainment',
                      'Health',
                      'Politics',
                    ].map((topic) => (
                      <View key={topic} style={styles.topic}>
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                  <Button
                    label="Read our community rules"
                    dark
                    onPress={() => router.replace('/resources/rules')}
                  />
                </View>
              </View>
            </>
          )}

          {page === 'rules' && (
            <View style={[styles.policyBody, wide && styles.policyBodyWide]}>
              <View style={styles.paragraphGroup}>
                {RULES_INTRO.map((paragraph) => (
                  <Text selectable key={paragraph} style={styles.body}>
                    {paragraph}
                  </Text>
                ))}
              </View>
              <View style={styles.toc}>
                <Text accessibilityRole="header" style={styles.tocTitle}>
                  On this page
                </Text>
                <View style={styles.tocItems}>
                  {COMMUNITY_RULES.map((rule, index) => (
                    <Pressable
                      key={rule.title}
                      accessibilityRole="button"
                      accessibilityLabel={`Jump to Rule ${index + 1}: ${rule.title}`}
                      onPress={() => jumpTo(`rule-${index + 1}`)}
                      style={styles.tocLink}
                    >
                      <Text style={styles.tocLinkText}>Rule {index + 1}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => jumpTo('enforcement')}
                    style={styles.tocLink}
                  >
                    <Text style={styles.tocLinkText}>Enforcement</Text>
                  </Pressable>
                </View>
              </View>
              <View>
                {COMMUNITY_RULES.map((rule, index) => (
                  <View
                    key={rule.title}
                    ref={(node) => {
                      targets.current[`rule-${index + 1}`] = node;
                    }}
                    collapsable={false}
                    style={styles.rule}
                  >
                    <View style={styles.ruleNumber} accessible={false}>
                      <Text style={styles.ruleNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.ruleContent}>
                      <Text
                        accessibilityRole="header"
                        accessibilityLabel={`Rule ${index + 1}: ${rule.title}`}
                        style={styles.ruleHeading}
                      >
                        {rule.title}
                      </Text>
                      <Text selectable style={styles.body}>
                        {rule.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View
                ref={(node) => {
                  targets.current['enforcement'] = node;
                }}
                collapsable={false}
                style={styles.enforcement}
              >
                <Text accessibilityRole="header" style={styles.ruleHeading}>
                  Enforcement
                </Text>
                <Text selectable style={styles.body}>
                  Depending on the situation, responses to rule violations may
                  include:
                </Text>
                {ENFORCEMENT_ACTIONS.map((action) => (
                  <Bullet key={action}>{action}</Bullet>
                ))}
                <Text style={styles.sampleNote}>
                  These guidelines describe expected behavior. Moderation
                  features depend on what is available in the Summit project.
                </Text>
              </View>
              <Link
                href="/resources/user-agreement"
                replace
                style={styles.inlineLink}
              >
                Read the User Agreement →
              </Link>
            </View>
          )}

          {page === 'user-agreement' && (
            <View style={[styles.policyBody, wide && styles.policyBodyWide]}>
              <Text style={styles.sampleNote}>
                PROJECT EDITION · Sample terms for the Summit class project
              </Text>
              <View style={styles.paragraphGroup}>
                <Text selectable style={styles.body}>
                  Hello, Summit community! This User Agreement (“Terms”)
                  describes your access to and use of the Summit application and
                  its community features (“Services”).
                </Text>
                <Text selectable style={styles.body}>
                  Summit is a place to connect, learn, and have fun. We also
                  need some shared rules. By using the Services, you agree to
                  follow these Terms and the Summit Rules. If you do not agree,
                  please do not use the Services.
                </Text>
              </View>
              <View style={styles.toc}>
                <Text accessibilityRole="header" style={styles.tocTitle}>
                  On this page
                </Text>
                <View style={styles.tocItems}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => jumpTo('access')}
                    style={styles.tocLink}
                  >
                    <Text style={styles.tocLinkText}>1. Your access</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => jumpTo('privacy')}
                    style={styles.tocLink}
                  >
                    <Text style={styles.tocLinkText}>2. Privacy</Text>
                  </Pressable>
                </View>
              </View>
              <View
                ref={(node) => {
                  targets.current['access'] = node;
                }}
                collapsable={false}
                style={styles.agreementSection}
              >
                <Text accessibilityRole="header" style={styles.ruleHeading}>
                  1. Your Access to the Services
                </Text>
                <Text selectable style={styles.body}>
                  Under these sample terms, no one under 13 may access or use
                  Summit. You must also meet any higher minimum age required
                  where you live. Some content or features may require you to be
                  older.
                </Text>
                <Text selectable style={styles.body}>
                  By using the Services, you state that:
                </Text>
                <Bullet>
                  You are at least 13 and meet the minimum age required in your
                  country of residence.
                </Bullet>
                <Bullet>
                  You can agree to these Terms, or, if you are under the age of
                  majority where you live, your parent or legal guardian has
                  reviewed and agreed to them.
                </Bullet>
                <Bullet>
                  You are not barred from using the Services under applicable
                  laws.
                </Bullet>
                <Bullet>
                  You have not been permanently suspended or removed from the
                  Services.
                </Bullet>
                <Text selectable style={styles.body}>
                  If you use the Services on behalf of an organization, you must
                  have authority to act on its behalf. Keep your account
                  credentials safe and take responsibility for your activity.
                </Text>
              </View>
              <View
                ref={(node) => {
                  targets.current['privacy'] = node;
                }}
                collapsable={false}
                style={styles.agreementSection}
              >
                <Text accessibilityRole="header" style={styles.ruleHeading}>
                  2. Privacy
                </Text>
                <Text selectable style={styles.body}>
                  Respect your own privacy and the privacy of others. Avoid
                  sharing confidential information in public posts or comments.
                  Never publish someone else’s private information or intimate
                  images without their consent.
                </Text>
                <Text selectable style={styles.body}>
                  Summit uses account information to support registration and
                  sign-in, and stores the content you submit through its
                  community features. An anonymous display name does not mean
                  that your account or activity cannot be associated with you.
                </Text>
                <Text selectable style={styles.body}>
                  A complete Summit Privacy Policy has not been published with
                  this project. These sample terms do not replace one or
                  describe a production service’s full data practices.
                </Text>
                <Link href="/resources/rules" replace style={styles.inlineLink}>
                  Read Summit’s privacy and community rules →
                </Link>
              </View>
            </View>
          )}

          {page === 'careers' && (
            <>
              <View style={sectionStyle}>
                <Text style={styles.eyebrow}>What brings us together</Text>
                <Text accessibilityRole="header" style={headingStyle}>
                  Good people.{'\n'}Thoughtful work.
                </Text>
                <Text style={styles.sectionLead}>
                  A better community starts with how we work together. These are
                  the ideas behind Summit.
                </Text>
                <View style={[styles.cards, wide && styles.cardsWide]}>
                  {CAREER_VALUES.map((value) => (
                    <View key={value.title} style={styles.card}>
                      <PostIcon name={value.icon} size={30} />
                      <Text accessibilityRole="header" style={styles.cardTitle}>
                        {value.title}
                      </Text>
                      <Text style={styles.body}>{value.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.callout}>
                <View style={sectionStyle}>
                  <Text style={styles.eyebrow}>Room to make a difference</Text>
                  <Text accessibilityRole="header" style={headingStyle}>
                    Many skills. One community.
                  </Text>
                  <Text style={styles.sectionLead}>
                    Engineering brings ideas to life. Design makes them easy to
                    use. Community work helps people feel welcome. Each
                    perspective makes the experience better.
                  </Text>
                  <View style={styles.topicRow}>
                    {['Engineering', 'Product & design', 'Community'].map(
                      (team) => (
                        <View key={team} style={styles.topic}>
                          <Text style={styles.topicText}>{team}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              </View>
              <View
                ref={(node) => {
                  targets.current['openings'] = node;
                }}
                collapsable={false}
                style={sectionStyle}
              >
                <Text style={styles.eyebrow}>Find your next chapter</Text>
                <Text accessibilityRole="header" style={headingStyle}>
                  Job openings
                </Text>
                <View style={styles.emptyJobs}>
                  <View style={styles.jobStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.jobStatusText}>
                      SUMMIT OPPORTUNITIES
                    </Text>
                  </View>
                  <Text accessibilityRole="header" style={styles.cardTitle}>
                    No open positions right now
                  </Text>
                  <Text style={styles.body}>
                    Summit is currently a student-built project. There are no
                    advertised jobs or applications to submit. Future
                    opportunities can be listed here as the project grows.
                  </Text>
                  <Button
                    label="Get to know Summit"
                    dark
                    onPress={() => router.replace('/resources/about')}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <View
              style={[styles.footerInner, wide && { paddingHorizontal: 60 }]}
            >
              <View style={styles.footerTop}>
                <Text style={styles.footerBrand}>summit</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    scroll.current?.scrollTo({ y: 0, animated: true })
                  }
                  style={styles.backToTop}
                >
                  <Text style={styles.backToTopText}>Back to top</Text>
                  <PostIcon name="send" color="#fff" size={17} />
                </Pressable>
              </View>
              <View style={styles.footerLinks}>
                {RESOURCE_PAGES.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => {
                      if (item.id !== page) router.replace(item.href);
                      else scroll.current?.scrollTo({ y: 0, animated: true });
                    }}
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerLinkText}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.footerBottom}>
                <Text style={styles.footerNote}>
                  A place to share, connect, and belong.
                </Text>
                <Text style={styles.footerNote}>
                  Summit · A student community project. Inspired by Reddit; not
                  affiliated with Reddit.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
