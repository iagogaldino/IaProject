import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import upload from '../middleware/upload';
import { ExtractionService } from '../services/ExtractionService';
import { ImageProcessingService } from '../services/ImageProcessingService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, SupportedFileType } from '../types';

const router = Router();
const extractionService = new ExtractionService();
const imageProcessingService = new ImageProcessingService();

// Endpoint principal para extração de conteúdo
router.post('/extract', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  try {
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'Nenhum arquivo foi enviado'
      };
      return res.status(400).json(response);
    }

    // Verificar se o tipo de arquivo foi especificado
    const { fileType, processWithAI } = req.body;
    if (!fileType) {
      const response: ApiResponse = {
        success: false,
        error: 'Tipo de arquivo não especificado'
      };
      return res.status(400).json(response);
    }

    // Validar tipo de arquivo
    if (!extractionService.validateFileType(fileType)) {
      const response: ApiResponse = {
        success: false,
        error: 'Tipo de arquivo não suportado. Tipos permitidos: pdf, pdf-images, excel, txt'
      };
      return res.status(400).json(response);
    }

    // Verificar se a extensão do arquivo corresponde ao tipo especificado
    const fileExtension = extractionService.getFileExtension(req.file.originalname);
    const expectedExtensions: Record<SupportedFileType, string[]> = {
      pdf: ['pdf'],
      'pdf-images': ['pdf'],
      excel: ['xlsx', 'xls'],
      txt: ['txt'],
      image: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
    };

    const expectedExt = expectedExtensions[fileType.toLowerCase() as SupportedFileType];
    if (!expectedExt.includes(fileExtension)) {
      const response: ApiResponse = {
        success: false,
        error: `Extensão do arquivo (.${fileExtension}) não corresponde ao tipo especificado (${fileType})`
      };
      return res.status(400).json(response);
    }

    // Verificar se deve processar com IA (apenas para PDF)
    if (processWithAI === 'true' && fileType.toLowerCase() === 'pdf') {
      console.log('=== PROCESSAMENTO COMPLETO COM IA INICIADO ===');
      console.log(`Arquivo: ${req.file.originalname}`);
      console.log(`Tamanho: ${req.file.size} bytes`);

      try {
        // Passo 1: Extrair imagens do PDF
        console.log('📄 Passo 1: Extraindo imagens do PDF...');
        const pdfImagesResult = await extractionService.extractContent(
          req.file.path,
          'pdf-images' as SupportedFileType,
          req.file.originalname
        );

        console.log(`✅ Imagens extraídas: ${pdfImagesResult.metadata?.pages || 0} páginas`);

        // Passo 2: Processar cada imagem com IA
        console.log('🤖 Passo 2: Processando imagens com IA...');
        const sessionId = pdfImagesResult.metadata?.sessionId;
        
        if (!sessionId) {
          throw new Error('SessionId não encontrado na extração de imagens');
        }

        // Listar páginas da sessão
        const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
        const sessionPath = path.join(imagesDir, sessionId);
        
        if (!fs.existsSync(sessionPath)) {
          throw new Error(`Sessão ${sessionId} não encontrada`);
        }

        const files = fs.readdirSync(sessionPath);
        const pageFiles = files
          .filter(file => file.startsWith('page-') && file.endsWith('.png'))
          .map(file => parseInt(file.match(/page-(\d+)\.png/)?.[1] || '0'))
          .sort((a, b) => a - b);

        console.log(`📄 Páginas encontradas: ${pageFiles.join(', ')}`);

        // Processar cada página com IA
        const processedPages = [];
        let totalText = '';
        let totalConfidence = 0;
        let processedCount = 0;

        for (const pageNumber of pageFiles) {
          try {
            console.log(`🔄 Processando página ${pageNumber}...`);
            
            const imagePath = path.join(sessionPath, `page-${pageNumber}.png`);
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Data = imageBuffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64Data}`;

            const pageResult = await imageProcessingService.processBase64Image(
              dataUrl,
              `page-${pageNumber}.png`
            );

            processedPages.push({
              pageNumber,
              content: pageResult.content,
              metadata: pageResult.metadata,
              sessionInfo: {
                sessionId,
                pageNumber,
                imagePath
              }
            });

            if (pageResult.content && pageResult.content.trim().length > 0) {
              totalText += pageResult.content + '\n\n';
              totalConfidence += pageResult.metadata?.confidence || 0;
              processedCount++;
            }

            console.log(`✅ Página ${pageNumber}: ${pageResult.content.length} caracteres, confiança ${pageResult.metadata?.confidence}%`);

          } catch (pageError) {
            console.error(`❌ Erro na página ${pageNumber}:`, pageError);
            processedPages.push({
              pageNumber,
              error: pageError instanceof Error ? pageError.message : 'Erro desconhecido',
              sessionInfo: {
                sessionId,
                pageNumber,
                imagePath: path.join(sessionPath, `page-${pageNumber}.png`)
              }
            });
          }
        }

        // Calcular métricas finais
        const averageConfidence = processedCount > 0 ? Math.round(totalConfidence / processedCount) : 0;
        const totalCharacters = totalText.length;
        const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
        const totalLines = totalText.split('\n').filter(line => line.trim().length > 0).length;

        console.log('=== PROCESSAMENTO COMPLETO COM IA CONCLUÍDO ===');
        console.log(`📊 Resultado final: ${processedCount}/${pageFiles.length} páginas processadas`);
        console.log(`📝 Texto total: ${totalCharacters} caracteres, ${totalWords} palavras`);
        console.log(`🎯 Confiança média: ${averageConfidence}%`);

        const response: ApiResponse = {
          success: true,
          data: {
            filename: req.file.originalname,
            fileType: 'pdf-ai-processed',
            content: totalText.trim(),
            metadata: {
              size: req.file.size,
              pages: pageFiles.length,
              processedPages: processedCount,
              errorPages: pageFiles.length - processedCount,
              averageConfidence,
              totalCharacters,
              totalWords,
              totalLines,
              sessionId,
              processedAt: new Date().toISOString()
            },
            extractedAt: new Date().toISOString(),
            processedPages,
            processingInfo: {
              method: 'PDF → Images → OCR → Text',
              steps: [
                '1. Extração de imagens do PDF',
                '2. Processamento OCR de cada página',
                '3. Limpeza e estruturação do texto',
                '4. Agregação de resultados'
              ]
            }
          },
          message: `Processamento completo com IA concluído: ${processedCount}/${pageFiles.length} páginas processadas com sucesso`
        };

        res.status(200).json(response);

      } catch (aiError) {
        console.error('=== ERRO NO PROCESSAMENTO COM IA ===');
        console.error(aiError);
        
        const response: ApiResponse = {
          success: false,
          error: `Erro no processamento com IA: ${aiError instanceof Error ? aiError.message : 'Erro desconhecido'}`
        };
        res.status(500).json(response);
      }

    } else {
      // Processamento normal (sem IA)
      const extractedContent = await extractionService.extractContent(
        req.file.path,
        fileType.toLowerCase() as SupportedFileType,
        req.file.originalname
      );

      const response: ApiResponse = {
        success: true,
        data: extractedContent,
        message: 'Conteúdo extraído com sucesso'
      };

      res.status(200).json(response);
    }

  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para listar tipos de arquivo suportados
router.get('/supported-types', asyncHandler(async (req: Request, res: Response) => {
  const supportedTypes = extractionService.getSupportedTypes().map(type => {
    const typeInfo: any = { type };
    
    switch (type) {
      case 'pdf':
        typeInfo.extensions = ['.pdf'];
        typeInfo.description = 'Arquivos PDF (extração de texto)';
        break;
      case 'pdf-images':
        typeInfo.extensions = ['.pdf'];
        typeInfo.description = 'Arquivos PDF (conversão para imagens)';
        break;
      case 'excel':
        typeInfo.extensions = ['.xlsx', '.xls'];
        typeInfo.description = 'Planilhas Excel';
        break;
      case 'txt':
        typeInfo.extensions = ['.txt'];
        typeInfo.description = 'Arquivos de texto';
        break;
    }
    
    return typeInfo;
  });

  const response: ApiResponse = {
    success: true,
    data: supportedTypes,
    message: 'Tipos de arquivo suportados'
  };

  res.status(200).json(response);
}));

// Endpoint específico para extração de imagens de PDF
router.post('/extract-pdf-images', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'Nenhum arquivo foi enviado'
      };
      return res.status(400).json(response);
    }

    // Verificar se é PDF
    const fileExtension = extractionService.getFileExtension(req.file.originalname);
    if (fileExtension !== 'pdf') {
      const response: ApiResponse = {
        success: false,
        error: 'Apenas arquivos PDF são aceitos para extração de imagens'
      };
      return res.status(400).json(response);
    }

    console.log('=== EXTRAÇÃO DE IMAGENS PDF INICIADA ===');
    console.log(`Arquivo: ${req.file.originalname}`);
    console.log(`Tamanho: ${req.file.size} bytes`);

    // Extrair imagens do PDF
    const extractedContent = await extractionService.extractContent(
      req.file.path,
      'pdf-images' as SupportedFileType,
      req.file.originalname
    );

    console.log('=== EXTRAÇÃO DE IMAGENS PDF CONCLUÍDA ===');

    const response: ApiResponse = {
      success: true,
      data: extractedContent,
      message: 'Imagens do PDF extraídas com sucesso'
    };

    res.status(200).json(response);

  } catch (error) {
    console.log('=== ERRO NA EXTRAÇÃO DE IMAGENS PDF ===');
    console.error(error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint de debug para PDF
router.post('/debug-pdf', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'Nenhum arquivo foi enviado'
      };
      return res.status(400).json(response);
    }

    // Verificar se é PDF
    const fileExtension = extractionService.getFileExtension(req.file.originalname);
    if (fileExtension !== 'pdf') {
      const response: ApiResponse = {
        success: false,
        error: 'Apenas arquivos PDF são aceitos neste endpoint de debug'
      };
      return res.status(400).json(response);
    }

    console.log('=== DEBUG PDF INICIADO ===');
    console.log(`Arquivo: ${req.file.originalname}`);
    console.log(`Tamanho: ${req.file.size} bytes`);
    console.log(`Caminho: ${req.file.path}`);

    // Extrair conteúdo com logs detalhados
    const extractedContent = await extractionService.extractContent(
      req.file.path,
      'pdf' as SupportedFileType,
      req.file.originalname
    );

    console.log('=== DEBUG PDF CONCLUÍDO ===');

    const response: ApiResponse = {
      success: true,
      data: extractedContent,
      message: 'Debug de PDF realizado com sucesso - verifique os logs do servidor'
    };

    res.status(200).json(response);

  } catch (error) {
    console.log('=== ERRO NO DEBUG PDF ===');
    console.error(error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
}));

// Endpoint para listar sessões de imagens extraídas
router.get('/pdf-images/sessions', asyncHandler(async (req: Request, res: Response) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
    
    if (!fs.existsSync(imagesDir)) {
      const response: ApiResponse = {
        success: true,
        data: [],
        message: 'Nenhuma sessão de imagens encontrada'
      };
      return res.status(200).json(response);
    }

    const sessions = fs.readdirSync(imagesDir).map((session: string) => {
      const sessionPath = path.join(imagesDir, session);
      const stats = fs.statSync(sessionPath);
      const files = fs.readdirSync(sessionPath);
      const imageFiles = files.filter((file: string) => file.endsWith('.png'));
      
      return {
        sessionId: session,
        sessionPath,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        imageCount: imageFiles.length,
        images: imageFiles.map((file: string) => ({
          filename: file,
          path: path.join(sessionPath, file),
          size: fs.statSync(path.join(sessionPath, file)).size
        }))
      };
    });

    const response: ApiResponse = {
      success: true,
      data: sessions,
      message: 'Sessões de imagens listadas com sucesso'
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

// Endpoint para obter informações de uma sessão específica
router.get('/pdf-images/sessions/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const fs = require('fs');
    const path = require('path');
    const sessionPath = path.join(__dirname, '../../uploads/pdf-images', sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      const response: ApiResponse = {
        success: false,
        error: 'Sessão não encontrada'
      };
      return res.status(404).json(response);
    }

    const stats = fs.statSync(sessionPath);
    const files = fs.readdirSync(sessionPath);
    const imageFiles = files.filter((file: string) => file.endsWith('.png'));
    
    const sessionInfo = {
      sessionId,
      sessionPath,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      imageCount: imageFiles.length,
      images: imageFiles.map((file: string) => ({
        filename: file,
        path: path.join(sessionPath, file),
        size: fs.statSync(path.join(sessionPath, file)).size
      }))
    };

    const response: ApiResponse = {
      success: true,
      data: sessionInfo,
      message: 'Informações da sessão obtidas com sucesso'
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

// Endpoint para limpeza de sessões antigas
router.delete('/pdf-images/cleanup', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { maxAgeHours = 24 } = req.query;
    const fs = require('fs');
    const path = require('path');
    const imagesDir = path.join(__dirname, '../../uploads/pdf-images');
    
    if (!fs.existsSync(imagesDir)) {
      const response: ApiResponse = {
        success: true,
        data: { cleanedSessions: 0 },
        message: 'Nenhuma sessão para limpeza'
      };
      return res.status(200).json(response);
    }

    const now = Date.now();
    const maxAge = Number(maxAgeHours) * 60 * 60 * 1000;
    let cleanedSessions = 0;

    const sessions = fs.readdirSync(imagesDir);
    
    for (const session of sessions) {
      const sessionPath = path.join(imagesDir, session);
      const stats = fs.statSync(sessionPath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        cleanedSessions++;
        console.log(`Sessão removida: ${session}`);
      }
    }

    const response: ApiResponse = {
      success: true,
      data: { cleanedSessions },
      message: `${cleanedSessions} sessões antigas foram removidas`
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

// Endpoint de health check
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Serviço funcionando corretamente'
  };

  res.status(200).json(response);
}));

export default router;
