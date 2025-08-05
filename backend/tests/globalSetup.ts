import { spawnSync } from 'child_process';
import path from 'path';

export default async () => {
    console.log('\nSetting up test database...');

    const backendDir = path.resolve(__dirname, '..');
    const scriptsDir = path.join(backendDir, 'src','scripts');
    const dbDir = path.join(backendDir, 'src', 'db');
    const seedsDir = path.join(backendDir, 'seeds'); 

    // Run the setup script to create tables
    console.log('Running database setup...');
    const setupResult = spawnSync('npx', ['ts-node', path.join(dbDir, 'setup.ts')], {
        stdio: 'inherit',
        cwd: backendDir,
    });
    if (setupResult.status !== 0) {
        throw new Error('Database setup failed.');
    }

    // Run the seeding script to populate initial data
    console.log('Seeding test data...');
    const seedResult = spawnSync('npx', ['ts-node', path.join(seedsDir, 'seed.ts')], {
        stdio: 'inherit',
        cwd: backendDir,
    });
    if (seedResult.status !== 0) {
        throw new Error('Database seeding failed.');
    }

    // Run the embeddings script to process data
    console.log('Generating embeddings...');
    const embeddingsResult = spawnSync('npx', ['ts-node', path.join(scriptsDir, 'processGrantEmbeddings.ts')], {
        stdio: 'inherit',
        cwd: backendDir,
    });
    if (embeddingsResult.status !== 0) {
        throw new Error('Embedding generation failed.');
    }

    console.log('Test database setup complete.');
};