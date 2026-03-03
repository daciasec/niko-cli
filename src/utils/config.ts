import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import chalk from 'chalk';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'niko');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

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

export const getConfig = (): Config => {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
};

export const saveConfig = (config: Config) => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const detectShell = (): 'bash' | 'zsh' => {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  return 'bash';
};

export const showBanner = () => {
  console.log(chalk.cyan(`
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

const setupAIKeys = async (config: Config): Promise<Config> => {
  console.log(chalk.blue('\n🤖 AI API Keys (Optional)'));
  console.log(chalk.gray('Configure API keys for AI-powered features. You can skip this and add later.\n'));

  const { configureAI } = await inquirer.prompt([{
    type: 'confirm',
    name: 'configureAI',
    message: 'Would you like to configure AI API keys now?',
    default: true,
  }]);

  if (!configureAI) {
    console.log(chalk.gray('Skipped. Run "niko config --set apiKeys" later to add.'));
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
    const { shouldConfigure } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldConfigure',
      message: `Configure ${platform.name}?`,
      default: false,
    }]);

    if (shouldConfigure) {
      const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: `Enter your ${platform.name} API key:`,
        mask: '*',
        validate: (input: string) => input.length > 0 || 'API key is required',
      }]);

      // Save to shell config as environment variable
      const shell = config.shell || detectShell();
      const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
      const configPath = path.join(os.homedir(), configFile);
      
      const exportLine = `export ${platform.envVar}="${apiKey}"\n`;
      fs.appendFileSync(configPath, exportLine);
      
      (config.apiKeys as any)[platform.key] = platform.envVar;
      console.log(chalk.green(`  ✓ ${platform.name} configured`));
    }
  }

  console.log(chalk.gray('\nAPI keys saved to your shell config.'));
  console.log(chalk.gray('Run "niko source" to apply changes.\n'));

  return config;
};

const setupGitConfig = async (config: Config): Promise<Config> => {
  console.log(chalk.blue('\n📝 Git Commit Configuration (Optional)'));
  console.log(chalk.gray('Customize how Niko generates commit messages.\n'));

  const { configureGit } = await inquirer.prompt([{
    type: 'confirm',
    name: 'configureGit',
    message: 'Would you like to configure git commit settings now?',
    default: true,
  }]);

  if (!configureGit) {
    console.log(chalk.gray('Skipped. Using defaults (conventional commits).'));
    config.gitConfig = {
      commitStyle: 'conventional',
      maxLength: 72,
      requireScope: false,
    };
    return config;
  }

  const { commitStyle } = await inquirer.prompt([{
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

  const { maxLength } = await inquirer.prompt([{
    type: 'number',
    name: 'maxLength',
    message: 'Maximum commit message length:',
    default: 72,
    validate: (input: number) => input > 0 || 'Must be a positive number',
  }]);

  const { requireScope } = await inquirer.prompt([{
    type: 'confirm',
    name: 'requireScope',
    message: 'Require scope in commit messages? (e.g., feat(auth): ...)',
    default: false,
  }]);

  let types: string[] = [];
  if (commitStyle === 'custom') {
    const { customTypes } = await inquirer.prompt([{
      type: 'input',
      name: 'customTypes',
      message: 'Enter custom commit types (comma-separated):',
      default: 'feat,fix,docs,style,refactor,test,chore',
      validate: (input: string) => input.length > 0 || 'At least one type is required',
    }]);
    types = customTypes.split(',').map((t: string) => t.trim());
  }

  config.gitConfig = {
    commitStyle,
    maxLength,
    requireScope,
    types: types.length > 0 ? types : undefined,
  };

  console.log(chalk.green('\n✓ Git commit configuration saved'));
  console.log(chalk.gray(`  Style: ${commitStyle}`));
  console.log(chalk.gray(`  Max length: ${maxLength}`));
  console.log(chalk.gray(`  Require scope: ${requireScope ? 'yes' : 'no'}`));

  return config;
};

export const onboarding = async (): Promise<boolean> => {
  showBanner();

  console.log(chalk.green('👋 Welcome to Niko CLI!\n'));
  console.log(chalk.gray('Let\'s get you set up in just a few questions...\n'));

  let config = getConfig();

  // Step 1: Shell Detection
  const detectedShell = detectShell();
  const { shell } = await inquirer.prompt([{
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
  const { editor } = await inquirer.prompt([{
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
    ? (await inquirer.prompt([{
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
  saveConfig(config);

  console.log(chalk.green('\n✅ Setup complete!\n'));
  console.log(chalk.cyan('Your configuration:'));
  console.log(`  Shell: ${config.shell}`);
  console.log(`  Editor: ${config.editor}`);
  if (config.apiKeys && Object.keys(config.apiKeys).length > 0) {
    console.log(`  AI Keys: ${Object.keys(config.apiKeys).length} configured`);
  }
  if (config.gitConfig) {
    console.log(`  Git Style: ${config.gitConfig.commitStyle}`);
  }
  console.log();

  console.log(chalk.gray('Quick start:'));
  console.log('  niko commit     → Make a smart git commit');
  console.log('  niko bashrc     → Edit your shell config');
  console.log('  niko doctor     → Check system health');
  console.log('  niko --help     → See all commands\n');

  const { runDoctor } = await inquirer.prompt([{
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

export const checkOnboarding = async (): Promise<boolean> => {
  const config = getConfig();
  if (!config.onboardingComplete) {
    return await onboarding();
  }
  return false;
};
