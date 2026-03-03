import { configCommands } from '../src/commands/config';
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
const mockSaveConfig = saveConfig as jest.MockedFunction<typeof saveConfig>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

describe('Config Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOs.homedir.mockReturnValue('/home/user');
  });

  describe('manage', () => {
    it('should list all config', async () => {
      const config = {
        shell: 'zsh',
        editor: 'code',
        onboardingComplete: true,
      };
      mockGetConfig.mockReturnValue(config);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.manage({ list: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Niko CLI Configuration')
      );
      consoleSpy.mockRestore();
    });

    it('should get specific config value', async () => {
      mockGetConfig.mockReturnValue({ shell: 'zsh' });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.manage({ get: 'shell' });
      
      expect(consoleSpy).toHaveBeenCalledWith('zsh');
      consoleSpy.mockRestore();
    });

    it('should set config value', async () => {
      const inquirer = require('inquirer');
      inquirer.prompt.mockResolvedValue({ value: 'vim' });
      
      mockGetConfig.mockReturnValue({});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.manage({ set: 'editor' });
      
      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ editor: 'vim' })
      );
      consoleSpy.mockRestore();
    });
  });

  describe('doctor', () => {
    it('should check system health', async () => {
      mockExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('git')) return Buffer.from('git version 2.34.1');
        if (cmd.includes('node')) return Buffer.from('v18.12.1');
        if (cmd.includes('npm')) return Buffer.from('8.19.2');
        return Buffer.from('');
      });
      
      mockGetConfig.mockReturnValue({
        shell: 'zsh',
        onboardingComplete: true,
      });
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['id_rsa.pub']);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.doctor();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Git:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Node.js:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('npm:'));
      consoleSpy.mockRestore();
    });

    it('should detect missing tools', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });
      
      mockGetConfig.mockReturnValue({});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.doctor();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('workspace', () => {
    it('should add workspace', async () => {
      mockGetConfig.mockReturnValue({});
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.workspace(undefined, { add: 'frontend' });
      
      expect(mockSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaces: { frontend: expect.any(String) },
        })
      );
      consoleSpy.mockRestore();
    });

    it('should list workspaces', async () => {
      mockGetConfig.mockReturnValue({
        workspaces: {
          frontend: '/home/user/projects/frontend',
          backend: '/home/user/projects/backend',
        },
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.workspace(undefined, { list: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('frontend'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('backend'));
      consoleSpy.mockRestore();
    });

    it('should navigate to workspace', async () => {
      mockGetConfig.mockReturnValue({
        workspaces: { frontend: '/home/user/projects/frontend' },
      });
      mockFs.existsSync.mockReturnValue(true);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await configCommands.workspace('frontend');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('/home/user/projects/frontend')
      );
      consoleSpy.mockRestore();
    });

    it('should warn when workspace does not exist', async () => {
      mockGetConfig.mockReturnValue({
        workspaces: { old: '/deleted/path' },
      });
      mockFs.existsSync.mockReturnValue(false);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await configCommands.workspace('old');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('no longer exists')
      );
      consoleSpy.mockRestore();
    });
  });
});
