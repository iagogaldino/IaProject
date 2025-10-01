import { Pool } from 'pg';
import { Config } from '../config/config';

const pool = new Pool(Config.getDatabaseConfig());


export const query = (text: string, params?: any[]) => pool.query(text, params);