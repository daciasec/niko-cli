import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { getConfig, saveConfig } from '../utils/config';

export const configCommands = {
  manage: async (options: { get?: string; set?: string; list?: boolean }) => {
    const config = getConfig();

    if (options.list) {
      console.log(chalk.blue('Niko CLI Configuration:\n'));
      console.log(JSON.stringify(config, null, 2) || chalk.gray('No config set'));
      return;
    }

    if (options.get) {
      console.log(config[options.get as keyof typeof config] || chalk.gray('Not set'));
      return;
    }

    if (options.set) {
      const { value } = await inquirer.prompt([{
        type: 'input',
        name: 'value',
        message: `Value for ${options.set}:`,
      }]);

      (config as any)[options.set] = value;
      saveConfig(config);
      console.log(chalk.green(`✓ Set ${options.set} = ${value}`));
    }
  },

  doctor: async () => {
    console.log(chalk.blue('🔍 Running system health checks...\n'));

    const checks = [
      { name: 'Git', cmd: 'git --version' },
      { name: 'Node.js', cmd: 'node --version' },
      { name: 'npm', cmd: 'npm --version' },
    ];

    for (const check of checks) {
      try {
        const result = execSync(check.cmd, { encoding: 'utf8' }).trim();
        console.log(`${chalk.green('✓')} ${check.name}: ${chalk.gray(result)}`);
      } catch {
        console.log(`${chalk.red('✗')} ${check.name}: ${chalk.red('not found')}`);
      }
    }

    // Check shell config
    const config = getConfig();
    const shell = config.shell || (process.env.SHELL?.includes('zsh') ? 'zsh' : 'bash');
    console.log(`${chalk.green('✓')} Shell: ${chalk.gray(shell)}`);

    // Check for common issues
    console.log(chalk.blue('\n⚠️ Common Issues:'));

    // Git user config
    try {
      const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
      const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
      if (name && email) {
        console.log(`${chalk.green('✓')} Git user configured: ${name} <${email}>`);
      } else {
        console.log(`${chalk.yellow('⚠')} Git user not fully configured`);
      }
    } catch {
      console.log(`${chalk.red('✗')} Git user not configured`);
    }

    // SSH keys
    const sshDir = path.join(os.homedir(), '.ssh');
    if (fs.existsSync(sshDir)) {
      const keys = fs.readdirSync(sshDir).filter(f => f.endsWith('.pub'));
      if (keys.length > 0) {
        console.log(`${chalk.green('✓')} SSH keys found: ${keys.join(', ')}`);
      } else {
        console.log(`${chalk.yellow('⚠')} No SSH public keys found`);
      }
    }

    // Niko config
    if (config.onboardingComplete) {
      console.log(`${chalk.green('✓')} Niko CLI configured`);
    } else {
      console.log(`${chalk.yellow('⚠')} Run 'niko onboarding' to complete setup`);
    }
  },

  workspace: async (name?: string, options?: { list?: boolean; add?: string }) => {
    const config = getConfig();

    if (options?.list || (!name && !options?.add)) {
      console.log(chalk.blue('Saved Workspaces:\n'));
      if (config.workspaces && Object.keys(config.workspaces).length > 0) {
        Object.entries(config.workspaces).forEach(([n, p]) => {
          console.log(`  ${chalk.cyan(n)}: ${p}`);
        });
      } else {
        console.log(chalk.gray('  No workspaces saved'));
      }
      console.log(chalk.gray('\nUse "niko workspace <name>" to navigate'));
      return;
    }

    if (options?.add) {
      const currentDir = process.cwd();
      config.workspaces = config.workspaces || {};
      config.workspaces[options.add] = currentDir;
      saveConfig(config);
      console.log(chalk.green(`✓ Added workspace: ${options.add} -> ${currentDir}`));
      return;
    }

    if (name && config.workspaces?.[name]) {
      const targetDir = config.workspaces[name];
      if (fs.existsSync(targetDir)) {
        console.log(chalk.blue(`Navigate to: ${targetDir}`));
        console.log(chalk.gray(`\nRun: cd ${targetDir}`));
      } else {
        console.log(chalk.red(`Workspace path no longer exists: ${targetDir}`));
      }
    } else if (name) {
      console.log(chalk.yellow(`Workspace "${name}" not found`));
    }
  },
};
