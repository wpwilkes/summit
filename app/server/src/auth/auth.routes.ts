import {
  loginController,
  meController,
  registerController,
} from './auth.controllers.js';
import { requireAuth } from './auth.middleware.js';
import { AUTH_CONTRACTS } from '@shared/dist/index.js';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post(AUTH_CONTRACTS.login.path, loginController);
authRouter.get(AUTH_CONTRACTS.me.path, requireAuth, meController);
authRouter.post(AUTH_CONTRACTS.register.path, registerController);

export default authRouter;
