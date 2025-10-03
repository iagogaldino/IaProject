import { ExtractedContent } from '../../types';

export interface BaseExtractor {
  extract(filePath: string, originalName: string): Promise<ExtractedContent>;
}

