import { NextFunction, Request, Response } from 'express';
export declare class ChatController {
    chatWithAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    processAIRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    forwardToExternalAI(req: Request, res: Response, next: NextFunction): Promise<void>;
    smartAgentConsultation(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const chatController: ChatController;
//# sourceMappingURL=chatController.d.ts.map