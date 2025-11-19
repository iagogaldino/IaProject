import { fileSearchTool, Agent, RunContext, Runner } from '@openai/agents';
import { z } from 'zod';
import { IAgentConfigService } from '../interfaces/IAgentConfigService';

/**
 * Service responsible for configuring OpenAI agents
 * Follows Single Responsibility Principle - only handles agent configuration
 */
export class AgentConfigService implements IAgentConfigService {
  private readonly vectorStoreId = 'vs_691bcf08e8fc8191b35e4b13cbbceb23';
  private readonly workflowId = 'wf_691ba3b2e12c8190aa95275110aef9330997c827ba61c2e0';

  private fileSearch: any;
  private agentDePrimeiroContato!: any;
  private analistaSobreObras!: any;
  private analistaSobrePavimentacao!: any;
  private agentInformativo!: any;
  private responseFormatter!: any;

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initializes all agents
   */
  private initializeAgents(): void {
    // Initialize file search tool
    this.fileSearch = fileSearchTool([this.vectorStoreId]);

    // Initialize Agent de Primeiro Contato schema
    const AgentDePrimeiroContatoSchema = z.object({ response: z.string() });

    // Initialize Agent de Primeiro Contato
    this.agentDePrimeiroContato = this.createAgentDePrimeiroContato(AgentDePrimeiroContatoSchema);

    // Initialize Analista sobre Obras
    this.analistaSobreObras = new Agent({
      name: 'Analista sobre obras',
      instructions: `Fora realizadas as seguintes obras em Petrolina. 

Bairo 1: 25.000
Bairro 2: 30.00
Bairro 3: 50.000`,
      model: 'gpt-4.1',
      modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
      }
    });

    // Initialize Analista sobre Pavimentação
    this.analistaSobrePavimentacao = this.createAnalistaSobrePavimentacao();

    // Initialize Agent Informativo
    this.agentInformativo = new Agent({
      name: 'Agent informativo',
      instructions: 'Informe ao usário que ele deve fazer uma pergunta sobre obras ou pavimentação',
      model: 'gpt-4.1',
      modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
      }
    });

    // Initialize Response Formatter
    this.responseFormatter = this.createResponseFormatter();
  }

  /**
   * Creates the Agent de Primeiro Contato with dynamic instructions
   */
  private createAgentDePrimeiroContato(schema: any): any {
    interface AgentDePrimeiroContatoContext {
      workflowInputAsText: string;
    }

    const agentDePrimeiroContatoInstructions = (
      runContext: RunContext<AgentDePrimeiroContatoContext>,
      _agent: Agent<AgentDePrimeiroContatoContext>
    ) => {
      const { workflowInputAsText } = runContext.context;
      return `Analise o contexto e verifique se há referência a pavimentação ou obras. Se houver, retorne somente o substantivo relacionado encontrado no texto.

Contexto: ${workflowInputAsText}`;
    };

    return new Agent({
      name: 'Agent de primeiro contato',
      instructions: agentDePrimeiroContatoInstructions,
      model: 'gpt-4.1',
      outputType: schema,
      modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
      }
    }) as any;
  }

  /**
   * Creates the Analista sobre Pavimentação agent with dynamic instructions
   */
  private createAnalistaSobrePavimentacao(): any {
    interface AnalistaSobrePavimentacaoContext {
      workflowInputAsText: string;
    }

    const analistaSobrePavimentacaoInstructions = (
      runContext: RunContext<AnalistaSobrePavimentacaoContext>,
      _agent: Agent<AnalistaSobrePavimentacaoContext>
    ) => {
      const { workflowInputAsText } = runContext.context;
      return `${workflowInputAsText}
{{input.results[0].content[0].text}}`;
    };

    return new Agent({
      name: 'Analista sobre pavimentação',
      instructions: analistaSobrePavimentacaoInstructions,
      model: 'gpt-4.1',
      tools: [this.fileSearch],
      modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
      }
    }) as any;
  }

  /**
   * Creates the Response Formatter agent with dynamic instructions
   */
  private createResponseFormatter(): any {
    interface ResponseFormatterContext {
      workflowInputAsText: string;
    }

    const responseFormatterInstructions = (
      runContext: RunContext<ResponseFormatterContext>,
      _agent: Agent<ResponseFormatterContext>
    ) => {
      const { workflowInputAsText } = runContext.context;
      return `Gere uma resposta clara e bonita usando somente Markdown, sem HTML.
Inclua:

Um título (#)

Um subtítulo breve (##)

Um parágrafo explicativo baseado no contexto

Destaques com **negrito** quando necessário

Listas somente se forem úteis

A resposta deve ser objetiva e bem formatada.

Contexto: (${workflowInputAsText})`;
    };

    return new Agent({
      name: 'Response formatet',
      instructions: responseFormatterInstructions,
      model: 'gpt-4.1',
      modelSettings: {
        temperature: 1,
        topP: 1,
        maxTokens: 2048,
        store: true
      }
    }) as any;
  }

  getAgentDePrimeiroContato(): any {
    return this.agentDePrimeiroContato;
  }

  getAnalistaSobreObras(): any {
    return this.analistaSobreObras;
  }

  getAnalistaSobrePavimentacao(): any {
    return this.analistaSobrePavimentacao;
  }

  getAgentInformativo(): any {
    return this.agentInformativo;
  }

  getResponseFormatter(): any {
    return this.responseFormatter;
  }

  createRunner(): any {
    return new Runner({
      traceMetadata: {
        __trace_source__: 'agent-builder',
        workflow_id: this.workflowId
      }
    });
  }

  getFileSearchTool(): any {
    return this.fileSearch;
  }
}

