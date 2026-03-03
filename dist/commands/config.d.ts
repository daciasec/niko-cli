export declare const configCommands: {
    manage: (options: {
        get?: string;
        set?: string;
        list?: boolean;
    }) => Promise<void>;
    doctor: () => Promise<void>;
    workspace: (name?: string, options?: {
        list?: boolean;
        add?: string;
    }) => Promise<void>;
};
//# sourceMappingURL=config.d.ts.map