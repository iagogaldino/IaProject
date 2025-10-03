import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import extractionRoutes from './routes/extraction';
import imageProcessingRoutes from './routes/imageProcessing';
import { ApiResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares de segurança e parsing
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota principal
app.get('/', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'Extractor Service API',
      version: '1.0.0',
      description: 'API para extração de conteúdo de arquivos PDF, Excel e TXT',
      endpoints: {
        'POST /api/extract': 'Extrair conteúdo de arquivos (use processWithAI=true para IA)',
        'GET /api/supported-types': 'Listar tipos de arquivo suportados',
        'GET /api/health': 'Health check do serviço',
        'POST /api/images/process-image': 'Processar imagem base64 com OCR',
        'POST /api/images/validate-base64': 'Validar dados base64',
        'POST /api/images/process-pdf-page': 'Processar página específica de PDF',
        'POST /api/images/process-pdf-session': 'Processar múltiplas páginas de PDF',
        'GET /api/images/pdf-sessions/:sessionId/pages': 'Listar páginas de uma sessão',
        'GET /api/images/health': 'Health check do processamento de imagens'
      }
    },
    message: 'Bem-vindo à Extractor Service API'
  };
  res.json(response);
});

// Rotas da API
app.use('/api', extractionRoutes);
app.use('/api/images', imageProcessingRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  };
  res.status(404).json(response);
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📋 Documentação disponível em: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
