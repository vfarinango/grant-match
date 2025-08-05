import { spawnSync } from 'child_process';
import path from 'path';

export default async () => {
    console.log('Cleaning up test database...');

    const backendDir = path.resolve(__dirname, '..');
    const dbDir = path.join(backendDir, 'src', 'db');

  // Run the setup script again, which will drop tables
    const teardownResult = spawnSync('npx', ['ts-node', path.join(dbDir, 'setup.ts')], {
    stdio: 'inherit',
    cwd: backendDir,
    });
    if (teardownResult.status !== 0) {
        throw new Error('Database teardown failed.');
    }

    console.log('Test database cleanup complete.');
};