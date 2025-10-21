import express from 'express';
import testRouter from './routes/testRouter';
import databaseRouter from './routes/databaseRouter';
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
app.use('/api', databaseRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  Config.logConfigStatus();
});


// query(`
//   SELECT 
//     column_name,
//     data_type,
//     is_nullable,
//     column_default
// FROM information_schema.columns
// WHERE table_name = 'acoes_municipais'
// ORDER BY ordinal_position;

//   `).then(res => {
//   console.log('Table structure:', res.rows)
//   });