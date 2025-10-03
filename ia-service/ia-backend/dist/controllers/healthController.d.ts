import { Request, Response, NextFunction } from 'express';
export declare class HealthController {
    private startTime;
    private requestCount;
    private successfulRequests;
    private failedRequests;
    private totalProcessingTime;
    private agentUsage;
    getHealthStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getConfigStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    incrementRequestCount(): void;
    incrementSuccessfulRequests(): void;
    incrementFailedRequests(): void;
    addProcessingTime(time: number): void;
    recordAgentUsage(agentName: string): void;
}
export declare const healthController: HealthController;
//# sourceMappingURL=healthController.d.ts.map