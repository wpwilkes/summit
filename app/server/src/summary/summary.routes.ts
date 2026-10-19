import { summarizeController } from './summary.controllers.js';
import { SUMMARY_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const summaryRouter: Router = Router();

summaryRouter.post(SUMMARY_CONTRACTS.summarize.path, summarizeController);

export default summaryRouter;
