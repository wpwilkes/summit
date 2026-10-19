import authRouter from './auth/auth.routes.js';
import pingRouter from './ping/ping.routes.js';
import summaryRouter from './summary/summary.routes.js';
import { Router } from 'express';

const router: Router = Router();

router.use(authRouter);
router.use(pingRouter);
router.use(summaryRouter);

export default router;
