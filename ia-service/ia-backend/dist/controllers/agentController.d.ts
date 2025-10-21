import { Request, Response, NextFunction } from 'express';
export declare class AgentController {
    createAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllAgents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAgentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateAgentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAgent(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveAgents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailableCollections(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const agentController: AgentController;
//# sourceMappingURL=agentController.d.ts.map