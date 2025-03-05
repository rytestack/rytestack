#!/usr/bin/env node
/**
 * @fileoverview CLI for creating new Rytestack projects
 *
 * This is the entry point for the create-rytestack CLI, which
 * bootstraps new Rytestack projects with a set of templates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import prompts from 'prompts';
import { red, green, bold, cyan } from 'kolorist';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  console.log();
  console.log(`${bold(green('Rytestack Project Setup'))} 🚀`);
  console.log();

  const argv = minimist(process.argv.slice(2));
  const cwd = process.cwd();

  // Project name
  let targetDir = argv._[0];
  
  const defaultProjectName = targetDir || 'rytestack-project';
  
  try {
    const result = await prompts([
      {
        type: targetDir ? null : 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: defaultProjectName,
        onState: (state) => {
          targetDir = state.value || defaultProjectName;
        },
      },
      {
        type: () => {
          if (!fs.existsSync(path.join(cwd, targetDir)) || fs.readdirSync(path.join(cwd, targetDir)).length === 0) {
            return null;
          }
          return 'confirm';
        },
        name: 'overwrite',
        message: () => {
          return `${targetDir} already exists. Overwrite?`;
        },
      },
      {
        type: (_, { overwrite }) => {
          if (overwrite === false) {
            throw new Error(`${red('✖')} Operation cancelled`);
          }
          return null;
        },
        name: 'overwriteChecker',
      },
    ]);

    if (!result.projectName && !targetDir) {
      throw new Error(`${red('✖')} Project name is required`);
    }

    // TODO: Implement project template selection and scaffolding

    const root = path.join(cwd, targetDir);
    
    // Ensure target directory exists
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true });
    }
    
    // For now, just create a basic package.json
    const pkg = {
      name: targetDir,
      version: '0.1.0',
      private: true,
      description: "A Rytestack project",
      scripts: {
        dev: "echo \"TODO: Implement dev script\"",
        build: "echo \"TODO: Implement build script\"",
      }
    };
    
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );

    // Create a README.md
    fs.writeFileSync(
      path.join(root, 'README.md'),
      `# ${targetDir}\n\nA project created with Rytestack.\n`
    );

    console.log();
    console.log(green('✔ Project setup complete!'));
    console.log();
    console.log('Next steps:');
    console.log(`  cd ${cyan(targetDir)}`);
    console.log(`  npm install (or yarn, pnpm)`);
    console.log(`  npm run dev`);
    console.log();

  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(red('✖ An unexpected error occurred'));
    }
    process.exit(1);
  }
}

init().catch((e) => {
  console.error(e);
  process.exit(1);
});