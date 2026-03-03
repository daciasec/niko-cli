import { Command } from 'commander';
import chalk from 'chalk';
import { gitCommands } from './commands/git';
import { shellCommands } from './commands/shell';
import { configCommands } from './commands/config';
import { checkOnboarding, showBanner } from './utils/config';

const program = new Command();

program
  .name('niko')
  .description('Developer ops toolkit - git commits, shell config, AI integration, and more')
  .version('0.1.0')
  .hook('preAction', async (thisCommand) => {
    // Skip onboarding check for certain commands
    const skipCommands = ['--help', '-h', '--version', '-V', 'onboarding'];
    const args = process.argv.slice(2);
    if (skipCommands.some(cmd => args.includes(cmd))) return;
    
    // Check onboarding before any command
    const shouldRunDoctor = await checkOnboarding();
    if (shouldRunDoctor) {
      await configCommands.doctor();
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
  .action(gitCommands.commit);

program
  .command('undo')
  .description('Safely undo last commit (with backup)')
  .option('--hard', 'Hard reset (discard changes)')
  .action(gitCommands.undo);

// Shell commands
program
  .command('bashrc')
  .description('Open shell config in your default editor (auto-detects bash/zsh)')
  .option('-e, --edit', 'Edit config', true)
  .option('-c, --cat', 'Print config to stdout')
  .action(shellCommands.shellrc);

program
  .command('source')
  .alias('s')
  .description('Source shell config to apply changes (auto-detects bash/zsh)')
  .action(shellCommands.source);

program
  .command('alias')
  .description('Manage shell aliases')
  .argument('[name]', 'Alias name')
  .argument('[command]', 'Alias command')
  .option('-l, --list', 'List all aliases')
  .option('-r, --remove <name>', 'Remove an alias')
  .action(shellCommands.alias);

program
  .command('env')
  .description('Manage environment variables')
  .argument('[key]', 'Environment variable key')
  .argument('[value]', 'Environment variable value')
  .option('-l, --list', 'List common environment variables')
  .option('-p, --path', 'Show PATH directories')
  .action(shellCommands.env);

// Config commands
program
  .command('config')
  .description('Manage niko-cli configuration')
  .option('-g, --get <key>', 'Get config value')
  .option('-s, --set <key>', 'Set config value')
  .option('-l, --list', 'List all config')
  .action(configCommands.manage);

program
  .command('doctor')
  .description('Check system health and common issues')
  .action(configCommands.doctor);

program
  .command('onboarding')
  .description('Run setup wizard again')
  .action(async () => {
    const { onboarding } = await import('./utils/config');
    await onboarding();
  });

// Utility commands
program
  .command('ip')
  .description('Show network information')
  .option('-l, --local', 'Show local IP only')
  .option('-p, --public', 'Show public IP only')
  .action(shellCommands.ip);

program
  .command('ports')
  .description('Show processes using common ports')
  .argument('[port]', 'Specific port to check')
  .action(shellCommands.ports);

program
  .command('kill-port')
  .description('Kill process running on specified port')
  .argument('<port>', 'Port number')
  .option('-f, --force', 'Force kill')
  .action(shellCommands.killPort);

program
  .command('workspace')
  .alias('ws')
  .description('Navigate to workspace directories quickly')
  .argument('[name]', 'Workspace name')
  .option('-l, --list', 'List saved workspaces')
  .option('-a, --add <name>', 'Add current directory as workspace')
  .action(configCommands.workspace);

// Parse CLI arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  showBanner();
  program.outputHelp();
}
