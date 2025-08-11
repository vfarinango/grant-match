import axios from 'axios';
import dotenv from 'dotenv';
import { GrantsGovResponse, GrantsGovSearchParams } from '../src/types/grantsGovApiTypes';

dotenv.config();

// --- CONFIGURATION ---
const GRANTS_GOV_API_URL = 'https://api.grants.gov/v1/api/search2';

// --- MAIN FUNCTION ---
async function fetchAndLogGrants(): Promise<void> {
    const opportunityNumber = '24-554';
    console.log(`🔍 Searching Grants.gov for Opportunity Number: "${opportunityNumber}"`);

    const searchParams: GrantsGovSearchParams = {
        oppNum: opportunityNumber,
        oppStatuses: 'posted',
        rows: 10,
    };

    try {
        const response = await axios.post<GrantsGovResponse>(
            GRANTS_GOV_API_URL,
            searchParams,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );
        
        if (response.data.errorcode !== 0) {
            console.error(`❌ API Error: ${response.data.msg}`);
            return;
        }

        const grants = response.data.data?.oppHits || [];

        console.log(`✅ Found ${grants.length} grants.`);
        
        if (grants.length > 0) {
            console.log("📝 Grants Found:");
            grants.forEach(grant => {
                console.log(`- ID: ${grant.id} | Title: ${grant.title}`);
            });
        } else {
            console.log("🤷 No grants found for this Opportunity Number.");
        }

    } catch (error) {
        console.error(`❌ Error fetching grants:`, error);
    }
}

// --- EXECUTION ---
// Test 1: Search for a specific opportunity number (most reliable test for existence)
fetchAndLogGrants();

// Test 2: Search for a broad keyword (to check if keyword search works at all)
// fetchAndLogGrants('research');

// Test 3: Search for your specific, problematic keyword
// fetchAndLogGrants('artificial intelligence');