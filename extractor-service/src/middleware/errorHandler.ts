import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('Error:', err);

  // Erro do Multer
  if (err.name === 'MulterError') {
    const message = handleMulterError(err);
    error = new AppError(message, 400);
  }

  // Erro de validação do MongoDB
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Erro de cast do MongoDB
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = new AppError(message, 404);
  }

  const response: ApiResponse = {
    success: false,
    error: error.message || 'Erro interno do servidor',
    message: error.message
  };

  res.status((error as AppError).statusCode || 500).json(response);
};

const handleMulterError = (err: any): string => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return 'Arquivo muito grande. Tamanho máximo permitido: 10MB';
    case 'LIMIT_FILE_COUNT':
      return 'Muitos arquivos. Apenas um arquivo é permitido por vez';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Campo de arquivo inesperado';
    default:
      return err.message;
  }
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
