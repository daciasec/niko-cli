import os from 'os';
import process from 'process';

export const getEditor = (): string => {
  return process.env.EDITOR || process.env.VISUAL || 'code';
};

export const getShellConfig = (): 'bash' | 'zsh' => {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  return 'bash';
};
