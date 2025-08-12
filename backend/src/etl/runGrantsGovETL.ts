import dotenv from 'dotenv';
import { fetchAndProcessAllOpportunities } from './grantsGovIngestion';
import { processAndLoadGrants, getProcessingStats } from '../scripts/processAndLoadGrants';
import { EtlOptions, EtlResult } from '../types/etlTypes';

// Load environment variables
dotenv.config();

// ----------------------------------------------------------
// -------------------- CONFIGURATION -----------------------
// ----------------------------------------------------------

// --- SEARCH STRATEGY (using short codes) ---
const ETL_CONFIG = {
    priorityAgencies: [
        'NSF', 'NIH', 'DOE', 'NASA', 'NIST', 'EPA', 'DOD', 'USDA'
    ],
    priorityCFDACodes: [
        '47.041', // Engineering Grants (NSF)
        '47.049', // Mathematical and Physical Sciences (NSF)
        '93.837', // Cardiovascular Diseases Research (NIH)
        '93.213', // Research and Training in Complementary and Integrative Health
        '81.087', // Renewable Energy Research and Development (DOE)
        '15.931', // Cooperative Research Units (DOI)
        '66.508', // Water Pollution Control Research (EPA)
        '43.001'  // Aeronautics and Space Research and Technology (NASA)
    ],
    high_value_keywords: [
        // Core R&D
        'research', 'innovation', 'development', 'technology', 'engineering', 'prototype', 'design',
    
        // Science & Academic
        'science', 'STEM', 'mathematics', 'physics', 'chemistry', 'biology', 'astronomy',
    
        // Health & Medical
        'health', 'public health', 'medicine', 'biomedical', 'epidemiology', 'mental health', 'healthcare',
    
        // Environment & Energy
        'environment', 'climate', 'sustainability', 'renewable energy', 'conservation', 'biodiversity',
    
        // Education & Workforce
        'education', 'training', 'workforce development', 'teacher', 'curriculum',
    
        // Social Impact & Policy
        'community', 'nonprofit', 'arts', 'culture', 'human rights', 'justice', 'equity',
    
        // Emerging Tech
        'artificial intelligence', 'machine learning', 'data science', 'cybersecurity', 'robotics'
    ]
}


// ----------------------------------------------------------
// -------------------- MAIN ETL PIPELINE -------------------
// ----------------------------------------------------------

async function runFullEtlPipeline(options: EtlOptions = {}): Promise<void> {
    const startTime = Date.now();
    
    console.log('🚀 Starting Grant ETL Pipeline...');
    console.log(`⏰ Start time: ${new Date().toISOString()}\n`);
    
    try {
        // Step 1: Cast a wide net using oppStatus as posted
        console.log('📡 Step 1: Fetching, processing, and filtering all relevant grants...');

        
        const grantsData: EtlResult = await fetchAndProcessAllOpportunities({
            agencies: options.agencies || ETL_CONFIG.priorityAgencies,
            searchTerms: options.searchTerms || ETL_CONFIG.high_value_keywords,
            cfdaCodes: options.cfdaCodes || ETL_CONFIG.priorityCFDACodes,
            rows: options.rows || 250,
        });
        
        if (grantsData.detailResponses.length === 0) {
            console.log('⚠️  No grants found. Exiting pipeline.');
            return;
        }
        
        console.log(`✅ Step 1 Complete: Fetched and filtered down to ${grantsData.detailResponses.length} grants\n`);
        
        // Step 2: Process and load data (unless dry run)
        if (options.dryRun) {
            console.log('🔍 DRY RUN: Skipping database operations');
            console.log(`   Would process ${grantsData.detailResponses.length} grants`);
        } else {
            console.log('💾 Step 2: Processing and loading grants into database...');
            await processAndLoadGrants(grantsData);
            console.log('✅ Step 2 Complete: All grants processed and loaded\n');
        }
        
        // Step 3: Display final stats /
        console.log('📊 Step 3: Displaying pipeline results...');
        if (!options.dryRun) {
            await getProcessingStats();
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\n🎉 ETL Pipeline Complete!');
        console.log(`⏱️  Total runtime: ${duration} seconds`);
        console.log(`📈 Processed: ${grantsData.detailResponses.length} grants`);

        
        
    } catch (error) {
        console.error('\n❌ ETL Pipeline Failed:', error);
        process.exit(1);
    }
}

// Command line parsing
function parseArgs(): EtlOptions {
    const args = process.argv.slice(2);
    const options: EtlOptions = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--funding-categories':
                const categories = args[++i];
                options.fundingCategories = categories ? categories.split(',').map(c => c.trim()) : undefined;
                break;
            case '--agencies':
                const agencies = args[++i];
                options.agencies = agencies ? agencies.split(',').map(a => a.trim()) : undefined;
                break;
            case '--rows':
                options.rows = parseInt(args[++i]) || 250; // Use a large default
                break;
            case '--search-terms': // Still useful for client-side filtering
                const terms = args[++i];
                options.searchTerms = terms ? terms.split(',').map(t => t.trim()) : undefined;
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
    --funding-categories "cat1,cat2" Filter by funding categories (comma-separated)
    --agencies "agency1,agency2"     Filter by specific agencies (comma-separated)
    --rows N                        Number of results per API call (default: 250)
    --search-terms "term1,term2"    Client-side keywords for filtering (comma-separated)
    --skip-embeddings               Skip embedding generation (faster for testing)
    --dry-run                       Fetch data but don't save to database
    --help                          Show this help message

Examples:
    ts-node run-etl.ts --funding-categories "Science" --agencies "NSF,NIH"
    ts-node run-etl.ts --rows 500 --search-terms "AI,robotics"
    ts-node run-etl.ts --dry-run
`);
}

// Quick test function for development
async function runQuickTest(): Promise<void> {
    console.log('🧪 Running Quick Test Mode...');
    
    // --- SOPHISTICATED SEARCH PARAMETERS (using short codes) ---
    const testFundingCategories = [
        'ST',   // Science and Technology and other Research and Development
        'ED',   // Education
        'HL'    // Health
    ];
    
    const testAgencies = [
        'NSF',  // U.S. National Science Foundation
        'NIH',  // National Institutes of Health
        'DOD'   // Department of Defense
    ];

    // High-value keywords for client-side filtering
    const highValueKeywords = [
        'artificial intelligence', 'machine learning', 'robotics', 'research', 'innovation'
    ];

    await runFullEtlPipeline({
        searchTerms: highValueKeywords,
        rows: 50,
        skipEmbeddings: true,
        dryRun: true,
        fundingCategories: testFundingCategories,
        agencies: testAgencies
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