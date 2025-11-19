/**
 * Interface for logger service
 * Follows Interface Segregation Principle
 */
export interface ILoggerService {
  /**
   * Logs a request from the frontend
   */
  logRequest(requestId: string, request: any): void;

  /**
   * Logs the start of workflow execution
   */
  logWorkflowStart(requestId: string, prompt: string): void;

  /**
   * Logs classification result
   */
  logClassification(requestId: string, category: string, input: string): void;

  /**
   * Logs agent execution start
   */
  logAgentStart(requestId: string, agentName: string, input: string): void;

  /**
   * Logs agent execution result
   */
  logAgentResult(requestId: string, agentName: string, result: string): void;

  /**
   * Logs workflow completion
   */
  logWorkflowComplete(requestId: string, result: string): void;

  /**
   * Logs an error
   */
  logError(requestId: string, error: Error | string, context?: string): void;

  /**
   * Logs a custom message
   */
  log(message: string, level?: 'info' | 'error' | 'warning'): void;
}

