import { shellCommands } from '../src/commands/shell';
import { getConfig, saveConfig } from '../src/utils/config';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';

jest.mock('child_process');
jest.mock('../src/utils/config');
jest.mock('fs');
jest.mock('os');
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

describe('Shell Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOs.homedir.mockReturnValue('/home/user');
    mockGetConfig.mockReturnValue({
      shell: 'bash',
      editor: 'code',
    });
  });

  describe('shellrc', () => {
    it('should open bashrc for bash users', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      await shellCommands.shellrc({});
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'code "/home/user/.bashrc"',
        { stdio: 'inherit' }
      );
    });

    it('should open zshrc for zsh users', async () => {
      mockGetConfig.mockReturnValue({ shell: 'zsh', editor: 'code' });
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      await shellCommands.shellrc({});
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'code "/home/user/.zshrc"',
        { stdio: 'inherit' }
      );
    });

    it('should create config file if it does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.shellrc({});
      
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should print config to stdout with --cat flag', async () => {
      const configContent = '# Bash config\nexport EDITOR=vim';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(configContent);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.shellrc({ cat: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(configContent);
      consoleSpy.mockRestore();
    });
  });

  describe('source', () => {
    it('should source bashrc for bash users', async () => {
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.source();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('source ~/.bashrc')
      );
      consoleSpy.mockRestore();
    });

    it('should warn on syntax errors', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Syntax error');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await shellCommands.source();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Syntax error')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('alias', () => {
    it('should add new alias', async () => {
      mockFs.appendFileSync.mockImplementation(() => {});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.alias('deploy', 'npm run build && npm run deploy');
      
      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        '/home/user/.bashrc',
        expect.stringContaining("alias deploy='npm run build && npm run deploy'")
      );
      consoleSpy.mockRestore();
    });

    it('should remove alias', async () => {
      const configContent = "alias deploy='npm run build'\nalias test='npm test'";
      mockFs.readFileSync.mockReturnValue(configContent);
      mockFs.writeFileSync.mockImplementation(() => {});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.alias(undefined, undefined, { remove: 'deploy' });
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/home/user/.bashrc',
        "alias test='npm test'"
      );
      consoleSpy.mockRestore();
    });
  });

  describe('env', () => {
    it('should add environment variable', async () => {
      mockFs.appendFileSync.mockImplementation(() => {});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.env('EDITOR', 'vim');
      
      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        '/home/user/.bashrc',
        'export EDITOR="vim"\n'
      );
      consoleSpy.mockRestore();
    });

    it('should show environment variable value', async () => {
      process.env.TEST_VAR = 'test_value';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.env('TEST_VAR');
      
      expect(consoleSpy).toHaveBeenCalledWith('TEST_VAR=test_value');
      consoleSpy.mockRestore();
    });
  });

  describe('ports', () => {
    it('should check specific port', async () => {
      mockExecSync.mockReturnValue(Buffer.from('12345'));
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.ports('3000');
      
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('lsof -ti:3000'),
        { encoding: 'utf8' }
      );
      consoleSpy.mockRestore();
    });

    it('should show all common ports when no port specified', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('lsof -ti:3000')) return Buffer.from('');
        if (cmd.includes('lsof -ti:4000')) return Buffer.from('12345');
        return Buffer.from('');
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await shellCommands.ports();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Port 3000'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Port 4000'));
      consoleSpy.mockRestore();
    });
  });

  describe('killPort', () => {
    it('should kill process on port', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('lsof')) return Buffer.from('12345');
        return Buffer.from('');
      });
      
      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({ confirm: true });
      
      await shellCommands.killPort('3000');
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'kill -15 12345',
        { stdio: 'inherit' }
      );
    });

    it('should force kill with --force flag', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('lsof')) return Buffer.from('12345');
        return Buffer.from('');
      });
      
      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({ confirm: true });
      
      await shellCommands.killPort('3000', { force: true });
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'kill -9 12345',
        { stdio: 'inherit' }
      );
    });
  });
});
