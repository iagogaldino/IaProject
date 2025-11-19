import { Request, Response } from 'express';
import { AskRequest, AskResponse } from '../types';
import { IWorkflowService } from '../interfaces/IWorkflowService';
import { ResponseFormatterService } from '../services/ResponseFormatterService';
import { ILoggerService } from '../interfaces/ILoggerService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller for handling /ask endpoint
 * Follows Single Responsibility Principle - only handles HTTP concerns
 * Follows Dependency Inversion Principle - depends on IWorkflowService abstraction
 */
export class AskController {
  private readonly responseFormatter: ResponseFormatterService;

  constructor(
    private readonly workflowService: IWorkflowService,
    private readonly logger: ILoggerService
  ) {
    this.responseFormatter = new ResponseFormatterService();
  }

  /**
   * Handles the /ask POST request
   */
  askQuestion = async (
    req: Request<{}, AskResponse, AskRequest>,
    res: Response<AskResponse>
  ): Promise<void> => {
    const requestId = uuidv4();
    
    try {
      const request: AskRequest = req.body;

      // Log frontend request
      this.logger.logRequest(requestId, request);

      // Validate input
      if (!request.prompt || request.prompt.trim().length === 0) {
        this.logger.logError(requestId, 'Invalid prompt provided', 'Validation');
        const errorResponse = this.responseFormatter.formatErrorResponse(
          request,
          'Por favor, forneça uma pergunta válida.'
        );
        res.status(400).json(errorResponse);
        return;
      }

      // Execute workflow
      const workflowResult = await this.workflowService.executeWorkflow(request, requestId);

      // Format and send response
      const response = this.responseFormatter.formatResponse(request, workflowResult);
      res.json(response);
    } catch (error) {
      console.error('Error in askQuestion:', error);
      this.logger.logError(
        requestId,
        error instanceof Error ? error : String(error),
        'Controller'
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.';
      const errorResponse = this.responseFormatter.formatErrorResponse(
        req.body,
        errorMessage
      );
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Factory function to create AskController instance
 * Follows Dependency Injection pattern
 */
export const createAskController = (
  workflowService: IWorkflowService,
  logger: ILoggerService
): AskController => {
  return new AskController(workflowService, logger);
};

