declare module 'pdf-poppler' {
  interface ConvertOptions {
    format: 'png' | 'jpeg' | 'tiff';
    out_dir: string;
    out_prefix: string;
    page?: number;
    resolution?: number;
  }

  interface ConvertResult {
    path: string;
    name: string;
    size: number;
  }

  export function convert(filePath: string, options: ConvertOptions): Promise<ConvertResult[]>;
}
