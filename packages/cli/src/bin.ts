#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for Rytestack
 *
 * This file is the main entry point for the Rytestack CLI.
 * It sets up the command line interface and handles command execution.
 */
import { program } from 'commander';
import * as commands from './commands';
import packageJson from '../package.json';

// Setup CLI
program
    .name('rytestack')
    .description('Rytestack - Multi-framework web development toolkit')
    .version(packageJson.version);

// Create a new project
program
    .command('create')
    .description('Create a new Rytestack project')
    .argument('<name>', 'Project name')
    .option('-f, --framework <framework>', 'Frontend framework (react, vue, svelte)', 'react')
    .option('--no-ssr', 'Disable server-side rendering')
    .option('--pwa', 'Enable Progressive Web App support')
    .option('--i18n', 'Enable internationalization')
    .action(commands.create);

// Generate code
program
    .command('generate')
    .alias('g')
    .description('Generate code')
    .addCommand(
        program
            .command('page')
            .description('Generate a new page')
            .argument('<path>', 'Page path (e.g., "blog/[slug]")')
            .option('-l, --layout <layout>', 'Layout to use')
            .action(commands.generatePage)
    )
    .addCommand(
        program
            .command('api')
            .description('Generate a new API route')
            .argument('<path>', 'API route path (e.g., "users/[id]")')
            .option('-m, --methods <methods>', 'HTTP methods to handle (comma-separated)')
            .action(commands.generateApi)
    )
    .addCommand(
        program
            .command('component')
            .description('Generate a new component')
            .argument('<name>', 'Component name')
            .option('-d, --directory <directory>', 'Directory to create the component in')
            .action(commands.generateComponent)
    );

// Development server
program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to use', '3000')
    .option('-H, --host <host>', 'Host to use', 'localhost')
    .action(commands.dev);

// Build the project
program
    .command('build')
    .description('Build the project for production')
    .option('-t, --target <target>', 'Deployment target (cloudflare, vercel, netlify, node)')
    .action(commands.build);

// Deploy the project
program
    .command('deploy')
    .description('Deploy the project')
    .option('-t, --target <target>', 'Deployment target (cloudflare, vercel, netlify, node)')
    .action(commands.deploy);

// Parse command line arguments
program.parse();