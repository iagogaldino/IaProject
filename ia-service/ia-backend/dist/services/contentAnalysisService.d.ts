import { ContentAnalysisRequest, ContentAnalysisResponse } from '../types';
export declare class ContentAnalysisService {
    private readonly analysisVersion;
    analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResponse>;
    private performAIAnalysis;
    testAnalysisCapability(): Promise<boolean>;
}
export declare const contentAnalysisService: ContentAnalysisService;
//# sourceMappingURL=contentAnalysisService.d.ts.map