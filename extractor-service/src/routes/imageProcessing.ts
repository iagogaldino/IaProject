import { Router, Request, Response } from 'express';
import { ImageProcessingService } from '../services/ImageProcessingService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import fs from 'fs';
import path from 'path';

const router = Router();
const imageProcessingService = new ImageProcessingService();

// Endpoint para processamento de imagens base64
router.post('/process-image', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { base64Data, filename } = req.body;

    // Validar dados de entrada
    if (!base64Data) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados base64 da imagem não fornecidos'
      };
      return res.status(400).json(response);
    }

    if (typeof base64Data !== 'string') {
      const response: ApiResponse = {
        success: false,
        error: 'Dados base64 devem ser uma string'
      };
      return res.status(400).json(response);
    }

    console.log('=== REQUISIÇÃO DE PROCESSAMENTO DE IMAGEM ===');
    console.log(`Filename: ${filename || 'não especificado'}`);
    console.log(`Tamanho base64: ${base64Data.length} caracteres`);

    // Processar imagem
    const result = await imageProcessingService.processBase64Image(base64Data, filename);

    // Verificar se texto foi extraído
    if (!result.content || result.content.trim().length === 0) {
      const response: ApiResponse = {
        success: true,
        data: {
          ...result,
          message: 'Nenhum texto foi identificado na imagem'
        },
        message: 'Processamento concluído - nenhum texto encontrado'
      };
      return res.status(200).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Texto extraído da imagem com sucesso'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO DE IMAGEM ===');
    console.error(error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para validação de base64
router.post('/validate-base64', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { base64Data } = req.body;

    if (!base64Data) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados base64 não fornecidos'
      };
      return res.status(400).json(response);
    }

    // Validar formato base64
    const isValid = /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data);
    
    if (!isValid) {
      const response: ApiResponse = {
        success: false,
        error: 'Formato base64 inválido'
      };
      return res.status(400).json(response);
    }

    // Tentar decodificar para verificar se é válido
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const response: ApiResponse = {
        success: true,
        data: {
          isValid: true,
          size: buffer.length,
          estimatedImageSize: `${Math.round(buffer.length / 1024)} KB`
        },
        message: 'Dados base64 válidos'
      };
      res.status(200).json(response);
    } catch (decodeError) {
      const response: ApiResponse = {
        success: false,
        error: 'Dados base64 não podem ser decodificados'
      };
      res.status(400).json(response);
    }

  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para processar imagem específica de página de PDF
router.post('/process-pdf-page', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId, pageNumber, filename } = req.body;

    // Validar parâmetros obrigatórios
    if (!sessionId) {
      const response: ApiResponse = {
        success: false,
        error: 'sessionId é obrigatório'
      };
      return res.status(400).json(response);
    }

    if (!pageNumber) {
      const response: ApiResponse = {
        success: false,
        error: 'pageNumber é obrigatório'
      };
      return res.status(400).json(response);
    }

    // Construir caminho da imagem
    const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
    const sessionPath = path.join(imagesDir, sessionId);
    const imagePath = path.join(sessionPath, `page-${pageNumber}.png`);

    // Verificar se a sessão existe
    if (!fs.existsSync(sessionPath)) {
      const response: ApiResponse = {
        success: false,
        error: `Sessão ${sessionId} não encontrada`
      };
      return res.status(404).json(response);
    }

    // Verificar se a página existe
    if (!fs.existsSync(imagePath)) {
      const response: ApiResponse = {
        success: false,
        error: `Página ${pageNumber} não encontrada na sessão ${sessionId}`
      };
      return res.status(404).json(response);
    }

    console.log('=== PROCESSAMENTO DE PÁGINA PDF INICIADO ===');
    console.log(`Sessão: ${sessionId}`);
    console.log(`Página: ${pageNumber}`);
    console.log(`Caminho: ${imagePath}`);

    // Ler imagem e converter para base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;

    // Processar imagem com OCR
    const result = await imageProcessingService.processBase64Image(
      dataUrl, 
      filename || `page-${pageNumber}.png`
    );

    // Adicionar informações da sessão ao resultado
    const sessionInfo = {
      sessionId,
      pageNumber,
      imagePath,
      sessionPath
    };

    const enhancedResult = {
      ...result,
      sessionInfo
    };

    console.log('=== PROCESSAMENTO DE PÁGINA PDF CONCLUÍDO ===');
    console.log(`Texto extraído: ${result.content.length} caracteres`);

    const response: ApiResponse = {
      success: true,
      data: enhancedResult,
      message: 'Página de PDF processada com sucesso'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO DE PÁGINA PDF ===');
    console.error(error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para listar páginas disponíveis de uma sessão
router.get('/pdf-sessions/:sessionId/pages', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
    const sessionPath = path.join(imagesDir, sessionId);

    if (!fs.existsSync(sessionPath)) {
      const response: ApiResponse = {
        success: false,
        error: `Sessão ${sessionId} não encontrada`
      };
      return res.status(404).json(response);
    }

    // Listar todas as páginas da sessão
    const files = fs.readdirSync(sessionPath);
    const pageFiles = files
      .filter(file => file.startsWith('page-') && file.endsWith('.png'))
      .map(file => {
        const pageNumber = parseInt(file.match(/page-(\d+)\.png/)?.[1] || '0');
        const filePath = path.join(sessionPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          pageNumber,
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => a.pageNumber - b.pageNumber);

    const sessionStats = fs.statSync(sessionPath);

    const response: ApiResponse = {
      success: true,
      data: {
        sessionId,
        sessionPath,
        totalPages: pageFiles.length,
        createdAt: sessionStats.birthtime,
        modifiedAt: sessionStats.mtime,
        pages: pageFiles
      },
      message: `${pageFiles.length} páginas encontradas na sessão ${sessionId}`
    };

    res.status(200).json(response);

  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para processar múltiplas páginas de uma sessão
router.post('/process-pdf-session', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId, pageNumbers, filename } = req.body;

    if (!sessionId) {
      const response: ApiResponse = {
        success: false,
        error: 'sessionId é obrigatório'
      };
      return res.status(400).json(response);
    }

    const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
    const sessionPath = path.join(imagesDir, sessionId);

    if (!fs.existsSync(sessionPath)) {
      const response: ApiResponse = {
        success: false,
        error: `Sessão ${sessionId} não encontrada`
      };
      return res.status(404).json(response);
    }

    // Se pageNumbers não for especificado, processar todas as páginas
    const files = fs.readdirSync(sessionPath);
    const allPages = files
      .filter(file => file.startsWith('page-') && file.endsWith('.png'))
      .map(file => parseInt(file.match(/page-(\d+)\.png/)?.[1] || '0'))
      .sort((a, b) => a - b);

    const pagesToProcess = pageNumbers || allPages;

    console.log('=== PROCESSAMENTO DE SESSÃO PDF INICIADO ===');
    console.log(`Sessão: ${sessionId}`);
    console.log(`Páginas a processar: ${pagesToProcess.join(', ')}`);

    const results = [];

    for (const pageNumber of pagesToProcess) {
      const imagePath = path.join(sessionPath, `page-${pageNumber}.png`);
      
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️ Página ${pageNumber} não encontrada, pulando...`);
        continue;
      }

      try {
        // Ler e processar imagem
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Data = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Data}`;

        const result = await imageProcessingService.processBase64Image(
          dataUrl, 
          filename || `page-${pageNumber}.png`
        );

        results.push({
          pageNumber,
          ...result,
          sessionInfo: {
            sessionId,
            pageNumber,
            imagePath
          }
        });

        console.log(`✅ Página ${pageNumber} processada: ${result.content.length} caracteres`);

      } catch (pageError) {
        console.error(`❌ Erro na página ${pageNumber}:`, pageError);
        results.push({
          pageNumber,
          error: pageError instanceof Error ? pageError.message : 'Erro desconhecido',
          sessionInfo: {
            sessionId,
            pageNumber,
            imagePath
          }
        });
      }
    }

    console.log('=== PROCESSAMENTO DE SESSÃO PDF CONCLUÍDO ===');

    const response: ApiResponse = {
      success: true,
      data: {
        sessionId,
        totalPages: results.length,
        processedPages: results.filter(r => !r.error).length,
        errorPages: results.filter(r => r.error).length,
        results
      },
      message: `Sessão ${sessionId} processada: ${results.filter(r => !r.error).length}/${results.length} páginas com sucesso`
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO DE SESSÃO PDF ===');
    console.error(error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint de health check específico para processamento de imagens
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'OK',
      service: 'Image Processing',
      timestamp: new Date().toISOString(),
      features: [
        'OCR com Tesseract.js',
        'Suporte a base64',
        'Processamento de páginas PDF',
        'Processamento de sessões completas',
        'Limpeza automática de texto',
        'Métricas de confiança'
      ]
    },
    message: 'Serviço de processamento de imagens funcionando'
  };

  res.status(200).json(response);
}));

export default router;
