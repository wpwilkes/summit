import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
  resetPasswordController,
  updateMeController,
} from './auth.controllers.js';
import { requireAuth } from './middleware/middleware.js';
import verificationRouter from './verification/verification.routes.js';
import { AUTH_CONTRACTS } from '@shared/dist/index.js';
import { Router } from 'express';

const authRouter = Router();

authRouter.post(AUTH_CONTRACTS.login.path, loginController);
authRouter.get(AUTH_CONTRACTS.me.path, requireAuth, meController);
authRouter.patch(AUTH_CONTRACTS.updateMe.path, requireAuth, updateMeController);
authRouter.post(AUTH_CONTRACTS.register.path, registerController);

authRouter.post(AUTH_CONTRACTS.forgotPassword.path, forgotPasswordController);

authRouter.post(AUTH_CONTRACTS.resetPassword.path, resetPasswordController);

authRouter.use(verificationRouter);

export default authRouter;
