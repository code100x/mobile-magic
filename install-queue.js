const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Executes npm install in a given directory.
 * @param {string} path - The path to the workspace/package.
 */
async function runNpmInstall(path) {
    try {
        console.log(`Running npm install in ${path}`);
        const { stdout, stderr } = await execPromise('bun install', { cwd: path });
        console.log(stdout);
        if (stderr) {
            console.error(stderr);
        }
    } catch (error) {
        console.error(`Error in ${path}: ${error.message}`);
    }
}

/**
 * Runs npm install sequentially for an array of paths.
 * @param {string[]} paths - An array of directory paths.
 */
async function runSequentially(paths) {
    for (const path of paths) {
        await runNpmInstall(path);
    }
}

// List of workspace package directories within the turborepo
const workspacePaths = [
    'packages/common',
    'packages/db',
    'packages/redis',
    'packages/eslint-config',
    'packages/typescript-config',
    'apps/code-server',
    'apps/frontend',
    'apps/primary-backend',
    'apps/worker',
];

runSequentially(workspacePaths)
    .then(() => console.log('All installs completed successfully!'))
    .catch((err) => console.error('An error occurred:', err));
