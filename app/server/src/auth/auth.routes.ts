import {
  loginController,
  meController,
  registerController,
} from './auth.controllers.js';
import { requireAuth } from './middleware/middleware.js';
import verificationRouter from './verification/verification.routes.js';
import { AUTH_CONTRACTS } from '@shared/dist/index.js';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post(AUTH_CONTRACTS.login.path, loginController);
authRouter.get(AUTH_CONTRACTS.me.path, requireAuth, meController);
authRouter.post(AUTH_CONTRACTS.register.path, registerController);

authRouter.use(verificationRouter);

export default authRouter;
