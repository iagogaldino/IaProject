import { AgentInputItem, withTrace } from '@openai/agents';
import { IWorkflowService } from '../interfaces/IWorkflowService';
import { IAgentConfigService } from '../interfaces/IAgentConfigService';
import { ILoggerService } from '../interfaces/ILoggerService';
import { AskRequest } from '../types';

/**
 * Service responsible for executing the workflow
 * Follows Single Responsibility Principle - only handles workflow execution
 * Follows Dependency Inversion Principle - depends on IAgentConfigService abstraction
 */
export class WorkflowService implements IWorkflowService {
  constructor(
    private readonly agentConfigService: IAgentConfigService,
    private readonly logger: ILoggerService
  ) {}

  /**
   * Executes the workflow with the given input
   */
  async executeWorkflow(input: AskRequest, requestId: string): Promise<string> {
    // Log workflow start
    this.logger.logWorkflowStart(requestId, input.prompt);

    return await withTrace('Flow Mayor', async () => {
      const runner = this.agentConfigService.createRunner();
      const conversationHistory: AgentInputItem[] = [
        {
          role: 'user',
          content: [{ type: 'input_text', text: input.prompt }]
        }
      ];

      // Step 1: Execute Agent de Primeiro Contato
      const primeiroContatoResult = await this.executeAgentDePrimeiroContato(
        runner,
        conversationHistory,
        input.prompt,
        requestId
      );

      const response = primeiroContatoResult.response;

      // Log classification result
      this.logger.logClassification(requestId, response, input.prompt);

      // Step 2: Execute the appropriate flow based on response
      let result: string;

      if (response === 'pavimentação') {
        result = await this.executePavimentacaoFlow(
          runner,
          conversationHistory,
          input.prompt,
          requestId
        );
      } else if (response === 'obras') {
        result = await this.executeObrasFlow(
          runner,
          conversationHistory,
          input.prompt,
          requestId
        );
      } else {
        result = await this.executeAgentInformativo(
          runner,
          conversationHistory,
          requestId
        );
      }

      // Log workflow completion
      this.logger.logWorkflowComplete(requestId, result);

      return result;
    });
  }

  /**
   * Executes the Agent de Primeiro Contato
   */
  private async executeAgentDePrimeiroContato(
    runner: any,
    conversationHistory: AgentInputItem[],
    workflowInputAsText: string,
    requestId: string
  ): Promise<{ response: string }> {
    this.logger.logAgentStart(requestId, 'AgentDePrimeiroContato', workflowInputAsText);
    
    const agentDePrimeiroContato = this.agentConfigService.getAgentDePrimeiroContato();
    const result = await runner.run(agentDePrimeiroContato, conversationHistory, {
      context: {
        workflowInputAsText
      }
    });

    conversationHistory.push(...result.newItems.map((item: any) => item.rawItem));

    if (!result.finalOutput) {
      this.logger.logError(requestId, 'Agent de primeiro contato result is undefined', 'AgentDePrimeiroContato');
      throw new Error('Agent de primeiro contato result is undefined');
    }

    this.logger.logAgentResult(requestId, 'AgentDePrimeiroContato', JSON.stringify(result.finalOutput));
    return result.finalOutput;
  }

  /**
   * Executes the pavimentação flow (analista + formatter)
   */
  private async executePavimentacaoFlow(
    runner: any,
    conversationHistory: AgentInputItem[],
    workflowInputAsText: string,
    requestId: string
  ): Promise<string> {
    // Execute Analista sobre Pavimentação
    this.logger.logAgentStart(requestId, 'AnalistaSobrePavimentacao', workflowInputAsText);
    
    const analistaSobrePavimentacao = this.agentConfigService.getAnalistaSobrePavimentacao();
    const analistaResult = await runner.run(analistaSobrePavimentacao, conversationHistory, {
      context: {
        workflowInputAsText
      }
    });

    conversationHistory.push(...analistaResult.newItems.map((item: any) => item.rawItem));

    if (!analistaResult.finalOutput) {
      this.logger.logError(requestId, 'Analista sobre pavimentação result is undefined', 'AnalistaSobrePavimentacao');
      throw new Error('Analista sobre pavimentação result is undefined');
    }

    this.logger.logAgentResult(requestId, 'AnalistaSobrePavimentacao', analistaResult.finalOutput);

    // Execute Response Formatter
    this.logger.logAgentStart(requestId, 'ResponseFormatter', workflowInputAsText);
    
    const responseFormatter = this.agentConfigService.getResponseFormatter();
    const formatterResult = await runner.run(responseFormatter, conversationHistory, {
      context: {
        workflowInputAsText
      }
    });

    conversationHistory.push(...formatterResult.newItems.map((item: any) => item.rawItem));

    if (!formatterResult.finalOutput) {
      this.logger.logError(requestId, 'Response formatter result is undefined', 'ResponseFormatter');
      throw new Error('Response formatter result is undefined');
    }

    this.logger.logAgentResult(requestId, 'ResponseFormatter', formatterResult.finalOutput);
    return formatterResult.finalOutput;
  }

  /**
   * Executes the obras flow (analista + formatter)
   */
  private async executeObrasFlow(
    runner: any,
    conversationHistory: AgentInputItem[],
    workflowInputAsText: string,
    requestId: string
  ): Promise<string> {
    // Execute Analista sobre Obras
    let inputText = '';
    const firstItem = conversationHistory[0];
    if (firstItem && 'content' in firstItem && Array.isArray(firstItem.content)) {
      const firstContent = firstItem.content[0];
      if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
        inputText = (firstContent as { text: string }).text || '';
      }
    }
    this.logger.logAgentStart(requestId, 'AnalistaSobreObras', inputText);
    
    const analistaSobreObras = this.agentConfigService.getAnalistaSobreObras();
    const analistaResult = await runner.run(analistaSobreObras, conversationHistory);

    conversationHistory.push(...analistaResult.newItems.map((item: any) => item.rawItem));

    if (!analistaResult.finalOutput) {
      this.logger.logError(requestId, 'Analista sobre obras result is undefined', 'AnalistaSobreObras');
      throw new Error('Analista sobre obras result is undefined');
    }

    this.logger.logAgentResult(requestId, 'AnalistaSobreObras', analistaResult.finalOutput);

    // Execute Response Formatter
    this.logger.logAgentStart(requestId, 'ResponseFormatter', workflowInputAsText);
    
    const responseFormatter = this.agentConfigService.getResponseFormatter();
    const formatterResult = await runner.run(responseFormatter, conversationHistory, {
      context: {
        workflowInputAsText
      }
    });

    conversationHistory.push(...formatterResult.newItems.map((item: any) => item.rawItem));

    if (!formatterResult.finalOutput) {
      this.logger.logError(requestId, 'Response formatter result is undefined', 'ResponseFormatter');
      throw new Error('Response formatter result is undefined');
    }

    this.logger.logAgentResult(requestId, 'ResponseFormatter', formatterResult.finalOutput);
    return formatterResult.finalOutput;
  }

  /**
   * Executes the agent informativo
   */
  private async executeAgentInformativo(
    runner: any,
    conversationHistory: AgentInputItem[],
    requestId: string
  ): Promise<string> {
    let inputText = '';
    const firstItem = conversationHistory[0];
    if (firstItem && 'content' in firstItem && Array.isArray(firstItem.content)) {
      const firstContent = firstItem.content[0];
      if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
        inputText = (firstContent as { text: string }).text || '';
      }
    }
    this.logger.logAgentStart(requestId, 'AgentInformativo', inputText);
    
    const agentInformativo = this.agentConfigService.getAgentInformativo();
    const result = await runner.run(agentInformativo, conversationHistory);

    conversationHistory.push(...result.newItems.map((item: any) => item.rawItem));

    if (!result.finalOutput) {
      this.logger.logError(requestId, 'Agent informativo result is undefined', 'AgentInformativo');
      throw new Error('Agent informativo result is undefined');
    }

    this.logger.logAgentResult(requestId, 'AgentInformativo', result.finalOutput);
    return result.finalOutput;
  }
}

