import { AskRequest } from '../types';

/**
 * Interface for workflow service
 * Follows Interface Segregation Principle - focused interface
 */
export interface IWorkflowService {
  /**
   * Executes the workflow with the given input
   * @param input - The workflow input containing the user's prompt
   * @param requestId - Unique identifier for the request (for logging)
   * @returns Promise resolving to the workflow result
   */
  executeWorkflow(input: AskRequest, requestId: string): Promise<string>;
}

