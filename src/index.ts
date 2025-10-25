#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('celo-composer')
  .description('CLI tool for generating customizable Celo blockchain starter kits')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new Celo project')
  .argument('[project-name]', 'Name of the project')
  .option('-d, --description <description>', 'Project description')
  .option('-t, --template <type>', 'Template type (basic, farcaster-miniapp, minipay, ai-chat)')
  .option('--wallet-provider <provider>', 'Wallet provider (rainbowkit, thirdweb, none)')
  .option('-c, --contracts <framework>', 'Smart contract framework (hardhat, foundry, none)')
  .option('--skip-install', 'Skip package installation')
  .option('-y, --yes', 'Skip all prompts and use defaults')
  .action(createCommand);

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
