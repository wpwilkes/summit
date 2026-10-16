import router from './router.js';
import express, { Application } from 'express';

const app: Application = express();

app.use(express.json());

app.use(router);

export default app;
