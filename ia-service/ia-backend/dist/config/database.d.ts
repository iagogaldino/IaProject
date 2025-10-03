export declare const connectDatabase: () => Promise<void>;
declare class Database {
    initialize(): Promise<void>;
    close(): Promise<void>;
    isConnected(): Promise<boolean>;
    getConnectionInfo(): Promise<any>;
}
export declare const database: Database;
export {};
//# sourceMappingURL=database.d.ts.map