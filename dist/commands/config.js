"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = require("../utils/config");
exports.configCommands = {
    manage: async (options) => {
        const config = (0, config_1.getConfig)();
        if (options.list) {
            console.log(chalk_1.default.blue('Niko CLI Configuration:\n'));
            console.log(JSON.stringify(config, null, 2) || chalk_1.default.gray('No config set'));
            return;
        }
        if (options.get) {
            console.log(config[options.get] || chalk_1.default.gray('Not set'));
            return;
        }
        if (options.set) {
            const { value } = await inquirer_1.default.prompt([{
                    type: 'input',
                    name: 'value',
                    message: `Value for ${options.set}:`,
                }]);
            config[options.set] = value;
            (0, config_1.saveConfig)(config);
            console.log(chalk_1.default.green(`✓ Set ${options.set} = ${value}`));
        }
    },
    doctor: async () => {
        console.log(chalk_1.default.blue('🔍 Running system health checks...\n'));
        const checks = [
            { name: 'Git', cmd: 'git --version' },
            { name: 'Node.js', cmd: 'node --version' },
            { name: 'npm', cmd: 'npm --version' },
        ];
        for (const check of checks) {
            try {
                const result = (0, child_process_1.execSync)(check.cmd, { encoding: 'utf8' }).trim();
                console.log(`${chalk_1.default.green('✓')} ${check.name}: ${chalk_1.default.gray(result)}`);
            }
            catch {
                console.log(`${chalk_1.default.red('✗')} ${check.name}: ${chalk_1.default.red('not found')}`);
            }
        }
        // Check shell config
        const config = (0, config_1.getConfig)();
        const shell = config.shell || (process.env.SHELL?.includes('zsh') ? 'zsh' : 'bash');
        console.log(`${chalk_1.default.green('✓')} Shell: ${chalk_1.default.gray(shell)}`);
        // Check for common issues
        console.log(chalk_1.default.blue('\n⚠️ Common Issues:'));
        // Git user config
        try {
            const name = (0, child_process_1.execSync)('git config user.name', { encoding: 'utf8' }).trim();
            const email = (0, child_process_1.execSync)('git config user.email', { encoding: 'utf8' }).trim();
            if (name && email) {
                console.log(`${chalk_1.default.green('✓')} Git user configured: ${name} <${email}>`);
            }
            else {
                console.log(`${chalk_1.default.yellow('⚠')} Git user not fully configured`);
            }
        }
        catch {
            console.log(`${chalk_1.default.red('✗')} Git user not configured`);
        }
        // SSH keys
        const sshDir = path_1.default.join(os_1.default.homedir(), '.ssh');
        if (fs_1.default.existsSync(sshDir)) {
            const keys = fs_1.default.readdirSync(sshDir).filter(f => f.endsWith('.pub'));
            if (keys.length > 0) {
                console.log(`${chalk_1.default.green('✓')} SSH keys found: ${keys.join(', ')}`);
            }
            else {
                console.log(`${chalk_1.default.yellow('⚠')} No SSH public keys found`);
            }
        }
        // Niko config
        if (config.onboardingComplete) {
            console.log(`${chalk_1.default.green('✓')} Niko CLI configured`);
        }
        else {
            console.log(`${chalk_1.default.yellow('⚠')} Run 'niko onboarding' to complete setup`);
        }
    },
    workspace: async (name, options) => {
        const config = (0, config_1.getConfig)();
        if (options?.list || (!name && !options?.add)) {
            console.log(chalk_1.default.blue('Saved Workspaces:\n'));
            if (config.workspaces && Object.keys(config.workspaces).length > 0) {
                Object.entries(config.workspaces).forEach(([n, p]) => {
                    console.log(`  ${chalk_1.default.cyan(n)}: ${p}`);
                });
            }
            else {
                console.log(chalk_1.default.gray('  No workspaces saved'));
            }
            console.log(chalk_1.default.gray('\nUse "niko workspace <name>" to navigate'));
            return;
        }
        if (options?.add) {
            const currentDir = process.cwd();
            config.workspaces = config.workspaces || {};
            config.workspaces[options.add] = currentDir;
            (0, config_1.saveConfig)(config);
            console.log(chalk_1.default.green(`✓ Added workspace: ${options.add} -> ${currentDir}`));
            return;
        }
        if (name && config.workspaces?.[name]) {
            const targetDir = config.workspaces[name];
            if (fs_1.default.existsSync(targetDir)) {
                console.log(chalk_1.default.blue(`Navigate to: ${targetDir}`));
                console.log(chalk_1.default.gray(`\nRun: cd ${targetDir}`));
            }
            else {
                console.log(chalk_1.default.red(`Workspace path no longer exists: ${targetDir}`));
            }
        }
        else if (name) {
            console.log(chalk_1.default.yellow(`Workspace "${name}" not found`));
        }
    },
};
//# sourceMappingURL=config.js.map