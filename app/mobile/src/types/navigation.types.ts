export type RootStackParamList = {
  Welcome: undefined;

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
};