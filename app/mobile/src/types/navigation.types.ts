export type RootStackParamList = {
  Welcome: undefined;

  PublicFeed: undefined;

  Login: undefined;
  Signup: undefined;

  EmailVerification: {
    email: string;
  };

  ForgotPassword: undefined;

  ResetPassword: {
    email: string;
  };

  Home: undefined;

  Popular: undefined;

  News: undefined;

  DiscoverCommunities: undefined;

  TopicCommunities: {
    topic: string;
  };

  SubtopicCommunities: {
    topic: string;
    subtopic: string;
  };

  Community: {
    communityId: string;
    communityName: string;
  };

  StartCommunity: undefined;
};