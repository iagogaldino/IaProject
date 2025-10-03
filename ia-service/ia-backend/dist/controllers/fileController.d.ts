import { Request, Response, NextFunction } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export declare class FileController {
    uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadFile(req: MulterRequest, res: Response, next: NextFunction): Promise<void>;
    processFile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFileInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    listAgentFiles(req: Request, res: Response, next: NextFunction): Promise<void>;
    listAllFiles(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteFile(req: Request, res: Response, next: NextFunction): Promise<void>;
    analyzeContentWithAI(req: Request, res: Response, next: NextFunction): Promise<void>;
    getExternalApiHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
    testExternalApiConnection(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const fileController: FileController;
export {};
//# sourceMappingURL=fileController.d.ts.map