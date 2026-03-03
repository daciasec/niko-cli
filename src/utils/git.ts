import { execSync } from 'child_process';

export const getStagedFiles = (): string[] => {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

export const getGitDiff = (flags = ''): string => {
  try {
    return execSync(`git diff ${flags}`, { encoding: 'utf8' });
  } catch {
    return '';
  }
};

export const getRecentCommits = (count = 5): string[] => {
  try {
    const output = execSync(`git log --oneline -${count}`, { encoding: 'utf8' });
    return output.trim().split('\n');
  } catch {
    return [];
  }
};
