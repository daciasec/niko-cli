import { execSync } from 'child_process';
import chalk from 'chalk';
import os from 'os';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { getEditor } from '../utils/shell';
import { getConfig, saveConfig, detectShell } from '../utils/config';

export const shellCommands = {
  shellrc: async (options: { edit?: boolean; cat?: boolean }) => {
    const config = getConfig();
    let shell = config.shell;

    // Auto-detect if not configured
    if (!shell) {
      shell = detectShell();
      // Save for next time
      saveConfig({ ...config, shell });
    }

    const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
    const configPath = path.join(os.homedir(), configFile);

    console.log(chalk.blue(`Using ${shell} (${configFile})`));

    if (!fs.existsSync(configPath)) {
      console.log(chalk.yellow(`⚠ ${configFile} not found. Creating one...`));
      fs.writeFileSync(configPath, `# Niko CLI generated ${configFile}\n`);
    }

    if (options.cat) {
      console.log(fs.readFileSync(configPath, 'utf8'));
      return;
    }

    const editor = getEditor();
    console.log(chalk.blue(`Opening in ${editor}...`));

    try {
      execSync(`${editor} "${configPath}"`, { stdio: 'inherit' });
    } catch (error) {
      // Fallback to common editors
      const editors = ['code', 'vim', 'nano'];
      for (const ed of editors) {
        try {
          execSync(`${ed} "${configPath}"`, { stdio: 'inherit' });
          return;
        } catch {
          continue;
        }
      }
      console.error(chalk.red('Could not open editor. Please manually edit:'), configPath);
    }
  },

  source: async () => {
    const config = getConfig();
    let shell = config.shell;

    // Auto-detect if not configured
    if (!shell) {
      shell = detectShell();
      saveConfig({ ...config, shell });
    }

    const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
    const configPath = path.join(os.homedir(), configFile);

    console.log(chalk.blue(`Sourcing ${configFile}...`));

    try {
      // Verify syntax first
      execSync(`bash -n "${configPath}"`, { stdio: 'pipe' });
      console.log(chalk.green('✓ Syntax check passed'));
      
      console.log(chalk.green('\nTo apply changes, run:'));
      console.log(chalk.cyan(`  source ~/${configFile}`));
      console.log(chalk.gray('\nOr start a new terminal session.'));
    } catch (error) {
      console.error(chalk.red('✗ Syntax error detected in config file'));
    }
  },

  alias: async (name?: string, command?: string, options?: { list?: boolean; remove?: string }) => {
    const config = getConfig();
    let shell = config.shell || detectShell();
    const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
    const configPath = path.join(os.homedir(), configFile);

    // List aliases
    if (options?.list || (!name && !options?.remove)) {
      console.log(chalk.blue('Current aliases:\n'));
      try {
        const aliases = execSync('alias', { encoding: 'utf8', shell: '/bin/bash' });
        console.log(aliases);
      } catch {
        console.log(chalk.gray('No aliases found or shell does not support alias command'));
      }
      return;
    }

    // Remove alias
    if (options?.remove) {
      const content = fs.readFileSync(configPath, 'utf8');
      const lines = content.split('\n');
      const newLines = lines.filter(line => !line.startsWith(`alias ${options.remove}=`));

      if (lines.length === newLines.length) {
        console.log(chalk.yellow(`Alias "${options.remove}" not found`));
        return;
      }

      fs.writeFileSync(configPath, newLines.join('\n'));
      console.log(chalk.green(`✓ Removed alias: ${options.remove}`));
      console.log(chalk.gray(`Run "niko source" to apply changes`));
      return;
    }

    // Add alias
    if (name && command) {
      const aliasLine = `alias ${name}='${command}'\n`;
      fs.appendFileSync(configPath, aliasLine);
      console.log(chalk.green(`✓ Added alias: ${name}`));
      console.log(chalk.gray(`  ${name} = ${command}`));
      console.log(chalk.gray(`\nRun "niko source" to apply changes`));
    } else {
      console.log(chalk.yellow('Usage: niko alias <name> <command>'));
    }
  },

  env: async (key?: string, value?: string, options?: { list?: boolean; path?: boolean }) => {
    if (options?.list) {
      console.log(chalk.blue('Common environment variables:\n'));
      const vars = ['HOME', 'USER', 'SHELL', 'EDITOR', 'PATH', 'NODE_ENV', 'PWD'];
      vars.forEach(v => {
        const val = process.env[v];
        if (val) {
          console.log(`${chalk.cyan(v)}=${val.length > 60 ? val.slice(0, 60) + '...' : val}`);
        }
      });
      return;
    }

    if (options?.path) {
      console.log(chalk.blue('PATH directories:\n'));
      const paths = (process.env.PATH || '').split(':');
      paths.forEach((p, i) => {
        const exists = fs.existsSync(p);
        console.log(`${i + 1}. ${exists ? chalk.green('✓') : chalk.red('✗')} ${p}`);
      });
      return;
    }

    if (key && !value) {
      const val = process.env[key];
      if (val) {
        console.log(`${chalk.cyan(key)}=${val}`);
      } else {
        console.log(chalk.yellow(`Environment variable "${key}" not set`));
      }
      return;
    }

    if (key && value) {
      const config = getConfig();
      const shell = config.shell || detectShell();
      const configFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
      const configPath = path.join(os.homedir(), configFile);

      const exportLine = `export ${key}="${value}"\n`;
      fs.appendFileSync(configPath, exportLine);
      console.log(chalk.green(`✓ Added environment variable: ${key}`));
      console.log(chalk.gray(`Run "niko source" to apply changes`));
    }
  },

  ip: async (options?: { local?: boolean; public?: boolean }) => {
    if (options?.local || (!options?.local && !options?.public)) {
      console.log(chalk.blue('Local IP addresses:'));
      const interfaces = os.networkInterfaces();
      Object.entries(interfaces).forEach(([name, addrs]) => {
        if (addrs) {
          addrs.forEach(addr => {
            if (addr.family === 'IPv4' && !addr.internal) {
              console.log(`  ${chalk.cyan(name)}: ${addr.address}`);
            }
          });
        }
      });
    }

    if (options?.public || (!options?.local && !options?.public)) {
      console.log(chalk.blue('\nPublic IP:'));
      try {
        console.log(chalk.gray('  Run: curl ifconfig.me'));
      } catch {
        console.log(chalk.gray('  Could not determine'));
      }
    }
  },

  ports: async (port?: string) => {
    if (port) {
      console.log(chalk.blue(`Checking port ${port}...`));
      try {
        const result = execSync(`lsof -ti:${port} || netstat -an | grep :${port}`, { encoding: 'utf8' });
        console.log(result || chalk.gray('No process found'));
      } catch {
        console.log(chalk.gray('Port is free'));
      }
      return;
    }

    console.log(chalk.blue('Common development ports:\n'));
    const commonPorts = [3000, 3001, 4000, 5000, 5173, 8000, 8080, 9000];

    for (const p of commonPorts) {
      try {
        const result = execSync(`lsof -ti:${p} 2>/dev/null || echo ""`, { encoding: 'utf8' });
        if (result.trim()) {
          console.log(`${chalk.red('●')} Port ${p}: ${chalk.yellow('IN USE')}`);
        } else {
          console.log(`${chalk.green('○')} Port ${p}: ${chalk.gray('free')}`);
        }
      } catch {
        console.log(`${chalk.gray('?')} Port ${p}: unknown`);
      }
    }
  },

  killPort: async (port: string, options?: { force?: boolean }) => {
    console.log(chalk.blue(`Killing process on port ${port}...`));

    try {
      const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();

      if (!pid) {
        console.log(chalk.yellow(`No process found on port ${port}`));
        return;
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Kill process ${pid} on port ${port}?`,
        default: true,
      }]);

      if (confirm) {
        const signal = options?.force ? '-9' : '-15';
        execSync(`kill ${signal} ${pid}`, { stdio: 'inherit' });
        console.log(chalk.green(`✓ Killed process ${pid}`));
      }
    } catch (error) {
      console.error(chalk.red('Could not kill process:'), error);
    }
  },
};
