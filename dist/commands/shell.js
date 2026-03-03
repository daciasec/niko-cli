"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellCommands = void 0;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const shell_1 = require("../utils/shell");
const config_1 = require("../utils/config");
exports.shellCommands = {
    shellrc: async (options) => {
        const config = (0, config_1.getConfig)();
        let shell = config.shell;
        // Auto-detect if not configured
        if (!shell) {
            shell = (0, config_1.detectShell)();
            // Save for next time
            (0, config_1.saveConfig)({ ...config, shell });
        }
        const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
        const configPath = path_1.default.join(os_1.default.homedir(), configFile);
        console.log(chalk_1.default.blue(`Using ${shell} (${configFile})`));
        if (!fs_1.default.existsSync(configPath)) {
            console.log(chalk_1.default.yellow(`⚠ ${configFile} not found. Creating one...`));
            fs_1.default.writeFileSync(configPath, `# Niko CLI generated ${configFile}\n`);
        }
        if (options.cat) {
            console.log(fs_1.default.readFileSync(configPath, 'utf8'));
            return;
        }
        const editor = (0, shell_1.getEditor)();
        console.log(chalk_1.default.blue(`Opening in ${editor}...`));
        try {
            (0, child_process_1.execSync)(`${editor} "${configPath}"`, { stdio: 'inherit' });
        }
        catch (error) {
            // Fallback to common editors
            const editors = ['code', 'vim', 'nano'];
            for (const ed of editors) {
                try {
                    (0, child_process_1.execSync)(`${ed} "${configPath}"`, { stdio: 'inherit' });
                    return;
                }
                catch {
                    continue;
                }
            }
            console.error(chalk_1.default.red('Could not open editor. Please manually edit:'), configPath);
        }
    },
    source: async () => {
        const config = (0, config_1.getConfig)();
        let shell = config.shell;
        // Auto-detect if not configured
        if (!shell) {
            shell = (0, config_1.detectShell)();
            (0, config_1.saveConfig)({ ...config, shell });
        }
        const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
        const configPath = path_1.default.join(os_1.default.homedir(), configFile);
        console.log(chalk_1.default.blue(`Sourcing ${configFile}...`));
        try {
            // Verify syntax first
            (0, child_process_1.execSync)(`bash -n "${configPath}"`, { stdio: 'pipe' });
            console.log(chalk_1.default.green('✓ Syntax check passed'));
            console.log(chalk_1.default.green('\nTo apply changes, run:'));
            console.log(chalk_1.default.cyan(`  source ~/${configFile}`));
            console.log(chalk_1.default.gray('\nOr start a new terminal session.'));
        }
        catch (error) {
            console.error(chalk_1.default.red('✗ Syntax error detected in config file'));
        }
    },
    alias: async (name, command, options) => {
        const config = (0, config_1.getConfig)();
        let shell = config.shell || (0, config_1.detectShell)();
        const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
        const configPath = path_1.default.join(os_1.default.homedir(), configFile);
        // List aliases
        if (options?.list || (!name && !options?.remove)) {
            console.log(chalk_1.default.blue('Current aliases:\n'));
            try {
                const aliases = (0, child_process_1.execSync)('alias', { encoding: 'utf8', shell: '/bin/bash' });
                console.log(aliases);
            }
            catch {
                console.log(chalk_1.default.gray('No aliases found or shell does not support alias command'));
            }
            return;
        }
        // Remove alias
        if (options?.remove) {
            const content = fs_1.default.readFileSync(configPath, 'utf8');
            const lines = content.split('\n');
            const newLines = lines.filter(line => !line.startsWith(`alias ${options.remove}=`));
            if (lines.length === newLines.length) {
                console.log(chalk_1.default.yellow(`Alias "${options.remove}" not found`));
                return;
            }
            fs_1.default.writeFileSync(configPath, newLines.join('\n'));
            console.log(chalk_1.default.green(`✓ Removed alias: ${options.remove}`));
            console.log(chalk_1.default.gray(`Run "niko source" to apply changes`));
            return;
        }
        // Add alias
        if (name && command) {
            const aliasLine = `alias ${name}='${command}'\n`;
            fs_1.default.appendFileSync(configPath, aliasLine);
            console.log(chalk_1.default.green(`✓ Added alias: ${name}`));
            console.log(chalk_1.default.gray(`  ${name} = ${command}`));
            console.log(chalk_1.default.gray(`\nRun "niko source" to apply changes`));
        }
        else {
            console.log(chalk_1.default.yellow('Usage: niko alias <name> <command>'));
        }
    },
    env: async (key, value, options) => {
        if (options?.list) {
            console.log(chalk_1.default.blue('Common environment variables:\n'));
            const vars = ['HOME', 'USER', 'SHELL', 'EDITOR', 'PATH', 'NODE_ENV', 'PWD'];
            vars.forEach(v => {
                const val = process.env[v];
                if (val) {
                    console.log(`${chalk_1.default.cyan(v)}=${val.length > 60 ? val.slice(0, 60) + '...' : val}`);
                }
            });
            return;
        }
        if (options?.path) {
            console.log(chalk_1.default.blue('PATH directories:\n'));
            const paths = (process.env.PATH || '').split(':');
            paths.forEach((p, i) => {
                const exists = fs_1.default.existsSync(p);
                console.log(`${i + 1}. ${exists ? chalk_1.default.green('✓') : chalk_1.default.red('✗')} ${p}`);
            });
            return;
        }
        if (key && !value) {
            const val = process.env[key];
            if (val) {
                console.log(`${chalk_1.default.cyan(key)}=${val}`);
            }
            else {
                console.log(chalk_1.default.yellow(`Environment variable "${key}" not set`));
            }
            return;
        }
        if (key && value) {
            const config = (0, config_1.getConfig)();
            const shell = config.shell || (0, config_1.detectShell)();
            const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
            const configPath = path_1.default.join(os_1.default.homedir(), configFile);
            const exportLine = `export ${key}="${value}"\n`;
            fs_1.default.appendFileSync(configPath, exportLine);
            console.log(chalk_1.default.green(`✓ Added environment variable: ${key}`));
            console.log(chalk_1.default.gray(`Run "niko source" to apply changes`));
        }
    },
    ip: async (options) => {
        if (options?.local || (!options?.local && !options?.public)) {
            console.log(chalk_1.default.blue('Local IP addresses:'));
            const interfaces = os_1.default.networkInterfaces();
            Object.entries(interfaces).forEach(([name, addrs]) => {
                if (addrs) {
                    addrs.forEach(addr => {
                        if (addr.family === 'IPv4' && !addr.internal) {
                            console.log(`  ${chalk_1.default.cyan(name)}: ${addr.address}`);
                        }
                    });
                }
            });
        }
        if (options?.public || (!options?.local && !options?.public)) {
            console.log(chalk_1.default.blue('\nPublic IP:'));
            try {
                console.log(chalk_1.default.gray('  Run: curl ifconfig.me'));
            }
            catch {
                console.log(chalk_1.default.gray('  Could not determine'));
            }
        }
    },
    ports: async (port) => {
        if (port) {
            console.log(chalk_1.default.blue(`Checking port ${port}...`));
            try {
                const result = (0, child_process_1.execSync)(`lsof -ti:${port} || netstat -an | grep :${port}`, { encoding: 'utf8' });
                console.log(result || chalk_1.default.gray('No process found'));
            }
            catch {
                console.log(chalk_1.default.gray('Port is free'));
            }
            return;
        }
        console.log(chalk_1.default.blue('Common development ports:\n'));
        const commonPorts = [3000, 3001, 4000, 5000, 5173, 8000, 8080, 9000];
        for (const p of commonPorts) {
            try {
                const result = (0, child_process_1.execSync)(`lsof -ti:${p} 2>/dev/null || echo ""`, { encoding: 'utf8' });
                if (result.trim()) {
                    console.log(`${chalk_1.default.red('●')} Port ${p}: ${chalk_1.default.yellow('IN USE')}`);
                }
                else {
                    console.log(`${chalk_1.default.green('○')} Port ${p}: ${chalk_1.default.gray('free')}`);
                }
            }
            catch {
                console.log(`${chalk_1.default.gray('?')} Port ${p}: unknown`);
            }
        }
    },
    killPort: async (port, options) => {
        console.log(chalk_1.default.blue(`Killing process on port ${port}...`));
        try {
            const pid = (0, child_process_1.execSync)(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
            if (!pid) {
                console.log(chalk_1.default.yellow(`No process found on port ${port}`));
                return;
            }
            const { confirm } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'confirm',
                    message: `Kill process ${pid} on port ${port}?`,
                    default: true,
                }]);
            if (confirm) {
                const signal = options?.force ? '-9' : '-15';
                (0, child_process_1.execSync)(`kill ${signal} ${pid}`, { stdio: 'inherit' });
                console.log(chalk_1.default.green(`✓ Killed process ${pid}`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Could not kill process:'), error);
        }
    },
};
//# sourceMappingURL=shell.js.map