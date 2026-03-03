"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const git_1 = require("./commands/git");
const shell_1 = require("./commands/shell");
const config_1 = require("./commands/config");
const config_2 = require("./utils/config");
const program = new commander_1.Command();
program
    .name('niko')
    .description('Developer ops toolkit - git commits, shell config, AI integration, and more')
    .version('0.1.0')
    .hook('preAction', async (thisCommand) => {
    // Skip onboarding check for certain commands
    const skipCommands = ['--help', '-h', '--version', '-V', 'onboarding'];
    const args = process.argv.slice(2);
    if (skipCommands.some(cmd => args.includes(cmd)))
        return;
    // Check onboarding before any command
    const shouldRunDoctor = await (0, config_2.checkOnboarding)();
    if (shouldRunDoctor) {
        await config_1.configCommands.doctor();
        process.exit(0);
    }
});
// Git commands
program
    .command('commit')
    .alias('c')
    .description('Make a smart git commit (auto-analyzes changes)')
    .option('-t, --type <type>', 'Commit type (feat, fix, docs, style, refactor, test, chore)')
    .option('-s, --scope <scope>', 'Commit scope (optional)')
    .option('-m, --message <message>', 'Commit message')
    .option('-a, --all', 'Stage all changes before committing')
    .option('--no-ai', 'Skip AI analysis, use interactive mode only')
    .action(git_1.gitCommands.commit);
program
    .command('undo')
    .description('Safely undo last commit (with backup)')
    .option('--hard', 'Hard reset (discard changes)')
    .action(git_1.gitCommands.undo);
// Shell commands
program
    .command('bashrc')
    .description('Open shell config in your default editor (auto-detects bash/zsh)')
    .option('-e, --edit', 'Edit config', true)
    .option('-c, --cat', 'Print config to stdout')
    .action(shell_1.shellCommands.shellrc);
program
    .command('source')
    .alias('s')
    .description('Source shell config to apply changes (auto-detects bash/zsh)')
    .action(shell_1.shellCommands.source);
program
    .command('alias')
    .description('Manage shell aliases')
    .argument('[name]', 'Alias name')
    .argument('[command]', 'Alias command')
    .option('-l, --list', 'List all aliases')
    .option('-r, --remove <name>', 'Remove an alias')
    .action(shell_1.shellCommands.alias);
program
    .command('env')
    .description('Manage environment variables')
    .argument('[key]', 'Environment variable key')
    .argument('[value]', 'Environment variable value')
    .option('-l, --list', 'List common environment variables')
    .option('-p, --path', 'Show PATH directories')
    .action(shell_1.shellCommands.env);
// Config commands
program
    .command('config')
    .description('Manage niko-cli configuration')
    .option('-g, --get <key>', 'Get config value')
    .option('-s, --set <key>', 'Set config value')
    .option('-l, --list', 'List all config')
    .action(config_1.configCommands.manage);
program
    .command('doctor')
    .description('Check system health and common issues')
    .action(config_1.configCommands.doctor);
program
    .command('onboarding')
    .description('Run setup wizard again')
    .action(async () => {
    const { onboarding } = await Promise.resolve().then(() => __importStar(require('./utils/config')));
    await onboarding();
});
// Utility commands
program
    .command('ip')
    .description('Show network information')
    .option('-l, --local', 'Show local IP only')
    .option('-p, --public', 'Show public IP only')
    .action(shell_1.shellCommands.ip);
program
    .command('ports')
    .description('Show processes using common ports')
    .argument('[port]', 'Specific port to check')
    .action(shell_1.shellCommands.ports);
program
    .command('kill-port')
    .description('Kill process running on specified port')
    .argument('<port>', 'Port number')
    .option('-f, --force', 'Force kill')
    .action(shell_1.shellCommands.killPort);
program
    .command('workspace')
    .alias('ws')
    .description('Navigate to workspace directories quickly')
    .argument('[name]', 'Workspace name')
    .option('-l, --list', 'List saved workspaces')
    .option('-a, --add <name>', 'Add current directory as workspace')
    .action(config_1.configCommands.workspace);
// Parse CLI arguments
program.parse();
// Show help if no command provided
if (!process.argv.slice(2).length) {
    (0, config_2.showBanner)();
    program.outputHelp();
}
//# sourceMappingURL=index.js.map