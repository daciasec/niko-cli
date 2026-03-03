import { gitCommands } from '../src/commands/git';
import { getConfig, saveConfig } from '../src/utils/config';
import { execSync } from 'child_process';

// Mock dependencies
jest.mock('child_process');
jest.mock('../src/utils/config');
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockSaveConfig = saveConfig as jest.MockedFunction<typeof saveConfig>;

describe('Git Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue({
      gitConfig: {
        commitStyle: 'conventional',
        maxLength: 72,
        requireScope: false,
      },
    });
  });

  describe('commit', () => {
    it('should stage all changes when -a flag is provided', async () => {
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      await gitCommands.commit({ all: true, ai: false });
      
      expect(mockExecSync).toHaveBeenCalledWith('git add -A', { stdio: 'inherit' });
    });

    it('should commit with provided message and type', async () => {
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      await gitCommands.commit({
        type: 'feat',
        message: 'add new feature',
        ai: false,
      });
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'git commit -m "feat: add new feature"',
        { stdio: 'inherit' }
      );
    });

    it('should include scope in commit message when provided', async () => {
      mockExecSync.mockReturnValue(Buffer.from(''));
      
      await gitCommands.commit({
        type: 'fix',
        scope: 'auth',
        message: 'login bug',
        ai: false,
      });
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'git commit -m "fix(auth): login bug"',
        { stdio: 'inherit' }
      );
    });

    it('should warn when no staged changes', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd === 'git diff --cached --name-only') {
          return Buffer.from('');
        }
        return Buffer.from('');
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await gitCommands.commit({ ai: false });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No staged changes')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('undo', () => {
    it('should perform soft reset by default', async () => {
      mockExecSync.mockReturnValue(Buffer.from('abc123 commit message'));
      
      // Mock user confirmation
      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({ confirm: true });
      
      await gitCommands.undo({});
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'git reset --soft HEAD~1',
        { stdio: 'inherit' }
      );
    });

    it('should perform hard reset when --hard flag is provided', async () => {
      mockExecSync.mockReturnValue(Buffer.from('abc123 commit message'));
      
      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({ confirm: true });
      
      await gitCommands.undo({ hard: true });
      
      expect(mockExecSync).toHaveBeenCalledWith(
        'git reset --hard HEAD~1',
        { stdio: 'inherit' }
      );
    });
  });
});
