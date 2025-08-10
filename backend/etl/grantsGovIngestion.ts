import axios from 'axios';
import dotenv from 'dotenv';
import { Grant } from '../src/types/grantMatchTypes'; // Grant interface
import { GrantsGovOpportunity, GrantsGovResponse, GrantsGovDetailsResponse } from '../src/types/grantsGovApiTypes';
import { EtlOptions, EtlResult } from '../src/types/etlTypes';
dotenv.config();

// ----------------------------------------------------------
// -------------------- EXTRACT -----------------------------
// ----------------------------------------------------------

const GRANTS_GOV_API_URL = 'https://api.grants.gov/v1/api/search2';

/** 
 * Function: Fetches grant opportunities from the Grants.gov search2 API based on a keyword.
    * @param keyword The keyword to search for in the grant opportunities.
    * Returns a Promise that resolves to the API response data.
 */
export async function fetchGrantsFromGrantsGov(keyword: string): Promise<GrantsGovResponse> {
    console.log(`Fetching grants from Grants.gov for keyword: "${keyword}"`);

    try {
        const response = await axios.post<GrantsGovResponse>(
            GRANTS_GOV_API_URL,
            { keyword: keyword },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        
        console.log('Successfully fetched grants from Grants.gov');
        return response.data;
    } catch (error) {
        console.error('Error fetching from Grants.gov API:', error);
        throw error;
    }
}

/**
 * Fetches detailed grant information from the Grants.gov fetchOpportunity API.
 * @param opportunityId The ID of the grant to fetch.
 * @returns A Promise that resolves to the detailed API response data.
 */
export async function fetchGrantDetailsFromGrantsGov(opportunityId: string): Promise<GrantsGovDetailsResponse> {
    console.log(`Fetching details for grant ID: "${opportunityId}"`);

    try {
        const response = await axios.post<GrantsGovDetailsResponse>(
            'https://api.grants.gov/v1/api/fetchOpportunity',
            { opportunityId: opportunityId },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        
        console.log(`Successfully fetched details for grant ID: "${opportunityId}"`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for grant ID ${opportunityId}:`, error);
        throw error;
    }
}

// ----------------------------------------------------------
// -------------------- TRANSFORM ---------------------------
// ----------------------------------------------------------

/**
 * Transforms a raw grant object from the Grants.gov API into the local Grant interface.
 * The raw grant object from the API response.
 * Returns a new object conforming to the Grant interface.
 */
export function transformGrantsGovGrant(rawGrant: GrantsGovOpportunity, detailedData: GrantsGovDetailsResponse): Grant {
    const { synopsis } = detailedData.data;

    // Cleanly format funding amount based on available values
    let fundingAmount: string | undefined;
    if (synopsis.awardFloor && synopsis.awardCeiling) {
        fundingAmount = `${synopsis.awardFloor} - ${synopsis.awardCeiling}`;
    } else if (synopsis.awardFloor) {
        fundingAmount = `${synopsis.awardFloor}`;
    } else if (synopsis.awardCeiling) {
        fundingAmount = `${synopsis.awardCeiling}`;
    }

    return {
        id: parseInt(rawGrant.id, 10),
        title: rawGrant.title,
        description: synopsis.synopsisDesc,
        deadline: rawGrant.closeDate ? new Date(rawGrant.closeDate) : undefined,
        funding_amount: fundingAmount, 
        source: rawGrant.agency,
        source_url: synopsis.fundingDescLinkUrl,
        focus_areas: rawGrant.cfdaList || [],
        posted_date: rawGrant.openDate ? new Date(rawGrant.openDate) : undefined,
        summary: undefined,
    };
}


// ----------------------------------------------------------
// ------------------------- LOAD ---------------------------
// ----------------------------------------------------------

/**
 * Main ETL function that orchestrates fetching and processing grants from Grants.gov
 * @param options Configuration for the ETL process
 * @returns Promise containing detailed responses and opportunity data
 */
export async function runGrantsGovEtl(options: EtlOptions): Promise<EtlResult> {
    const { searchTerms, maxResultsPerTerm = 25 } = options;
    
    console.log(`🚀 Starting Grants.gov ETL with terms: [${searchTerms.join(', ')}]`);
    
    try {
        // Step 1: Fetch search results for all terms
        console.log('📡 Step 1: Fetching search results...');
        const allOpportunities = await fetchSearchResults(searchTerms, maxResultsPerTerm);
        
        if (allOpportunities.length === 0) {
            console.log('⚠️  No opportunities found for any search terms');
            return { detailResponses: [], opportunityData: [] };
        }
        
        console.log(`✅ Found ${allOpportunities.length} total opportunities`);
        
        // Step 2: Fetch detailed information (parallel processing)
        console.log('🔍 Step 2: Fetching detailed grant information...');
        const detailResponses = await fetchDetailedInformation(allOpportunities);
        
        console.log(`✅ Successfully fetched details for ${detailResponses.length} grants`);
        
        return {
            detailResponses,
            opportunityData: allOpportunities
        };
        
    } catch (error) {
        console.error('❌ Error in Grants.gov ETL process:', error);
        throw error;
    }
}

/**
 * Fetches search results for multiple search terms
 */
async function fetchSearchResults(searchTerms: string[], maxResultsPerTerm: number): Promise<GrantsGovOpportunity[]> {
    const allOpportunities: GrantsGovOpportunity[] = [];
    const seenIds = new Set<string>();
    
    for (const term of searchTerms) {
        try {
            console.log(`  🔎 Searching for: "${term}"`);
            
            const response = await fetchGrantsFromGrantsGov(term);
            
            if (response.errorcode !== 0) {
                console.error(`    ❌ API error for term "${term}": ${response.msg}`);
                continue;
            }
            
            const opportunities = response.data?.oppHits || [];
            let addedCount = 0;
            
            // Add unique opportunities (deduplicate by ID)
            for (const opp of opportunities) {
                if (!seenIds.has(opp.id) && addedCount < maxResultsPerTerm) {
                    seenIds.add(opp.id);
                    allOpportunities.push(opp);
                    addedCount++;
                }
            }
            
            console.log(`    ✓ Added ${addedCount} new opportunities for "${term}"`);
            
        } catch (error) {
            console.error(`    ❌ Error searching for term "${term}":`, error);
            // Continue with other terms
        }
    }
    
    return allOpportunities;
}

/**
 * Fetches detailed information for all opportunities using parallel processing
 */
async function fetchDetailedInformation(opportunities: GrantsGovOpportunity[]): Promise<GrantsGovDetailsResponse[]> {
    const detailPromises = opportunities.map(async (opp, index) => {
        try {
            // Add small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, index * 50));
            
            const details = await fetchGrantDetailsFromGrantsGov(opp.id);
            
            if (details.errorcode !== 0) {
                console.error(`    ❌ Failed to fetch details for ${opp.id}: ${details.msg}`);
                return null;
            }
            
            return details;
            
        } catch (error) {
            console.error(`    ❌ Error fetching details for ${opp.id}:`, error);
            return null;
        }
    });
    
    // Wait for all detail requests to complete
    const results = await Promise.all(detailPromises);
    
    // Filter out failed requests
    const successfulResults = results.filter((result): result is GrantsGovDetailsResponse => result !== null);
    
    console.log(`  ✅ Successfully fetched ${successfulResults.length}/${opportunities.length} detailed responses`);
    
    return successfulResults;
}