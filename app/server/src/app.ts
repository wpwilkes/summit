import { errorHandler } from './errors/error.handler.js';
import router from './router.js';
import express from 'express';

const app = express();

app.use(express.json());
app.use(router);
app.use(errorHandler);

export default app;
