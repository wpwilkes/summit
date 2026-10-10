export type RootStackParamList = {
  Login: undefined;

  Signup: undefined;

  EmailVerification: {
    email: string;
  };

  ForgotPassword: undefined;

  ResetPassword: {
    email: string;
  };
};