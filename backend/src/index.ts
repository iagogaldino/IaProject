import express from 'express';
import askIaRouter from './routes/askiaRouter';
import testRouter from './routes/testRouter';
import cors from 'cors';

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use('/', testRouter);
app.use('/', askIaRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
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