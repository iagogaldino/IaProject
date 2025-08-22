import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
// });

const pool = new Pool({
  user: 'dev',
  host: 'db',         // << nome do serviço do Postgres no docker-compose
  database: 'postgres',
  password: 'devpass',
  port: 5432,
});


export const query = (text: string, params?: any[]) => pool.query(text, params);