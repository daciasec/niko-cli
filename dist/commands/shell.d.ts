export declare const shellCommands: {
    shellrc: (options: {
        edit?: boolean;
        cat?: boolean;
    }) => Promise<void>;
    source: () => Promise<void>;
    alias: (name?: string, command?: string, options?: {
        list?: boolean;
        remove?: string;
    }) => Promise<void>;
    env: (key?: string, value?: string, options?: {
        list?: boolean;
        path?: boolean;
    }) => Promise<void>;
    ip: (options?: {
        local?: boolean;
        public?: boolean;
    }) => Promise<void>;
    ports: (port?: string) => Promise<void>;
    killPort: (port: string, options?: {
        force?: boolean;
    }) => Promise<void>;
};
//# sourceMappingURL=shell.d.ts.map