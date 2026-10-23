import { errorHandler } from './errors/error.handler.js';
import router from './router.js';
import express, { Application } from 'express';

const app: Application = express();

app.use(express.json());
app.use(router);
app.use(errorHandler);

export default app;
