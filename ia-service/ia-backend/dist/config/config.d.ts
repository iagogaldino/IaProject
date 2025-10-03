export declare const config: {
    server: {
        port: number;
        nodeEnv: string;
        apiVersion: string;
    };
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        ssl: boolean;
        url: string;
    };
    openai: {
        apiKey: string;
        model: string;
        maxTokens: number;
        temperature: number;
    };
    security: {
        jwtSecret: string;
        apiKey: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    cors: {
        enabled: boolean;
        origins: string[];
    };
    logging: {
        level: string;
        file: string;
    };
    externalServices: {
        mainBackendUrl: string;
        timeout: number;
        retries: number;
    };
    monitoring: {
        enableMetrics: boolean;
        metricsPort: number;
    };
};
//# sourceMappingURL=config.d.ts.map