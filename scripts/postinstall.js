#!/usr/bin/env node
const chalk = require('chalk');

console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ███╗   ██╗██╗██╗  ██╗ ██████╗     ██████╗██╗     ║
║   ████╗  ██║██║██║ ██╔╝██╔═══██╗   ██╔════╝██║     ║
║   ██╔██╗ ██║██║█████╔╝ ██║   ██║   ██║     ██║     ║
║   ██║╚██╗██║██║██╔═██╗ ██║   ██║   ██║     ██║     ║
║   ██║ ╚████║██║██║  ██╗╚██████╔╝   ╚██████╗███████╗║
║   ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═════╝╚══════╝║
║                                                   ║
║         Developer Ops Toolkit v0.1.0              ║
║              by DaciaSec                          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`));

console.log(chalk.green('✨ Thanks for installing @daciasec/niko-cli!\n'));
console.log(chalk.white('Get started:'));
console.log(chalk.gray('  1. Run ') + chalk.cyan('niko') + chalk.gray(' to complete setup'));
console.log(chalk.gray('  2. Or run ') + chalk.cyan('niko --help') + chalk.gray(' to see all commands'));
console.log(chalk.gray('  3. Run ') + chalk.cyan('niko doctor') + chalk.gray(' to check your system\n'));
