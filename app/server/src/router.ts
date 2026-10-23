import authRouter from './auth/auth.routes.js';
import commentsRouter from './comments/comments.routes.js';
import pingRouter from './ping/ping.routes.js';
import postsRouter from './posts/posts.routes.js';
import { Router } from 'express';

const router: Router = Router();

router.use(authRouter);
router.use(commentsRouter);
router.use(pingRouter);
router.use(postsRouter);

export default router;
