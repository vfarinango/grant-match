import axios from 'axios';
import dotenv from 'dotenv';
import { Grant } from '../src/types/grantMatchTypes'; // Grant interface
import { GrantsGovOpportunity, GrantsGovResponse, GrantsGovDetailsResponse, GrantsGovSearchParams } from '../src/types/grantsGovApiTypes';
import { EtlOptions, EtlResult } from '../src/types/etlTypes';
dotenv.config();

// ----------------------------------------------------------
// -------------------- CONFIGURATION -----------------------
// ----------------------------------------------------------

const GRANTS_GOV_API_URL = 'https://api.grants.gov/v1/api/search2';

// Relevancy scoring configuration
const RELEVANCY_CONFIG = {
    // High-priority funding categories (using the 'value' short codes from the API)
    // We'll focus on R&D, Education, Health, Environment, and Information.
    priorityFundingCategories: [
        'ST',   // Science and Technology and other Research and Development
        'ED',   // Education
        'HL',   // Health
        'ENV',  // Environment
        'EN',   // Energy
        'IS'    // Information and Statistics
    ],

    // High-priority agencies for R&D and innovation grants (using the 'value' short codes)
    // We'll prioritize agencies known for tech and science funding.
    priorityAgencies: [
        'NSF',  // U.S. National Science Foundation
        'NIH',  // National Institutes of Health
        'DOE',  // Department of Energy
        'DOD',  // Department of Defense
        'NASA', // National Aeronautics and Space Administration
        'DOC',  // Department of Commerce (includes NIST)
        'EPA'   // Environmental Protection Agency
    ],

    // Keywords that indicate high relevance (for client-side filtering)
    highValueKeywords: [
        'research', 'innovation', 'development', 'technology', 'AI',
        'machine learning', 'data science', 'STEM', 'prototype'
    ]
};

// ----------------------------------------------------------
// -------------------- EXTRACT -----------------------------
// ----------------------------------------------------------

/** 
 * Function: Fetches grant opportunities from the Grants.gov search2 API based on a keyword.
    * @param keyword The keyword to search for in the grant opportunities.
    * Returns a Promise that resolves to the API response data.
 */
export async function fetchGrantsFromGrantsGov(params: { 
    rows: number,
} ): Promise<GrantsGovOpportunity[]> {
    console.log(`🔍 Starting a paginated fetch of all posted grants from Grants.gov...`);

    let allOpportunities: GrantsGovOpportunity[] = [];
    const seenIds = new Set<string>();
    let startRecordNum = 0;
    let keepFetching = true;

    while (keepFetching) {
        const searchParams: Partial<GrantsGovSearchParams> = {
            oppStatuses: 'posted',
            rows: params.rows,
            startRecordNum: startRecordNum,
        };

        try {
            const response = await axios.post<GrantsGovResponse>(GRANTS_GOV_API_URL, searchParams, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            if (response.data.errorcode !== 0) {
                console.error(`❌ API Error: ${response.data.msg}`);
                break; // Exit the loop on API error
            }

            const grants = response.data.data?.oppHits || [];

            if (grants.length > 0) {
                console.log(`✅ Fetched ${grants.length} grants, starting at record ${startRecordNum}`);
                grants.forEach(grant => {
                    if (!seenIds.has(grant.id)) {
                        allOpportunities.push(grant);
                        seenIds.add(grant.id);
                    }
                });
                startRecordNum += params.rows;
            } else {
                console.log(`🎉 No more grants found. Finished fetching.`);
                keepFetching = false;
            }

        } catch (error) {
            console.error(`❌ Error during paginated fetch:`, error);
            keepFetching = false; // Stop the loop on network or other errors
        }
    }

    console.log(`🎉 Total unique opportunities found: ${allOpportunities.length}`);
    return allOpportunities;
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
// -------------------- RELEVANCY SCORING ------------------
// ----------------------------------------------------------

/**
 * Calculate relevancy score for a grant opportunity
 */
function calculateRelevancyScore(
    opportunity: GrantsGovOpportunity, 
    searchKeyword: string,
    detailedData?: GrantsGovDetailsResponse
): number {
    let score = 0;
    const titleLower = opportunity.title.toLowerCase();
    const keywordLower = searchKeyword.toLowerCase();
    
    // Title relevance (highest weight)
    if (titleLower.includes(keywordLower)) {
        score += 10;
    }
    
    // High-value keyword matches in title
    RELEVANCY_CONFIG.highValueKeywords.forEach(hvKeyword => {
        if (titleLower.includes(hvKeyword.toLowerCase())) {
            score += 5;
        }
    });
    
    // Agency priority
    if (RELEVANCY_CONFIG.priorityAgencies.some(agency => 
        opportunity.agencyCode?.includes(agency) || 
        opportunity.agency?.includes(agency)
    )) {
        score += 3;
    }
    
    // Status bonus (posted is better than forecasted)
    if (opportunity.oppStatus === 'posted') {
        score += 2;
    } else if (opportunity.oppStatus === 'forecasted') {
        score += 1;
    }
    
    // Deadline consideration (grants closing soon get slight penalty)
    if (opportunity.closeDate) {
        const daysUntilClose = Math.ceil(
            (new Date(opportunity.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilClose > 30) {
            score += 1; // Plenty of time to apply
        } else if (daysUntilClose < 7) {
            score -= 2; // Very little time left
        }
    }
    
    // Detailed data scoring (if available)
    if (detailedData?.data?.synopsis) {
        const descriptionLower = detailedData.data.synopsis.synopsisDesc?.toLowerCase() || '';
        
        // Description keyword matches
        if (descriptionLower.includes(keywordLower)) {
            score += 3;
        }
        
        // High-value keyword matches in description
        RELEVANCY_CONFIG.highValueKeywords.forEach(hvKeyword => {
            if (descriptionLower.includes(hvKeyword.toLowerCase())) {
                score += 2;
            }
        });
        
        // Funding amount consideration (higher amounts often more competitive/relevant)
        const ceiling = detailedData.data.synopsis.awardCeiling;
        if (ceiling && !isNaN(parseFloat(ceiling.replace(/[,$]/g, '')))) {
            const amount = parseFloat(ceiling.replace(/[,$]/g, ''));
            if (amount >= 1000000) score += 2; // $1M+
            else if (amount >= 100000) score += 1; // $100K+
        }
    }
    
    return Math.max(0, score); // Ensure non-negative
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
    let fundingAmount: number | undefined;
    if (synopsis?.awardCeiling && synopsis.awardCeiling !== 'none') {
        const ceilingStr = synopsis.awardCeiling.replace(/[$,]/g, '');
        const parsedAmount = parseFloat(ceilingStr);
        if (!isNaN(parsedAmount)) {
            fundingAmount = parsedAmount;
        }
    } else if (synopsis?.awardFloor && synopsis.awardFloor !== 'none') {
        const floorStr = synopsis.awardFloor.replace(/[$,]/g, '');
        const parsedAmount = parseFloat(floorStr);
        if (!isNaN(parsedAmount)) {
            fundingAmount = parsedAmount;
        }
    }

    return {
        id: parseInt(rawGrant.id, 10),
        title: rawGrant.title,
        description: synopsis.synopsisDesc || '',
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
// -------------------- ETL ORCHESTRATION -------------------
// ----------------------------------------------------------

/**
 * Main ETL function that orchestrates fetching and processing grants from Grants.gov
 */

export async function fetchAndProcessAllOpportunities(options: EtlOptions): Promise<EtlResult> {
    const { searchTerms = [], rows = 250 } = options;

    console.log(`🚀 Starting grant ingestion and processing pipeline...`);
    console.log(`🎯 Targeting all 'posted' grants for client-side filtering`);

    try {
        // Step 1: Broad search using reliable categories and agencies.
        console.log('🔍 Step 1: Fetching all posted grants...');
        const allOpportunities = await fetchGrantsFromGrantsGov({ rows });

        if (allOpportunities.length === 0) {
            console.log('⚠️  No grants found from broad search. Exiting.');
            return { detailResponses: [], opportunityData: [] };
        }

        console.log(`✅ Found ${allOpportunities.length} opportunities from broad search.`);

        // Step 2: Fetch detailed information for all opportunities
        console.log('📋 Step 2: Fetching detailed information for all grants...');
        const detailResponses = await fetchDetailedInformation(allOpportunities);

        // Map detailed responses back to opportunities to prepare for filtering
        const opportunitiesWithDetails = allOpportunities.map(opp => {
            const details = detailResponses.find(dr => dr.data.id === parseInt(opp.id, 10));
            return { ...opp, details };
        });

        // Step 3: Perform client-side keyword filtering on the detailed grants
        console.log('🎯 Step 3: Filtering grants by high-value keywords...');
        const relevantOpportunities = opportunitiesWithDetails.filter(opp => {
            if (!opp.details || !searchTerms.length) return false;
            
            const titleLower = opp.title.toLowerCase();
            const synopsisLower = opp.details.data.synopsis.synopsisDesc?.toLowerCase() || '';

            return searchTerms.some(term => 
                titleLower.includes(term.toLowerCase()) || 
                synopsisLower.includes(term.toLowerCase())
            );
        });

        if (relevantOpportunities.length === 0) {
            console.log('⚠️ No grants matched the high-value keywords. Exiting.');
            return { detailResponses: [], opportunityData: [] };
        }

        console.log(`✅ Filtered down to ${relevantOpportunities.length} highly relevant grants.`);

        // Step 4: Relevancy scoring and final preparation
        console.log('🌟 Step 4: Scoring and preparing grants for loading...');
        const scoredOpportunities = await scoreAndFilterOpportunities(relevantOpportunities, searchTerms);
        
        console.log(`✅ Pipeline complete: ${scoredOpportunities.length} high-quality grants processed.`);
        
        // Re-extract detail responses for the final, scored grants
        const finalDetailResponses = relevantOpportunities
            .filter(opp => scoredOpportunities.some(so => so.id === opp.id))
            .map(opp => opp.details)
            .filter((details): details is GrantsGovDetailsResponse => details !== undefined);

        return {
            detailResponses: finalDetailResponses,
            opportunityData: scoredOpportunities
        };

    } catch (error) {
        console.error('❌ Grant processing pipeline failed:', error);
        throw error;
    }
}

/**
 * Score opportunities and return top candidates
 */
async function scoreAndFilterOpportunities(
    opportunities: GrantsGovOpportunity[],
    searchTerms: string[]
): Promise<GrantsGovOpportunity[]> {
    
    const scoredOpportunities = opportunities.map(opp => {
        // Calculate score based on all search terms
        const scores = searchTerms.map(term => calculateRelevancyScore(opp, term));
        const maxScore = Math.max(...scores);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
            opportunity: opp,
            maxScore,
            avgScore,
            combinedScore: maxScore * 0.7 + avgScore * 0.3 // Weight max score higher
        };
    });
    
    // Sort by combined score and take top candidates
    const topOpportunities = scoredOpportunities
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, Math.min(100, opportunities.length)) // Limit to top 100
        .map(scored => scored.opportunity);
    
    console.log(`    🎯 Filtered to top ${topOpportunities.length} most relevant opportunities`);
    
    return topOpportunities;
}

/**
 * Enhanced detailed information fetching with better error handling
 */
async function fetchDetailedInformation(opportunities: GrantsGovOpportunity[]): Promise<GrantsGovDetailsResponse[]> {
    console.log(`    📋 Fetching details for ${opportunities.length} opportunities...`);
    
    const batchSize = 5; // Process in smaller batches to avoid overwhelming API
    const results: GrantsGovDetailsResponse[] = [];
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (opp, batchIndex) => {
            try {
                // Stagger requests within batch
                await new Promise(resolve => setTimeout(resolve, batchIndex * 100));
                
                const details = await fetchGrantDetailsFromGrantsGov(opp.id);
                
                if (details.errorcode !== 0) {
                    console.warn(`    ⚠️  API warning for ${opp.id}: ${details.msg}`);
                    return null;
                }
                
                return details;
                
            } catch (error) {
                console.error(`    ❌ Failed to fetch details for ${opp.id}:`, error);
                return null;
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const successfulResults = batchResults.filter((result): result is GrantsGovDetailsResponse => result !== null);
        
        results.push(...successfulResults);
        
        console.log(`    ✅ Batch ${Math.floor(i/batchSize) + 1}: ${successfulResults.length}/${batch.length} successful`);
        
        // Pause between batches
        if (i + batchSize < opportunities.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.log(`    🎉 Total: ${results.length}/${opportunities.length} details fetched successfully`);
    
    return results;
}