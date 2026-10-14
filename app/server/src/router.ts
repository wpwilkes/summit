import pingRouter from './ping/ping.routes.js';
import { Router } from 'express';

const router: Router = Router();

router.use(pingRouter);

export default router;
