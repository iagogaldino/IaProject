import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Centralized configuration class for the application
 * This class provides a single source of truth for all configuration values
 */
export class Config {
  // OpenAI Configuration
  static readonly OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';
  
  // Database Configuration
  static readonly DB_USER: string = process.env.PGUSER || 'dev';
  static readonly DB_HOST: string = process.env.PGHOST || 'db';
  static readonly DB_NAME: string = process.env.PGDATABASE || 'app_db';
  static readonly DB_PASSWORD: string = process.env.PGPASSWORD || 'devpass';
  static readonly DB_PORT: number = parseInt(process.env.PGPORT || '5432');

  // Server Configuration
  static readonly SERVER_PORT: number = parseInt(process.env.SERVER_PORT || '3000');
  static readonly NODE_ENV: string = process.env.NODE_ENV || 'development';


  /**
   * Gets database connection configuration
   * @returns database configuration object
   */
  static getDatabaseConfig() {
    return {
      user: this.DB_USER,
      host: this.DB_HOST,
      database: this.DB_NAME,
      password: this.DB_PASSWORD,
      port: this.DB_PORT,
    };
  }

  /**
   * Checks if the application is running in development mode
   * @returns true if in development mode, false otherwise
   */
  static isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  /**
   * Logs current configuration status (for debugging)
   */
  static logConfigStatus(): void {
    console.log('=== Configuration Status ===');
    console.log('Database Host:', this.DB_HOST);
    console.log('Database Name:', this.DB_NAME);
    console.log('Server Port:', this.SERVER_PORT);
    console.log('Environment:', this.NODE_ENV);
    console.log('============================');
  }
}
