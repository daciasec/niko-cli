export declare const gitCommands: {
    commit: (options: {
        type?: string;
        scope?: string;
        message?: string;
        all?: boolean;
        ai?: boolean;
    }) => Promise<void>;
    undo: (options: {
        hard?: boolean;
    }) => Promise<void>;
};
//# sourceMappingURL=git.d.ts.map