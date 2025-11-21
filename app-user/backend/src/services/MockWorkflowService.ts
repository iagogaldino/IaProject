import { IWorkflowService } from '../interfaces/IWorkflowService';
import { AskRequest } from '../types';

/**
 * Mock implementation of WorkflowService for development/testing
 * Returns mock responses without calling external APIs
 */
export class MockWorkflowService implements IWorkflowService {
  private mockResponses: { [key: string]: string } = {
    'qual o seu nome': 'Olá! Meu nome é Juju, a assistente virtual de Juazeiro. Estou aqui para ajudar você com informações sobre obras, pavimentação e outros assuntos relacionados à cidade.',
    'obras': 'As obras em Juazeiro são uma prioridade da administração municipal. Existem vários projetos em andamento para melhorar a infraestrutura da cidade, incluindo pavimentação de ruas, construção de praças e melhorias em espaços públicos.',
    'pavimentação': 'A pavimentação de ruas em Juazeiro está sendo realizada em diversos bairros da cidade. Os trabalhos incluem asfaltamento, recapeamento e construção de calçadas. Para informações específicas sobre seu bairro, recomendo consultar a Prefeitura de Juazeiro ou o portal da transparência.',
    'gastos': '# Gastos nas Obras de Juazeiro\n\n## Investimento destinado à infraestrutura da cidade\n\nOs gastos realizados nas obras de **Juazeiro** variam de acordo com o tipo, porte e número de projetos executados. Para obter um valor exato e atualizado, recomenda-se consultar relatórios oficiais da Prefeitura de Juazeiro ou portais da transparência. Até o momento, informações detalhadas sobre o **total gasto** podem ser solicitadas diretamente aos órgãos públicos responsáveis.\n\n**Destaques importantes:**\n- Os valores são públicos e geralmente disponibilizados via portal da transparência municipal.\n- O acesso atualizado pode ser feito diretamente pelo site da Prefeitura de Juazeiro.\n\nSe você desejar dados específicos ou referentes a um período determinado, informe mais detalhes para que a resposta possa ser ainda mais precisa.',
    'investimento': 'Os investimentos em obras de Juazeiro são realizados através de recursos próprios do município, além de convênios e parcerias com o governo federal e estadual. Os valores são divulgados através do portal da transparência municipal.',
    'bairros': 'Os trabalhos de pavimentação estão sendo realizados em diversos bairros de Juazeiro, incluindo áreas do centro e da periferia. Para saber se seu bairro está incluído nos projetos, recomendo consultar diretamente a Secretaria de Infraestrutura da Prefeitura.',
    'default': 'Olá! Para que eu possa te ajudar melhor, por favor faça uma pergunta relacionada a obras ou pavimentação. Estou à disposição para responder suas dúvidas sobre esses assuntos!'
  };

  async executeWorkflow(input: AskRequest, requestId: string): Promise<string> {
    const promptLower = input.prompt.toLowerCase().trim();
    
    // Procura por palavras-chave no prompt
    let response = this.mockResponses['default'];
    
    for (const [key, value] of Object.entries(this.mockResponses)) {
      if (key !== 'default' && promptLower.includes(key)) {
        response = value;
        break;
      }
    }

    // Simula delay de processamento
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return response;
  }
}

