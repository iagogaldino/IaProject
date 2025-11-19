import { Request, Response } from 'express';
import { AskRequest, AskResponse } from '../types';

/**
 * Mock responses for different types of prompts
 */
const getMockResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greeting responses
  if (lowerPrompt.includes('olá') || lowerPrompt.includes('oi') || lowerPrompt.includes('hello')) {
    return 'Olá! Como posso ajudá-lo hoje? Estou aqui para responder suas perguntas sobre ações municipais e informações gerais.';
  }
  
  // Question about reports/data
  if (lowerPrompt.includes('relatório') || lowerPrompt.includes('dados') || lowerPrompt.includes('estatística')) {
    return 'Posso ajudá-lo com relatórios e dados municipais. Os dados disponíveis incluem informações sobre ações municipais, orçamentos e projetos em andamento. Que tipo de relatório você precisa?';
  }
  
  // Budget/financial questions
  if (lowerPrompt.includes('orçamento') || lowerPrompt.includes('financeiro') || lowerPrompt.includes('custo')) {
    return 'Informações sobre orçamento municipal estão disponíveis. Posso fornecer detalhes sobre alocações, gastos e planejamento financeiro. Qual aspecto específico do orçamento você gostaria de conhecer?';
  }
  
  // Project questions
  if (lowerPrompt.includes('projeto') || lowerPrompt.includes('plano') || lowerPrompt.includes('estratégia')) {
    return 'Existem vários projetos municipais em andamento. Posso fornecer informações sobre projetos de infraestrutura, sociais, ambientais e outros. Sobre qual projeto você gostaria de saber mais?';
  }
  
  // General response
  return `Obrigado pela sua pergunta: "${prompt}". Esta é uma resposta mock do backend. Em breve, esta funcionalidade será integrada com um serviço de IA real para fornecer respostas mais precisas e contextualizadas sobre ações municipais.`;
};

/**
 * Controller for handling /ask endpoint
 */
export const askQuestion = async (req: Request<{}, AskResponse, AskRequest>, res: Response<AskResponse>) => {
  try {
    const { prompt, conversationHistory, userId, sessionId, metadata } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        data: 'Por favor, forneça uma pergunta válida.',
        userPrompt: prompt || '',
        dbData: 'No data',
        promtptToSend: prompt || ''
      });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock response
    const mockResponse = getMockResponse(prompt);
    
    // Build response
    const response: AskResponse = {
      data: mockResponse,
      userPrompt: prompt,
      dbData: JSON.stringify({
        userId: userId || 'anonymous',
        sessionId: sessionId || 'no-session',
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
      }),
      promtptToSend: prompt
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in askQuestion:', error);
    res.status(500).json({
      data: 'Ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
      userPrompt: req.body.prompt || '',
      dbData: 'Error',
      promtptToSend: req.body.prompt || ''
    });
  }
};

