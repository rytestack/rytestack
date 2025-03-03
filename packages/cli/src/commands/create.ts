/**
 * @fileoverview Create command
 *
 * Handles the creation of new Rytestack projects.
 */
import path from 'path';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { SupportedFrameworks, Framework } from '@rytestack/core';
import { ensureDir, fileExists, writeJson } from '@rytestack/core';

interface CreateOptions {
    framework?: Framework;
    ssr?: boolean;
    pwa?: boolean;
    i18n?: boolean;
}

/**
 * Creates a new Rytestack project
 *
 * @param name Project name
 * @param options Command options
 */
export async function create(name: string, options: CreateOptions): Promise<void> {
    console.log(chalk.cyan(`Creating a new Rytestack project: ${name}`));

    // Validate project name
    if (!/^[a-z0-9-]+$/.test(name)) {
        console.error(chalk.red('Error: Project name must contain only lowercase letters, numbers, and dashes.'));
        process.exit(1);
    }

    // Validate destination directory
    const projectDir = path.resolve(process.cwd(), name);
    const exists = await fileExists(projectDir);

    if (exists) {
        console.error(chalk.red(`Error: Directory ${projectDir} already exists.`));
        process.exit(1);
    }

    // Get framework if not provided
    let framework = options.framework;

    if (!framework) {
        const result = await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Select a frontend framework:',
                choices: SupportedFrameworks
            }
        ]);
        framework = result.framework as Framework;
    }

    // Create project directory
    const spinner = ora('Creating project structure...').start();

    try {
        await ensureDir(projectDir);

        // Create package.json
        await writeJson(path.join(projectDir, 'package.json'), {
            name,
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'rytestack dev',
                build: 'rytestack build',
                start: 'node dist/server.js'
            },
            dependencies: {
                [`@rytestack/${framework}`]: 'latest',
                '@rytestack/core': 'latest'
            },
            devDependencies: {
                '@rytestack/cli': 'latest',
                'typescript': '^5.2.2'
            }
        });

        // Create rytestack.config.js
        const configContent = `/**
 * @fileoverview Rytestack configuration
 * 
 * This file contains the configuration for your Rytestack application.
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
    enabled: ${options.ssr !== false},
    streaming: true
  },
  pwa: {
    enabled: ${options.pwa === true},
    manifest: {
      name: '${name}',
      short_name: '${name}',
      description: 'A Rytestack application',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/'
    }
  },
  i18n: {
    enabled: ${options.i18n === true},
    defaultLocale: 'en',
    locales: ['en'],
    autoDetect: true
  }
};
`;

        await fs.writeFile(path.join(projectDir, 'rytestack.config.js'), configContent, 'utf-8');

        // Create src directory structure
        await ensureDir(path.join(projectDir, 'src'));
        await ensureDir(path.join(projectDir, 'src', 'pages'));
        await ensureDir(path.join(projectDir, 'src', 'api'));
        await ensureDir(path.join(projectDir, 'src', 'components'));
        await ensureDir(path.join(projectDir, 'src', 'layouts'));
        await ensureDir(path.join(projectDir, 'public'));

        // Create sample files based on framework
        await createSampleFiles(projectDir, framework);

        spinner.succeed('Project structure created.');

        // Print next steps
        console.log();
        console.log(chalk.green('✨ Project created successfully!'));
        console.log();
        console.log('Next steps:');
        console.log();
        console.log(`  cd ${name}`);
        console.log('  npm install');
        console.log('  npm run dev');
        console.log();

    } catch (error) {
        spinner.fail('Failed to create project.');
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}

/**
 * Creates sample files for the selected framework
 *
 * @param projectDir Project directory
 * @param framework Selected framework
 */
async function createSampleFiles(projectDir: string, framework: Framework): Promise<void> {
    // Common TypeScript configuration
    const tsConfig = {
        compilerOptions: {
            target: 'es2020',
            module: 'esnext',
            moduleResolution: 'node',
            jsx: 'preserve',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            isolatedModules: true,
            baseUrl: '.',
            paths: {
                '@/*': ['./src/*']
            }
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
    };

    await writeJson(path.join(projectDir, 'tsconfig.json'), tsConfig);

    // Create sample .gitignore
    const gitignore = `# dependencies
node_modules/

# build output
dist/
.turbo/

# environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db
`;

    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore, 'utf-8');

    // Create sample README.md
    const readme = `# ${path.basename(projectDir)}

This project was created with [Rytestack](https://github.com/rytestack/rytestack).

## Getting Started

First, run the development server:

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

    await fs.writeFile(path.join(projectDir, 'README.md'), readme, 'utf-8');

    // Framework-specific files
    if (framework === 'react') {
        await createReactSampleFiles(projectDir);
    } else if (framework === 'vue') {
        await createVueSampleFiles(projectDir);
    } else if (framework === 'svelte') {
        await createSvelteSampleFiles(projectDir);
    }
}

/**
 * Creates sample files for React projects
 *
 * @param projectDir Project directory
 */
async function createReactSampleFiles(projectDir: string): Promise<void> {
    // Create sample index page
    const indexPage = `/**
 * @fileoverview Home page component
 * 
 * This is the main landing page for your Rytestack application.
 */
import React from 'react';
import { Meta } from '@rytestack/react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Meta
        title="Welcome to Rytestack"
        description="A modern multi-framework web application toolkit"
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

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6">
          
            href="https://rytestack.dev/docs"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Documentation &rarr;</h3>
            <p className="mt-4 text-xl">
              Find in-depth information about Rytestack features and API.
            </p>
          </a>

          
            href="https://github.com/rytestack/rytestack"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">GitHub &rarr;</h3>
            <p className="mt-4 text-xl">
              Check out the Rytestack source code and contribute.
            </p>
          </a>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        
          className="flex items-center justify-center"
          href="https://rytestack.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Rytestack
        </a>
      </footer>
    </div>
  );
}
`;

    await fs.writeFile(path.join(projectDir, 'src', 'pages', 'index.tsx'), indexPage, 'utf-8');

    // Create sample API route
    const helloApi = `/**
 * @fileoverview Hello API route
 * 
 * This is a sample API route that returns a greeting message.
 */
import { RyteApiHandler } from '@rytestack/react';

/**
 * GET handler for the hello API
 */
export const get: RyteApiHandler = async (req, res) => {
  res.json({
    message: 'Hello from Rytestack API!'
  });
};
`;

    await fs.writeFile(path.join(projectDir, 'src', 'api', 'hello.ts'), helloApi, 'utf-8');

    // Create default layout
    const defaultLayout = `/**
 * @fileoverview Default layout component
 * 
 * This layout is used for pages that don't specify a custom layout.
 */
import React from 'react';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
`;

    await fs.writeFile(path.join(projectDir, 'src', 'layouts', 'default.tsx'), defaultLayout, 'utf-8');
}

/**
 * Creates sample files for Vue projects
 *
 * @param projectDir Project directory
 */
async function createVueSampleFiles(projectDir: string): Promise<void> {
    // We'll implement this later as we're focusing on React first
    await fs.writeFile(
        path.join(projectDir, 'src', 'pages', 'index.vue'),
        `<!-- Vue sample implementation will come later -->`,
        'utf-8'
    );
}

/**
 * Creates sample files for Svelte projects
 *
 * @param projectDir Project directory
 */
async function createSvelteSampleFiles(projectDir: string): Promise<void> {
    // We'll implement this later as we're focusing on React first
    await fs.writeFile(
        path.join(projectDir, 'src', 'pages', 'index.svelte'),
        `<!-- Svelte sample implementation will come later -->`,
        'utf-8'
    );
}