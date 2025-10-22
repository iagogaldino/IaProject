import express from 'express';
import testRouter from './routes/testRouter';
import aiRouter from './routes/aiRouter';
import cors from 'cors';
import { Config } from './config/config';
import { logger } from './services/logger';

const app = express();
const port = Config.SERVER_PORT;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use('/', testRouter);
app.use('/', aiRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  Config.logConfigStatus();
});