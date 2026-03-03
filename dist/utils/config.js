"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOnboarding = exports.onboarding = exports.showBanner = exports.detectShell = exports.saveConfig = exports.getConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.config', 'niko');
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
const getConfig = () => {
    if (!fs_1.default.existsSync(CONFIG_FILE)) {
        return {};
    }
    return JSON.parse(fs_1.default.readFileSync(CONFIG_FILE, 'utf8'));
};
exports.getConfig = getConfig;
const saveConfig = (config) => {
    if (!fs_1.default.existsSync(CONFIG_DIR)) {
        fs_1.default.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs_1.default.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};
exports.saveConfig = saveConfig;
const detectShell = () => {
    const shell = process.env.SHELL || '';
    if (shell.includes('zsh'))
        return 'zsh';
    return 'bash';
};
exports.detectShell = detectShell;
const showBanner = () => {
    console.log(chalk_1.default.cyan(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ███╗   ██╗██╗██╗  ██╗ ██████╗     ██████╗██╗     ║
║   ████╗  ██║██║██║ ██╔╝██╔═══██╗   ██╔════╝██║     ║
║   ██╔██╗ ██║██║█████╔╝ ██║   ██║   ██║     ██║     ║
║   ██║╚██╗██║██║██╔═██╗ ██║   ██║   ██║     ██║     ║
║   ██║ ╚████║██║██║  ██╗╚██████╔╝   ╚██████╗███████╗║
║   ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═════╝╚══════╝║
║                                                   ║
║         Developer Ops Toolkit v0.1.0              ║
║              by DaciaSec                          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `));
};
exports.showBanner = showBanner;
const setupAIKeys = async (config) => {
    console.log(chalk_1.default.blue('\n🤖 AI API Keys (Optional)'));
    console.log(chalk_1.default.gray('Configure API keys for AI-powered features. You can skip this and add later.\n'));
    const { configureAI } = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'configureAI',
            message: 'Would you like to configure AI API keys now?',
            default: true,
        }]);
    if (!configureAI) {
        console.log(chalk_1.default.gray('Skipped. Run "niko config --set apiKeys" later to add.'));
        return config;
    }
    config.apiKeys = config.apiKeys || {};
    const platforms = [
        { name: 'OpenAI (ChatGPT)', key: 'openai', envVar: 'OPENAI_API_KEY' },
        { name: 'Anthropic (Claude)', key: 'anthropic', envVar: 'ANTHROPIC_API_KEY' },
        { name: 'Moonshot AI', key: 'moonshot', envVar: 'MOONSHOT_API_KEY' },
        { name: 'Google (Gemini)', key: 'gemini', envVar: 'GEMINI_API_KEY' },
        { name: 'Groq', key: 'groq', envVar: 'GROQ_API_KEY' },
    ];
    for (const platform of platforms) {
        const { shouldConfigure } = await inquirer_1.default.prompt([{
                type: 'confirm',
                name: 'shouldConfigure',
                message: `Configure ${platform.name}?`,
                default: false,
            }]);
        if (shouldConfigure) {
            const { apiKey } = await inquirer_1.default.prompt([{
                    type: 'password',
                    name: 'apiKey',
                    message: `Enter your ${platform.name} API key:`,
                    mask: '*',
                    validate: (input) => input.length > 0 || 'API key is required',
                }]);
            // Save to shell config as environment variable
            const shell = config.shell || (0, exports.detectShell)();
            const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
            const configPath = path_1.default.join(os_1.default.homedir(), configFile);
            const exportLine = `export ${platform.envVar}="${apiKey}"\n`;
            fs_1.default.appendFileSync(configPath, exportLine);
            config.apiKeys[platform.key] = platform.envVar;
            console.log(chalk_1.default.green(`  ✓ ${platform.name} configured`));
        }
    }
    console.log(chalk_1.default.gray('\nAPI keys saved to your shell config.'));
    console.log(chalk_1.default.gray('Run "niko source" to apply changes.\n'));
    return config;
};
const setupGitConfig = async (config) => {
    console.log(chalk_1.default.blue('\n📝 Git Commit Configuration (Optional)'));
    console.log(chalk_1.default.gray('Customize how Niko generates commit messages.\n'));
    const { configureGit } = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'configureGit',
            message: 'Would you like to configure git commit settings now?',
            default: true,
        }]);
    if (!configureGit) {
        console.log(chalk_1.default.gray('Skipped. Using defaults (conventional commits).'));
        config.gitConfig = {
            commitStyle: 'conventional',
            maxLength: 72,
            requireScope: false,
        };
        return config;
    }
    const { commitStyle } = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'commitStyle',
            message: 'Commit message style:',
            choices: [
                { name: 'Conventional Commits (feat:, fix:, docs:, etc.)', value: 'conventional' },
                { name: 'Angular Style (build:, ci:, docs:, etc.)', value: 'angular' },
                { name: 'Custom (define your own types)', value: 'custom' },
            ],
            default: 'conventional',
        }]);
    const { maxLength } = await inquirer_1.default.prompt([{
            type: 'number',
            name: 'maxLength',
            message: 'Maximum commit message length:',
            default: 72,
            validate: (input) => input > 0 || 'Must be a positive number',
        }]);
    const { requireScope } = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'requireScope',
            message: 'Require scope in commit messages? (e.g., feat(auth): ...)',
            default: false,
        }]);
    let types = [];
    if (commitStyle === 'custom') {
        const { customTypes } = await inquirer_1.default.prompt([{
                type: 'input',
                name: 'customTypes',
                message: 'Enter custom commit types (comma-separated):',
                default: 'feat,fix,docs,style,refactor,test,chore',
                validate: (input) => input.length > 0 || 'At least one type is required',
            }]);
        types = customTypes.split(',').map((t) => t.trim());
    }
    config.gitConfig = {
        commitStyle,
        maxLength,
        requireScope,
        types: types.length > 0 ? types : undefined,
    };
    console.log(chalk_1.default.green('\n✓ Git commit configuration saved'));
    console.log(chalk_1.default.gray(`  Style: ${commitStyle}`));
    console.log(chalk_1.default.gray(`  Max length: ${maxLength}`));
    console.log(chalk_1.default.gray(`  Require scope: ${requireScope ? 'yes' : 'no'}`));
    return config;
};
const onboarding = async () => {
    (0, exports.showBanner)();
    console.log(chalk_1.default.green('👋 Welcome to Niko CLI!\n'));
    console.log(chalk_1.default.gray('Let\'s get you set up in just a few questions...\n'));
    let config = (0, exports.getConfig)();
    // Step 1: Shell Detection
    const detectedShell = (0, exports.detectShell)();
    const { shell } = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'shell',
            message: 'Which shell do you use?',
            choices: [
                { name: `Bash ${detectedShell === 'bash' ? '(detected)' : ''}`, value: 'bash' },
                { name: `Zsh ${detectedShell === 'zsh' ? '(detected)' : ''}`, value: 'zsh' },
            ],
            default: detectedShell,
        }]);
    config.shell = shell;
    // Step 2: Editor
    const { editor } = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'editor',
            message: 'Preferred code editor?',
            choices: [
                { name: 'VS Code', value: 'code' },
                { name: 'Vim', value: 'vim' },
                { name: 'Nano', value: 'nano' },
                { name: 'Other (specify)', value: 'other' },
            ],
            default: 'code',
        }]);
    config.editor = editor === 'other'
        ? (await inquirer_1.default.prompt([{
                type: 'input',
                name: 'customEditor',
                message: 'Enter your editor command:',
            }])).customEditor
        : editor;
    // Step 3: AI API Keys (Optional)
    config = await setupAIKeys(config);
    // Step 4: Git Commit Config (Optional)
    config = await setupGitConfig(config);
    // Mark onboarding complete
    config.onboardingComplete = true;
    (0, exports.saveConfig)(config);
    console.log(chalk_1.default.green('\n✅ Setup complete!\n'));
    console.log(chalk_1.default.cyan('Your configuration:'));
    console.log(`  Shell: ${config.shell}`);
    console.log(`  Editor: ${config.editor}`);
    if (config.apiKeys && Object.keys(config.apiKeys).length > 0) {
        console.log(`  AI Keys: ${Object.keys(config.apiKeys).length} configured`);
    }
    if (config.gitConfig) {
        console.log(`  Git Style: ${config.gitConfig.commitStyle}`);
    }
    console.log();
    console.log(chalk_1.default.gray('Quick start:'));
    console.log('  niko commit     → Make a smart git commit');
    console.log('  niko bashrc     → Edit your shell config');
    console.log('  niko doctor     → Check system health');
    console.log('  niko --help     → See all commands\n');
    const { runDoctor } = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'runDoctor',
            message: 'Run a quick system health check now?',
            default: true,
        }]);
    if (runDoctor) {
        console.log();
        return true;
    }
    return false;
};
exports.onboarding = onboarding;
const checkOnboarding = async () => {
    const config = (0, exports.getConfig)();
    if (!config.onboardingComplete) {
        return await (0, exports.onboarding)();
    }
    return false;
};
exports.checkOnboarding = checkOnboarding;
//# sourceMappingURL=config.js.map