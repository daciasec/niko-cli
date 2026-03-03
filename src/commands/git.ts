import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getStagedFiles, getGitDiff, getRecentCommits } from '../utils/git';
import { getConfig } from '../utils/config';

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

export const gitCommands = {
  commit: async (options: { 
    type?: string; 
    scope?: string; 
    message?: string; 
    all?: boolean;
    ai?: boolean;
  }) => {
    try {
      const config = getConfig();
      const gitConfig = config.gitConfig || { commitStyle: 'conventional', maxLength: 72, requireScope: false };

      // Stage all if requested
      if (options.all) {
        execSync('git add -A', { stdio: 'inherit' });
        console.log(chalk.green('✓ Staged all changes'));
      }

      // Check if there are staged changes
      const staged = getStagedFiles();
      if (staged.length === 0) {
        console.log(chalk.yellow('⚠ No staged changes. Use -a to stage all, or git add first.'));
        return;
      }

      // AI Analysis (default behavior unless --no-ai)
      let suggestedType = options.type;
      let suggestedMessage = options.message;
      
      if (options.ai !== false && (!options.type || !options.message)) {
        console.log(chalk.blue('\n🤖 Analyzing changes...\n'));
        
        const diff = getGitDiff('--staged');
        const fileNames = staged.map(f => f.split('/').pop() || f);
        
        // Simple heuristic analysis based on git config style
        if (!suggestedType) {
          if (diff.includes('test') || fileNames.some(f => f.includes('.test.') || f.includes('.spec.'))) {
            suggestedType = 'test';
          } else if (diff.includes('fix') || diff.includes('bug') || diff.includes('repair')) {
            suggestedType = 'fix';
          } else if (diff.includes('feat') || diff.includes('add') || diff.includes('implement')) {
            suggestedType = 'feat';
          } else if (diff.includes('docs') || fileNames.some(f => f.includes('README') || f.includes('.md'))) {
            suggestedType = 'docs';
          } else if (diff.includes('refactor')) {
            suggestedType = 'refactor';
          } else if (diff.includes('style') || diff.includes('format') || diff.includes('lint')) {
            suggestedType = 'style';
          } else if (diff.includes('build') || fileNames.some(f => f.includes('package.json') || f.includes('Dockerfile'))) {
            suggestedType = gitConfig.commitStyle === 'angular' ? 'build' : 'chore';
          } else if (diff.includes('ci') || fileNames.some(f => f.includes('.yml') || f.includes('.yaml'))) {
            suggestedType = gitConfig.commitStyle === 'angular' ? 'ci' : 'chore';
          } else {
            suggestedType = 'chore';
          }
        }

        if (!suggestedMessage) {
          const changeDesc = fileNames.slice(0, 3).join(', ');
          if (staged.length === 1) {
            suggestedMessage = `update ${changeDesc}`;
          } else {
            suggestedMessage = `update ${changeDesc} and ${staged.length - 3} more`;
          }
        }

        console.log(chalk.gray('Suggested:'), chalk.cyan(`${suggestedType}${options.scope ? `(${options.scope})` : ''}: ${suggestedMessage}`));
        console.log(chalk.gray(`\nFiles (${staged.length}):`));
        staged.slice(0, 5).forEach(f => console.log(chalk.gray(`  ${f}`)));
        if (staged.length > 5) {
          console.log(chalk.gray(`  ... and ${staged.length - 5} more`));
        }
        console.log();
      }

      // Interactive mode for missing fields
      let type = options.type || suggestedType;
      let scope = options.scope;
      let message = options.message || suggestedMessage;

      if (!type || !message) {
        const commitTypes = gitConfig.commitStyle === 'angular' ? ANGULAR_TYPES : CONVENTIONAL_TYPES;
        
        const prompts: any[] = [];

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
            validate: (input: string) => input.length > 0 || 'Scope is required',
          });
        } else if (!scope) {
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
            validate: (input: string) => {
              if (input.length === 0) return 'Message is required';
              if (input.length > (gitConfig.maxLength || 72)) return `Message too long (${input.length}/${gitConfig.maxLength} chars)`;
              return true;
            },
          });
        }

        const answers = await inquirer.prompt(prompts);
        type = type || answers.type;
        scope = answers.scope !== undefined ? answers.scope : scope;
        message = message || answers.message;
      }

      // Validate message length
      const fullMessage = `${type}${scope ? `(${scope})` : ''}: ${message}`;
      if (fullMessage.length > (gitConfig.maxLength || 72)) {
        console.log(chalk.yellow(`⚠ Warning: Commit message is ${fullMessage.length} chars (max ${gitConfig.maxLength})`));
        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed anyway?',
          default: false,
        }]);
        if (!proceed) return;
      }

      // Build commit message
      const scopeStr = scope ? `(${scope})` : '';
      const commitMessage = `${type}${scopeStr}: ${message}`;

      // Show preview
      console.log(chalk.gray('\nCommit preview:'));
      console.log(chalk.cyan(commitMessage));
      console.log(chalk.gray(`Length: ${commitMessage.length}/${gitConfig.maxLength} chars`));

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with commit?',
        default: true,
      }]);

      if (confirm) {
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        console.log(chalk.green('✓ Committed successfully'));
      } else {
        console.log(chalk.yellow('Commit cancelled'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  },

  undo: async (options: { hard?: boolean }) => {
    try {
      const lastCommit = getRecentCommits(1)[0];
      console.log(chalk.yellow('Last commit:'));
      console.log(chalk.gray(lastCommit));

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: options.hard 
          ? 'Hard reset? This will DISCARD all changes!' 
          : 'Undo last commit? Changes will be preserved.',
        default: false,
      }]);

      if (confirm) {
        if (options.hard) {
          execSync('git reset --hard HEAD~1', { stdio: 'inherit' });
        } else {
          execSync('git reset --soft HEAD~1', { stdio: 'inherit' });
        }
        console.log(chalk.green('✓ Commit undone'));
      } else {
        console.log(chalk.yellow('Cancelled'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  },
};
