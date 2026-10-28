import {
  verifyEmailController,
  resendVerificationController,
} from './verification.controllers.js';
import { AUTH_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const verificationRouter: Router = Router();

verificationRouter.post(
  AUTH_CONTRACTS.resendVerification.path,
  resendVerificationController,
);
verificationRouter.post(AUTH_CONTRACTS.verifyEmail.path, verifyEmailController);

export default verificationRouter;
