import * as fs from 'fs';
import * as path from 'path';
import { ILoggerService } from '../interfaces/ILoggerService';

/**
 * Service responsible for logging to file
 * Follows Single Responsibility Principle - only handles logging
 */
export class LoggerService implements ILoggerService {
  private readonly logDirectory: string;
  private readonly logFilePath: string;

  constructor() {
    // Create logs directory if it doesn't exist
    this.logDirectory = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    // Create log file with current date
    const date = new Date().toISOString().split('T')[0];
    this.logFilePath = path.join(this.logDirectory, `workflow-${date}.txt`);
  }

  /**
   * Formats a log entry with timestamp
   */
  private formatLogEntry(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
  }

  /**
   * Writes log entry to file
   */
  private writeToFile(level: string, message: string, data?: any): void {
    try {
      const logEntry = this.formatLogEntry(level, message, data);
      fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Creates a separator line in the log
   */
  private addSeparator(): void {
    const separator = '='.repeat(80) + '\n';
    try {
      fs.appendFileSync(this.logFilePath, separator, 'utf8');
    } catch (error) {
      console.error('Error writing separator to log file:', error);
    }
  }

  logRequest(requestId: string, request: any): void {
    this.addSeparator();
    this.writeToFile(
      'INFO',
      `📥 FRONTEND REQUEST RECEIVED [Request ID: ${requestId}]`,
      {
        requestId,
        prompt: request.prompt,
        userId: request.userId,
        sessionId: request.sessionId,
        timestamp: new Date().toISOString()
      }
    );
  }

  logWorkflowStart(requestId: string, prompt: string): void {
    this.writeToFile(
      'INFO',
      `🚀 WORKFLOW STARTED [Request ID: ${requestId}]`,
      {
        requestId,
        prompt,
        timestamp: new Date().toISOString()
      }
    );
  }

  logClassification(requestId: string, category: string, input: string): void {
    this.writeToFile(
      'INFO',
      `🔍 CLASSIFICATION RESULT [Request ID: ${requestId}]`,
      {
        requestId,
        category,
        input,
        timestamp: new Date().toISOString()
      }
    );
  }

  logAgentStart(requestId: string, agentName: string, input: string): void {
    this.writeToFile(
      'INFO',
      `🤖 AGENT EXECUTION STARTED [Request ID: ${requestId}] [Agent: ${agentName}]`,
      {
        requestId,
        agentName,
        input,
        timestamp: new Date().toISOString()
      }
    );
  }

  logAgentResult(requestId: string, agentName: string, result: string): void {
    this.writeToFile(
      'INFO',
      `✅ AGENT EXECUTION COMPLETED [Request ID: ${requestId}] [Agent: ${agentName}]`,
      {
        requestId,
        agentName,
        result,
        timestamp: new Date().toISOString()
      }
    );
  }

  logWorkflowComplete(requestId: string, result: string): void {
    this.writeToFile(
      'INFO',
      `✨ WORKFLOW COMPLETED [Request ID: ${requestId}]`,
      {
        requestId,
        result,
        timestamp: new Date().toISOString()
      }
    );
    this.addSeparator();
  }

  logError(requestId: string, error: Error | string, context?: string): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.writeToFile(
      'ERROR',
      `❌ ERROR OCCURRED [Request ID: ${requestId}]${context ? ` [Context: ${context}]` : ''}`,
      {
        requestId,
        error: errorMessage,
        stack: errorStack,
        context,
        timestamp: new Date().toISOString()
      }
    );
  }

  log(message: string, level: 'info' | 'error' | 'warning' = 'info'): void {
    this.writeToFile(level.toUpperCase(), message);
  }
}

