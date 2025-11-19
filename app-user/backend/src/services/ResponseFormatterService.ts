import { AskRequest, AskResponse } from '../types';

/**
 * Service responsible for formatting responses
 * Follows Single Responsibility Principle - only handles response formatting
 */
export class ResponseFormatterService {
  /**
   * Formats the workflow result into the expected API response format
   */
  formatResponse(
    request: AskRequest,
    workflowResult: string
  ): AskResponse {
    return {
      data: workflowResult,
      userPrompt: request.prompt,
      dbData: JSON.stringify({
        userId: request.userId || 'anonymous',
        sessionId: request.sessionId || 'no-session',
        timestamp: new Date().toISOString(),
        metadata: request.metadata || {}
      }),
      promtptToSend: request.prompt
    };
  }

  /**
   * Formats an error response
   */
  formatErrorResponse(
    request: AskRequest,
    errorMessage: string
  ): AskResponse {
    return {
      data: errorMessage,
      userPrompt: request.prompt || '',
      dbData: 'Error',
      promtptToSend: request.prompt || ''
    };
  }
}

