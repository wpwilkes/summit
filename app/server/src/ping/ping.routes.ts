import {
  pingDatabaseController,
  pingServerController,
} from './ping.controllers.js';
import { PING_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const pingRouter: Router = Router();

pingRouter.get(PING_CONTRACTS.database.path, pingDatabaseController);
pingRouter.get(PING_CONTRACTS.server.path, pingServerController);

export default pingRouter;
