"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShellConfig = exports.getEditor = void 0;
const process_1 = __importDefault(require("process"));
const getEditor = () => {
    return process_1.default.env.EDITOR || process_1.default.env.VISUAL || 'code';
};
exports.getEditor = getEditor;
const getShellConfig = () => {
    const shell = process_1.default.env.SHELL || '';
    if (shell.includes('zsh'))
        return 'zsh';
    return 'bash';
};
exports.getShellConfig = getShellConfig;
//# sourceMappingURL=shell.js.map