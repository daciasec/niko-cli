"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCommands = void 0;
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const git_1 = require("../utils/git");
const config_1 = require("../utils/config");
const CONVENTIONAL_TYPES = [
    { name: '✨ feat:     New feature', value: 'feat' },
    { name: '🐛 fix:      Bug fix', value: 'fix' },
    { name: '📚 docs:     Documentation', value: 'docs' },
    { name: '💄 style:    Code style', value: 'style' },
    { name: '♻️ refactor: Code refactoring', value: 'refactor' },
    { name: '⚡ perf:     Performance', value: 'perf' },
    { name: '✅ test:     Tests', value: 'test' },
    { name: '🔧 chore:    Maintenance', value: 'chore' },
];
const ANGULAR_TYPES = [
    { name: '✨ feat:     New feature', value: 'feat' },
    { name: '🐛 fix:      Bug fix', value: 'fix' },
    { name: '📚 docs:     Documentation', value: 'docs' },
    { name: '💄 style:    Code style', value: 'style' },
    { name: '♻️ refactor: Code refactoring', value: 'refactor' },
    { name: '⚡ perf:     Performance', value: 'perf' },
    { name: '✅ test:     Tests', value: 'test' },
    { name: '🔧 chore:    Maintenance', value: 'chore' },
    { name: '🏗️ build:    Build system', value: 'build' },
    { name: '👷 ci:       CI/CD', value: 'ci' },
];
exports.gitCommands = {
    commit: async (options) => {
        try {
            const config = (0, config_1.getConfig)();
            const gitConfig = config.gitConfig || { commitStyle: 'conventional', maxLength: 72, requireScope: false };
            // Stage all if requested
            if (options.all) {
                (0, child_process_1.execSync)('git add -A', { stdio: 'inherit' });
                console.log(chalk_1.default.green('✓ Staged all changes'));
            }
            // Check if there are staged changes
            const staged = (0, git_1.getStagedFiles)();
            if (staged.length === 0) {
                console.log(chalk_1.default.yellow('⚠ No staged changes. Use -a to stage all, or git add first.'));
                return;
            }
            // AI Analysis (default behavior unless --no-ai)
            let suggestedType = options.type;
            let suggestedMessage = options.message;
            if (options.ai !== false && (!options.type || !options.message)) {
                console.log(chalk_1.default.blue('\n🤖 Analyzing changes...\n'));
                const diff = (0, git_1.getGitDiff)('--staged');
                const fileNames = staged.map(f => f.split('/').pop() || f);
                // Simple heuristic analysis based on git config style
                if (!suggestedType) {
                    if (diff.includes('test') || fileNames.some(f => f.includes('.test.') || f.includes('.spec.'))) {
                        suggestedType = 'test';
                    }
                    else if (diff.includes('fix') || diff.includes('bug') || diff.includes('repair')) {
                        suggestedType = 'fix';
                    }
                    else if (diff.includes('feat') || diff.includes('add') || diff.includes('implement')) {
                        suggestedType = 'feat';
                    }
                    else if (diff.includes('docs') || fileNames.some(f => f.includes('README') || f.includes('.md'))) {
                        suggestedType = 'docs';
                    }
                    else if (diff.includes('refactor')) {
                        suggestedType = 'refactor';
                    }
                    else if (diff.includes('style') || diff.includes('format') || diff.includes('lint')) {
                        suggestedType = 'style';
                    }
                    else if (diff.includes('build') || fileNames.some(f => f.includes('package.json') || f.includes('Dockerfile'))) {
                        suggestedType = gitConfig.commitStyle === 'angular' ? 'build' : 'chore';
                    }
                    else if (diff.includes('ci') || fileNames.some(f => f.includes('.yml') || f.includes('.yaml'))) {
                        suggestedType = gitConfig.commitStyle === 'angular' ? 'ci' : 'chore';
                    }
                    else {
                        suggestedType = 'chore';
                    }
                }
                if (!suggestedMessage) {
                    const changeDesc = fileNames.slice(0, 3).join(', ');
                    if (staged.length === 1) {
                        suggestedMessage = `update ${changeDesc}`;
                    }
                    else {
                        suggestedMessage = `update ${changeDesc} and ${staged.length - 3} more`;
                    }
                }
                console.log(chalk_1.default.gray('Suggested:'), chalk_1.default.cyan(`${suggestedType}${options.scope ? `(${options.scope})` : ''}: ${suggestedMessage}`));
                console.log(chalk_1.default.gray(`\nFiles (${staged.length}):`));
                staged.slice(0, 5).forEach(f => console.log(chalk_1.default.gray(`  ${f}`)));
                if (staged.length > 5) {
                    console.log(chalk_1.default.gray(`  ... and ${staged.length - 5} more`));
                }
                console.log();
            }
            // Interactive mode for missing fields
            let type = options.type || suggestedType;
            let scope = options.scope;
            let message = options.message || suggestedMessage;
            if (!type || !message) {
                const commitTypes = gitConfig.commitStyle === 'angular' ? ANGULAR_TYPES : CONVENTIONAL_TYPES;
                const prompts = [];
                if (!type) {
                    prompts.push({
                        type: 'list',
                        name: 'type',
                        message: 'Commit type:',
                        choices: commitTypes.map(t => ({
                            ...t,
                            name: t.value === suggestedType ? `${t.name} (suggested)` : t.name
                        })),
                        default: suggestedType,
                    });
                }
                if (!scope && gitConfig.requireScope) {
                    prompts.push({
                        type: 'input',
                        name: 'scope',
                        message: 'Scope (required):',
                        validate: (input) => input.length > 0 || 'Scope is required',
                    });
                }
                else if (!scope) {
                    prompts.push({
                        type: 'input',
                        name: 'scope',
                        message: 'Scope (optional, e.g., auth, api, ui):',
                        default: '',
                    });
                }
                if (!message) {
                    prompts.push({
                        type: 'input',
                        name: 'message',
                        message: `Commit message (max ${gitConfig.maxLength} chars):`,
                        default: suggestedMessage || '',
                        validate: (input) => {
                            if (input.length === 0)
                                return 'Message is required';
                            if (input.length > (gitConfig.maxLength || 72))
                                return `Message too long (${input.length}/${gitConfig.maxLength} chars)`;
                            return true;
                        },
                    });
                }
                const answers = await inquirer_1.default.prompt(prompts);
                type = type || answers.type;
                scope = answers.scope !== undefined ? answers.scope : scope;
                message = message || answers.message;
            }
            // Validate message length
            const fullMessage = `${type}${scope ? `(${scope})` : ''}: ${message}`;
            if (fullMessage.length > (gitConfig.maxLength || 72)) {
                console.log(chalk_1.default.yellow(`⚠ Warning: Commit message is ${fullMessage.length} chars (max ${gitConfig.maxLength})`));
                const { proceed } = await inquirer_1.default.prompt([{
                        type: 'confirm',
                        name: 'proceed',
                        message: 'Proceed anyway?',
                        default: false,
                    }]);
                if (!proceed)
                    return;
            }
            // Build commit message
            const scopeStr = scope ? `(${scope})` : '';
            const commitMessage = `${type}${scopeStr}: ${message}`;
            // Show preview
            console.log(chalk_1.default.gray('\nCommit preview:'));
            console.log(chalk_1.default.cyan(commitMessage));
            console.log(chalk_1.default.gray(`Length: ${commitMessage.length}/${gitConfig.maxLength} chars`));
            const { confirm } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Proceed with commit?',
                    default: true,
                }]);
            if (confirm) {
                (0, child_process_1.execSync)(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
                console.log(chalk_1.default.green('✓ Committed successfully'));
            }
            else {
                console.log(chalk_1.default.yellow('Commit cancelled'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error);
            process.exit(1);
        }
    },
    undo: async (options) => {
        try {
            const lastCommit = (0, git_1.getRecentCommits)(1)[0];
            console.log(chalk_1.default.yellow('Last commit:'));
            console.log(chalk_1.default.gray(lastCommit));
            const { confirm } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'confirm',
                    message: options.hard
                        ? 'Hard reset? This will DISCARD all changes!'
                        : 'Undo last commit? Changes will be preserved.',
                    default: false,
                }]);
            if (confirm) {
                if (options.hard) {
                    (0, child_process_1.execSync)('git reset --hard HEAD~1', { stdio: 'inherit' });
                }
                else {
                    (0, child_process_1.execSync)('git reset --soft HEAD~1', { stdio: 'inherit' });
                }
                console.log(chalk_1.default.green('✓ Commit undone'));
            }
            else {
                console.log(chalk_1.default.yellow('Cancelled'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Error:'), error);
            process.exit(1);
        }
    },
};
//# sourceMappingURL=git.js.map