"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentCommits = exports.getGitDiff = exports.getStagedFiles = void 0;
const child_process_1 = require("child_process");
const getStagedFiles = () => {
    try {
        const output = (0, child_process_1.execSync)('git diff --cached --name-only', { encoding: 'utf8' });
        return output.trim().split('\n').filter(Boolean);
    }
    catch {
        return [];
    }
};
exports.getStagedFiles = getStagedFiles;
const getGitDiff = (flags = '') => {
    try {
        return (0, child_process_1.execSync)(`git diff ${flags}`, { encoding: 'utf8' });
    }
    catch {
        return '';
    }
};
exports.getGitDiff = getGitDiff;
const getRecentCommits = (count = 5) => {
    try {
        const output = (0, child_process_1.execSync)(`git log --oneline -${count}`, { encoding: 'utf8' });
        return output.trim().split('\n');
    }
    catch {
        return [];
    }
};
exports.getRecentCommits = getRecentCommits;
//# sourceMappingURL=git.js.map