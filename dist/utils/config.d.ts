export interface Config {
    editor?: string;
    shell?: 'bash' | 'zsh';
    onboardingComplete?: boolean;
    workspaces?: Record<string, string>;
    apiKeys?: {
        openai?: string;
        anthropic?: string;
        moonshot?: string;
        gemini?: string;
        groq?: string;
    };
    gitConfig?: {
        commitStyle?: 'conventional' | 'angular' | 'custom';
        maxLength?: number;
        requireScope?: boolean;
        types?: string[];
    };
}
export declare const getConfig: () => Config;
export declare const saveConfig: (config: Config) => void;
export declare const detectShell: () => "bash" | "zsh";
export declare const showBanner: () => void;
export declare const onboarding: () => Promise<boolean>;
export declare const checkOnboarding: () => Promise<boolean>;
//# sourceMappingURL=config.d.ts.map