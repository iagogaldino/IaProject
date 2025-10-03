export interface DatabaseQuery {
    collection: string;
    operation: 'find' | 'findOne' | 'count' | 'aggregate';
    query?: any;
    projection?: any;
    sort?: any;
    limit?: number;
    skip?: number;
    pipeline?: any[];
}
export interface DatabaseResult {
    success: boolean;
    data?: any;
    count?: number;
    error?: string;
    executionTime?: number;
}
export declare class DatabaseService {
    private connection;
    constructor();
    executeQuery(agentId: string, query: DatabaseQuery, agentDatabaseAccess: any): Promise<DatabaseResult>;
    private getModel;
    getCollectionInfo(collectionName: string): Promise<any>;
    listAvailableCollections(): Promise<string[]>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=databaseService.d.ts.map