import { Request, Response, NextFunction } from 'express';
export declare class CommunicationController {
    sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessagesBetweenAgents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUnreadMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessageCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCommunicationStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const communicationController: CommunicationController;
//# sourceMappingURL=communicationController.d.ts.map