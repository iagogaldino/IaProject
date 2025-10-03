import fs from 'fs';
import path from 'path';
import { fromPath } from 'pdf2pic';
import * as pdf from 'pdf-poppler';
import { BaseExtractor } from './BaseExtractor';
import { ExtractedContent } from '../../types';

export interface ImageExtractionResult {
  images: Array<{
    page: number;
    filename: string;
    path: string;
    size: number;
    width: number;
    height: number;
  }>;
  totalPages: number;
  extractionMethod: string;
}

export class PDFImageExtractor implements BaseExtractor {
  private uploadsDir: string;
  private imagesDir: string;
  private tempDir: string;

  constructor(uploadsDir: string) {
    this.uploadsDir = uploadsDir;
    this.imagesDir = path.join(uploadsDir, 'pdf-images');
    this.tempDir = path.join(uploadsDir, 'temp');
    
    // Criar diretórios necessários
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [this.imagesDir, this.tempDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório criado: ${dir}`);
      }
    });
  }

  async extract(filePath: string, originalName: string): Promise<ExtractedContent> {
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;

      console.log(`🖼️ Convertendo PDF em imagens: ${originalName}`);
      console.log(`📁 Tamanho: ${(size / 1024 / 1024).toFixed(2)} MB`);

      // Gerar nome único para o diretório de imagens
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const baseName = path.parse(originalName).name;
      const sessionId = `${timestamp}_${randomString}_${baseName}`;
      const sessionDir = path.join(this.imagesDir, sessionId);
      
      // Criar diretório da sessão
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
        console.log(`📂 Diretório criado: ${sessionDir}`);
      }

      // Converter PDF em imagens
      const extractionResult = await this.convertPdfToImages(filePath, sessionDir);
      
      // Limpar arquivo temporário após conversão
      fs.unlinkSync(filePath);

      console.log(`✅ Conversão concluída: ${extractionResult.images.length} imagens geradas`);

      return {
        filename: originalName,
        fileType: 'pdf',
        content: {
          text: `PDF convertido em ${extractionResult.images.length} imagens PNG`,
          numpages: extractionResult.totalPages,
          info: {
            imagesExtracted: extractionResult.images.length,
            extractionMethod: extractionResult.extractionMethod,
            sessionDirectory: sessionDir,
            totalSize: extractionResult.images.reduce((sum, img) => sum + img.size, 0)
          },
          version: 'image-conversion',
          method: 'pdf-to-images',
          extractionNote: `PDF convertido em ${extractionResult.images.length} imagens usando ${extractionResult.extractionMethod}`
        },
        metadata: {
          size,
          pages: extractionResult.totalPages,
          images: extractionResult.images,
          sessionDirectory: sessionDir,
          sessionId: sessionId
        },
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      // Limpar arquivo temporário em caso de erro
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('❌ Erro na conversão:', error);
      throw error;
    }
  }

  private async convertPdfToImages(filePath: string, sessionDir: string): Promise<ImageExtractionResult> {
    console.log('🔄 Iniciando conversão PDF → Imagens...');
    
    // Tentar pdf-poppler primeiro (mais confiável)
    try {
      console.log('📄 Tentando conversão com pdf-poppler...');
      return await this.convertWithPdfPoppler(filePath, sessionDir);
    } catch (error) {
      console.log('⚠️ pdf-poppler falhou:', error instanceof Error ? error.message : error);
      
      // Fallback para pdf2pic
      try {
        console.log('📸 Tentando fallback com pdf2pic...');
        return await this.convertWithPdf2pic(filePath, sessionDir);
      } catch (fallbackError) {
        // Tratar erros específicos do pdf2pic
        if (fallbackError instanceof Error) {
          if (fallbackError.message.includes('EPIPE') || fallbackError.message.includes('write EPIPE')) {
            console.error('❌ pdf2pic falhou com erro de comunicação (EPIPE)');
          } else if (fallbackError.message.includes('ENOENT')) {
            console.error('❌ pdf2pic falhou - arquivo não encontrado');
          } else {
            console.error('❌ pdf2pic também falhou:', fallbackError.message);
          }
        } else {
          console.error('❌ pdf2pic também falhou:', fallbackError);
        }
        
        // Se ambos falharam, verificar se já existem imagens na pasta
        const existingImages = this.checkForExistingImages(sessionDir);
        if (existingImages.length > 0) {
          console.log('✅ Encontradas imagens existentes, usando-as...');
          return {
            images: existingImages,
            totalPages: existingImages.length,
            extractionMethod: 'existing-images'
          };
        }
        
        throw new Error('Não foi possível converter PDF em imagens. Verifique se o arquivo não está corrompido e se as dependências estão instaladas.');
      }
    }
  }

  private async convertWithPdf2pic(filePath: string, sessionDir: string): Promise<ImageExtractionResult> {
    console.log('📸 Convertendo com pdf2pic...');
    
    try {
      const convert = fromPath(filePath, {
        density: 300, // Alta qualidade
        saveFilename: 'page',
        savePath: sessionDir,
        format: 'png',
        width: 2000,
        height: 2000
      });

      // Descobrir quantas páginas tem o PDF
      const totalPages = await this.getPdfPageCount(filePath);
      console.log(`📄 PDF tem ${totalPages} páginas`);

      const images: Array<{
        page: number;
        filename: string;
        path: string;
        size: number;
        width: number;
        height: number;
      }> = [];

      // Converter todas as páginas
      for (let page = 1; page <= totalPages; page++) {
        try {
          console.log(`🔄 Convertendo página ${page}/${totalPages}...`);
          const result = await convert(page, false);
          
          if (result && 'path' in result && result.path) {
            const imagePath = result.path;
            
            if (fs.existsSync(imagePath)) {
              const stats = fs.statSync(imagePath);
              const filename = `page_${page.toString().padStart(3, '0')}.png`;
              const newPath = path.join(sessionDir, filename);
              
              // Mover arquivo para o diretório da sessão
              fs.renameSync(imagePath, newPath);
              
              // Obter dimensões da imagem
              const imageSize = this.getImageDimensions(newPath);
              
              images.push({
                page,
                filename,
                path: newPath,
                size: stats.size,
                width: imageSize.width,
                height: imageSize.height
              });
              
              console.log(`✅ Página ${page}: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
            }
          }
        } catch (pageError) {
          // Tratar erros específicos do pdf2pic
          if (pageError instanceof Error) {
            if (pageError.message.includes('EPIPE') || pageError.message.includes('write EPIPE')) {
              console.log(`⚠️ Erro de comunicação na página ${page} (EPIPE) - tentando continuar...`);
            } else if (pageError.message.includes('ENOENT') || pageError.message.includes('no such file')) {
              console.log(`⚠️ Arquivo não encontrado na página ${page} - tentando continuar...`);
            } else {
              console.log(`⚠️ Erro na página ${page}:`, pageError.message);
            }
          } else {
            console.log(`⚠️ Erro na página ${page}:`, pageError);
          }
          continue;
        }
      }

      if (images.length === 0) {
        throw new Error('Nenhuma página foi convertida com sucesso');
      }

      return {
        images,
        totalPages,
        extractionMethod: 'pdf2pic'
      };
    } catch (error) {
      console.error('❌ Erro no pdf2pic:', error);
      throw error;
    }
  }

  private async convertWithPdfPoppler(filePath: string, sessionDir: string): Promise<ImageExtractionResult> {
    console.log('📸 Convertendo com pdf-poppler...');
    
    const options = {
      format: 'png' as const,
      out_dir: sessionDir,
      out_prefix: 'page',
      resolution: 300 // Alta qualidade
    };

    const results = await pdf.convert(filePath, options);
    console.log(`📄 pdf-poppler converteu ${results.length} páginas`);

    // Verificar se retornou resultados válidos
    if (!results || results.length === 0) {
      throw new Error('pdf-poppler não retornou um array de resultados');
    }

    const images: Array<{
      page: number;
      filename: string;
      path: string;
      size: number;
      width: number;
      height: number;
    }> = [];

    results.forEach((result, index) => {
      if (result.path && fs.existsSync(result.path)) {
        const stats = fs.statSync(result.path);
        const pageNumber = index + 1;
        const filename = `page_${pageNumber.toString().padStart(3, '0')}.png`;
        const newPath = path.join(sessionDir, filename);
        
        // Mover arquivo para o diretório da sessão
        fs.renameSync(result.path, newPath);
        
        // Obter dimensões da imagem
        const imageSize = this.getImageDimensions(newPath);
        
        images.push({
          page: pageNumber,
          filename,
          path: newPath,
          size: stats.size,
          width: imageSize.width,
          height: imageSize.height
        });
        
        console.log(`✅ Página ${pageNumber}: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
      }
    });

    if (images.length === 0) {
      throw new Error('Nenhuma página foi convertida com sucesso');
    }

    return {
      images,
      totalPages: results.length,
      extractionMethod: 'pdf-poppler'
    };
  }


  private async getPdfPageCount(filePath: string): Promise<number> {
    try {
      // Usar pdf-poppler para descobrir o número de páginas
      const options = {
        format: 'png' as const,
        out_dir: this.tempDir,
        out_prefix: 'temp',
        resolution: 72 // Baixa resolução apenas para contar páginas
      };
      
      const results = await pdf.convert(filePath, options);
      
      // Limpar arquivos temporários
      results.forEach(result => {
        if (result.path && fs.existsSync(result.path)) {
          fs.unlinkSync(result.path);
        }
      });
      
      return results.length;
    } catch (error) {
      console.log('⚠️ Erro ao contar páginas, assumindo 1 página:', error);
      return 1;
    }
  }

  private getImageDimensions(imagePath: string): { width: number; height: number } {
    // Retornar dimensões padrão - em produção, usar biblioteca como 'sharp'
    return { width: 2000, height: 2000 };
  }

  /**
   * Verifica se já existem imagens na pasta da sessão
   */
  private checkForExistingImages(sessionDir: string): Array<{
    page: number;
    filename: string;
    path: string;
    size: number;
    width: number;
    height: number;
  }> {
    try {
      if (!fs.existsSync(sessionDir)) {
        return [];
      }

      const files = fs.readdirSync(sessionDir);
      const imageFiles = files
        .filter(file => file.toLowerCase().endsWith('.png'))
        .sort()
        .map((file, index) => {
          const filePath = path.join(sessionDir, file);
          const stats = fs.statSync(filePath);
          return {
            page: index + 1,
            filename: file,
            path: filePath,
            size: stats.size,
            width: 2000, // Dimensões padrão
            height: 2000
          };
        });

      return imageFiles;
    } catch (error) {
      console.log('⚠️ Erro ao verificar imagens existentes:', error);
      return [];
    }
  }

}
