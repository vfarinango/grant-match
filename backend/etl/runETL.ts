import dotenv from 'dotenv';
import { runGrantsGovEtl } from './grantsGovIngestion';
import { processAndLoadGrants, getProcessingStats } from '../src/scripts/processAndLoadGrants';

// Load environment variables
dotenv.config();

interface EtlOptions {
    searchTerms?: string[];
    maxResults?: number;
    skipEmbeddings?: boolean;
    dryRun?: boolean;
}

async function runFullEtlPipeline(options: EtlOptions = {}): Promise<void> {
    const startTime = Date.now();
    
    console.log('🚀 Starting Grant ETL Pipeline...');
    console.log(`⏰ Start time: ${new Date().toISOString()}\n`);
    
    try {
        // Step 1: Fetch data from Grants.gov
        console.log('📡 Step 1: Fetching grants from Grants.gov API...');
        // Use broad search terms to cast a wide net for diverse grants
        // Semantic search will handle specific matching based on user queries
        const searchTerms = options.searchTerms || [
            'research',
            'innovation', 
            'development',
            'technology',
            'science',
            'education',
            'health',
            'environment'
        ];
        
        const grantsData = await runGrantsGovEtl({
            searchTerms,
            maxResultsPerTerm: options.maxResults || 25
        });
        
        if (grantsData.detailResponses.length === 0) {
            console.log('⚠️  No grants found. Exiting pipeline.');
            return;
        }
        
        console.log(`✅ Step 1 Complete: Fetched ${grantsData.detailResponses.length} grants\n`);
        
        // Step 2: Process and load data (unless dry run)
        if (options.dryRun) {
            console.log('🔍 DRY RUN: Skipping database operations');
            console.log(`   Would process ${grantsData.detailResponses.length} grants`);
        } else {
            console.log('💾 Step 2: Processing and loading grants into database...');
            await processAndLoadGrants(grantsData.detailResponses, grantsData.opportunityData);
            console.log('✅ Step 2 Complete: All grants processed and loaded\n');
        }
        
        // Step 3: Display final stats
        console.log('📊 Step 3: Displaying pipeline results...');
        if (!options.dryRun) {
            await getProcessingStats();
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\n🎉 ETL Pipeline Complete!');
        console.log(`⏱️  Total runtime: ${duration} seconds`);
        console.log(`📈 Processed: ${options.dryRun ? grantsData.detailResponses.length : grantsData.detailResponses.length} grants`);
        
    } catch (error) {
        console.error('\n❌ ETL Pipeline Failed:', error);
        process.exit(1);
    }
}

// Command line argument parsing
function parseArgs(): EtlOptions {
    const args = process.argv.slice(2);
    const options: EtlOptions = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--search-terms':
                const terms = args[++i];
                options.searchTerms = terms ? terms.split(',').map(t => t.trim()) : undefined;
                break;
            case '--max-results':
                options.maxResults = parseInt(args[++i]) || 25;
                break;
            case '--skip-embeddings':
                options.skipEmbeddings = true;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--help':
                showHelp();
                process.exit(0);
            default:
                if (arg.startsWith('--')) {
                    console.error(`Unknown option: ${arg}`);
                    showHelp();
                    process.exit(1);
                }
        }
    }
    
    return options;
}

function showHelp(): void {
    console.log(`
Grant ETL Pipeline

Usage: ts-node run-etl.ts [options]

Options:
  --search-terms "term1,term2"  Custom search terms (comma-separated)
  --max-results N              Max results per search term (default: 25)
  --skip-embeddings           Skip embedding generation (faster for testing)
  --dry-run                   Fetch data but don't save to database
  --help                      Show this help message

Examples:
  ts-node run-etl.ts
  ts-node run-etl.ts --search-terms "AI,robotics" --max-results 10
  ts-node run-etl.ts --dry-run
  ts-node run-etl.ts --max-results 50
`);
}

// Quick test function for development
async function runQuickTest(): Promise<void> {
    console.log('🧪 Running Quick Test Mode...');
    
    await runFullEtlPipeline({
        searchTerms: ['artificial intelligence'],
        maxResults: 5,
        dryRun: false
    });
}

// Main execution
async function main(): Promise<void> {
    // Check required environment variables
    const requiredEnvVars = [
        'OPENAI_API_KEY',
        'DATABASE_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
        console.error('\nPlease check your .env file');
        process.exit(1);
    }
    
    // Check for quick test mode
    if (process.argv.includes('--quick-test')) {
        await runQuickTest();
        return;
    }
    
    // Parse command line arguments and run
    const options = parseArgs();
    await runFullEtlPipeline(options);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Run the pipeline
if (require.main === module) {
    main().catch((error) => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}