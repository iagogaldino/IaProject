import { Request, Response, NextFunction } from 'express';
export declare class MetadataController {
    getMetadataByFile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMetadataByAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchMetadata(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMetadataStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMetadata(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMetadata(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMetadataByFile(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchSimilarMetadata(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchBySemanticTheme(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateMissingEmbeddings(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMetadataEmbedding(req: Request, res: Response, next: NextFunction): Promise<void>;
    createMetadata(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const metadataController: MetadataController;
//# sourceMappingURL=metadataController.d.ts.map