import { requireAuth } from '../auth/middleware/middleware.js';
import {
  generateSummaryController,
  getSummaryController,
} from './summaries.controllers.js';
import { SUMMARIES_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const summariesRouter = Router();

// Reading the saved summary is public, like reading the post itself.
summariesRouter.get(SUMMARIES_CONTRACTS.get.path, getSummaryController);
// Generating one costs money, so only signed-in users can do it.
summariesRouter.post(
  SUMMARIES_CONTRACTS.generate.path,
  requireAuth,
  generateSummaryController,
);

export default summariesRouter;
