#!/usr/bin/env node
/**
 * @fileoverview CLI for creating new Rytestack projects
 *
 * This is the entry point for the create-rytestack CLI, which
 * bootstraps new Rytestack projects with a set of templates.
 */
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the program
program
    .name('create-rytestack')
    .description('Create a new Rytestack project')
    .argument('[name]', 'Project name')
    .option('-f, --framework <framework>', 'Frontend framework (react, vue, svelte)', 'react')
    .option('--no-ssr', 'Disable server-side rendering')
    .option('--pwa', 'Enable Progressive Web App support')
    .option('--i18n', 'Enable internationalization')
    .option('--template <template>', 'Project template (default, blog, ecommerce, dashboard)', 'default')
    .action(async (name, options) => {
        console.log(chalk.cyan('🚀 Creating a new Rytestack project'));

        // Get project name if not provided
        let projectName = name;

        if (!projectName) {
            const answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'What is the name of your project?',
                    default: 'my-rytestack-app'
                }
            ]);

            projectName = answer.name;
        }

        // Validate project name
        if (!/^[a-z0-9-]+$/.test(projectName)) {
            console.error(chalk.red('Error: Project name must contain only lowercase letters, numbers, and dashes.'));
            process.exit(1);
        }

        // Get frontend framework if not provided
        let framework = options.framework;

        if (!['react', 'vue', 'svelte'].includes(framework)) {
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'framework',
                    message: 'Select a frontend framework:',
                    choices: [
                        { name: 'React', value: 'react' },
                        { name: 'Vue', value: 'vue' },
                        { name: 'Svelte', value: 'svelte' }
                    ],
                    default: 'react'
                }
            ]);

            framework = answer.framework;
        }

        // Get template if not provided
        let template = options.template;

        if (!['default', 'blog', 'ecommerce', 'dashboard'].includes(template)) {
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'template',
                    message: 'Select a project template:',
                    choices: [
                        { name: 'Default', value: 'default' },
                        { name: 'Blog', value: 'blog' },
                        { name: 'E-commerce', value: 'ecommerce' },
                        { name: 'Dashboard', value: 'dashboard' }
                    ],
                    default: 'default'
                }
            ]);

            template = answer.template;
        }

        // Get features if not provided
        const features = {
            ssr: options.ssr,
            pwa: options.pwa,
            i18n: options.i18n
        };

        if (!options.pwa && !options.i18n) {
            const answer = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'features',
                    message: 'Select additional features:',
                    choices: [
                        { name: 'Progressive Web App (PWA)', value: 'pwa', checked: false },
                        { name: 'Internationalization (i18n)', value: 'i18n', checked: false }
                    ]
                }
            ]);

            features.pwa = answer.features.includes('pwa');
            features.i18n = answer.features.includes('i18n');
        }

        // Create project
        const spinner = ora('Creating project...').start();

        try {
            // Create project directory
            const projectDir = path.resolve(process.cwd(), projectName);

            // Check if directory exists
            try {
                await fs.access(projectDir);
                spinner.fail(`Directory ${projectName} already exists.`);
                process.exit(1);
            } catch {
                // Directory doesn't exist, which is what we want
            }

            // Create directory
            await fs.mkdir(projectDir, { recursive: true });

            // Copy template files
            const templateDir = path.join(__dirname, '..', 'templates', template, framework);

            // TODO: In a real implementation, we would copy the template files
            // For now, we'll just create a simple structure

            // Create package.json
            const packageJson = {
                name: projectName,
                version: '0.1.0',
                private: true,
                scripts: {
                    dev: 'rytestack dev',
                    build: 'rytestack build',
                    start: 'node dist/server.js'
                },
                dependencies: {
                    [`@rytestack/${framework}`]: '^0.1.0',
                    '@rytestack/core': '^0.1.0'
                },
                devDependencies: {
                    '@rytestack/cli': '^0.1.0',
                    'typescript': '^5.2.2'
                }
            };

            // Add feature-specific dependencies
            if (features.pwa) {
                packageJson.dependencies['@rytestack/pwa'] = '^0.1.0';
            }

            if (features.i18n) {
                packageJson.dependencies['@rytestack/i18n'] = '^0.1.0';
            }

            // Write package.json
            await fs.writeFile(
                path.join(projectDir, 'package.json'),
                JSON.stringify(packageJson, null, 2)
            );

            // Create rytestack.config.js
            const configContent = `/**
 * @fileoverview Rytestack configuration
 */
module.exports = {
  framework: '${framework}',
  srcDir: './src',
  outDir: './dist',
  publicDir: './public',
  deployment: {
    target: 'cloudflare'
  },
  ssr: {
    enabled: ${features.ssr !== false},
    streaming: true
  },
  pwa: {
    enabled: ${features.pwa === true},
    manifest: {
      name: '${projectName}',
      short_name: '${projectName}',
      description: 'A Rytestack application',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/'
    }
  },
  i18n: {
    enabled: ${features.i18n === true},
    defaultLocale: 'en',
    locales: ['en'],
    autoDetect: true
  }
};
`;

            await fs.writeFile(
                path.join(projectDir, 'rytestack.config.js'),
                configContent
            );

            // Create basic directory structure
            await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
            await fs.mkdir(path.join(projectDir, 'src', 'pages'), { recursive: true });
            await fs.mkdir(path.join(projectDir, 'src', 'api'), { recursive: true });
            await fs.mkdir(path.join(projectDir, 'src', 'components'), { recursive: true });
            await fs.mkdir(path.join(projectDir, 'public'), { recursive: true });

            // Create a simple index page
            let indexPageContent = '';

            if (framework === 'react') {
                indexPageContent = `/**
 * @fileoverview Home page
 */
import React from 'react';
import { Meta } from '@rytestack/react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Meta
        title="Welcome to ${projectName}"
        description="A Rytestack application"
      />
      
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-blue-600">Rytestack</span>
        </h1>

        <p className="mt-3 text-2xl">
          Get started by editing{' '}
          <code className="p-2 font-mono text-lg bg-gray-100 rounded-md">
            src/pages/index.tsx
          </code>
        </p>
      </main>
    </div>
  );
}
`;
            } else if (framework === 'vue') {
                indexPageContent = `<!-- Home page -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2">
    <main class="flex flex-col items-center justify-center flex-1 px-20 text-center">
      <h1 class="text-6xl font-bold">
        Welcome to <span class="text-blue-600">Rytestack</span>
      </h1>

      <p class="mt-3 text-2xl">
        Get started by editing
        <code class="p-2 font-mono text-lg bg-gray-100 rounded-md">
          src/pages/index.vue
        </code>
      </p>
    </main>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Welcome to ${projectName}',
      meta: [
        { name: 'description', content: 'A Rytestack application' }
      ]
    }
  }
}
</script>
`;
            } else if (framework === 'svelte') {
                indexPageContent = `<!-- Home page -->
<script>
  import { Meta } from '@rytestack/svelte';
</script>

<Meta
  title="Welcome to ${projectName}"
  description="A Rytestack application"
/>

<div class="flex flex-col items-center justify-center min-h-screen py-2">
  <main class="flex flex-col items-center justify-center flex-1 px-20 text-center">
    <h1 class="text-6xl font-bold">
      Welcome to <span class="text-blue-600">Rytestack</span>
    </h1>

    <p class="mt-3 text-2xl">
      Get started by editing
      <code class="p-2 font-mono text-lg bg-gray-100 rounded-md">
        src/pages/index.svelte
      </code>
    </p>
  </main>
</div>
`;
            }

            // Write index page
            const extension = framework === 'react' ? '.tsx' : framework === 'vue' ? '.vue' : '.svelte';
            await fs.writeFile(
                path.join(projectDir, 'src', 'pages', `index${extension}`),
                indexPageContent
            );

            // Create a simple API route
            const apiRouteContent = `/**
 * @fileoverview Hello API route
 */
import { RyteApiHandler } from '@rytestack/${framework}';

export const get = (req, res) => {
  res.json({
    message: 'Hello from Rytestack!'
  });
};
`;

            await fs.writeFile(
                path.join(projectDir, 'src', 'api', 'hello.ts'),
                apiRouteContent
            );

            // Create README.md
            const readmeContent = `# ${projectName}

This project was created with [Rytestack](https://github.com/rytestack/rytestack).

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
# or
yarn
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Rytestack, take a look at the following resources:

- [Rytestack Documentation](https://rytestack.dev/docs) - learn about Rytestack features and API.
- [GitHub Repository](https://github.com/rytestack/rytestack) - your feedback and contributions are welcome!
`;

            await fs.writeFile(
                path.join(projectDir, 'README.md'),
                readmeContent
            );

            // Success message
            spinner.succeed(`Project created successfully at ${chalk.green(projectDir)}`);

            console.log();
            console.log('Next steps:');
            console.log();
            console.log(`  cd ${projectName}`);
            console.log('  npm install');
            console.log('  npm run dev');
            console.log();
            console.log(`Start building your ${framework} application!`);
            console.log();
            console.log('For more information, visit:');
            console.log(chalk.cyan('  https://rytestack.dev/docs'));
            console.log();

        } catch (error) {
            spinner.fail('Failed to create project');
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Parse command line arguments
program.parse();