import axios from 'axios';
import dotenv from 'dotenv';
import { Grant } from '../src/types/grantMatchTypes'; // Grant interface
import {
    GrantsGovOpportunity,
    GrantsGovResponse,
    GrantsGovDetailsResponse,
    GrantsGovSearchParams,
    ConsolidatedGrant,
}  from '../src/types/grantsGovApiTypes';
import { EtlOptions, EtlResult } from '../src/types/etlTypes';

dotenv.config();

const GRANTS_GOV_API_URL = 'https://api.grants.gov/v1/api/search2';

// ----------------------------------------------------------
// -------------------- EXTRACT -----------------------------
// ----------------------------------------------------------

/** 
 * Function: Fetches all posted grants from the Grants.gov search2 API based on a keyword.
 */
export async function fetchGrantsFromGrantsGov(params: {
    rows: number,
}): Promise<GrantsGovOpportunity[]> {
    console.log(`🔍 Starting a paginated fetch of ALL posted grants from Grants.gov...`);

    const allOpportunities: GrantsGovOpportunity[] = [];
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
                break;
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
            keepFetching = false;
        }
    }
    console.log(`🎉 Total unique opportunities found: ${allOpportunities.length}`);
    return allOpportunities;
}

/**
 * Fetches detailed grant information from the Grants.gov fetchOpportunity API.
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
/**
 * Enhanced detailed information fetching with better error handling
 */
async function fetchDetailedInformation(opportunities: GrantsGovOpportunity[]): Promise<GrantsGovDetailsResponse[]> {
    console.log(`    📋 Fetching details for ${opportunities.length} opportunities...`);
    
    const batchSize = 5;
    const results: GrantsGovDetailsResponse[] = [];
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (opp, batchIndex) => {
            try {
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
        
        console.log(`    ✅ Batch ${Math.floor(i / batchSize) + 1}: ${successfulResults.length}/${batch.length} successful`);
        
        if (i + batchSize < opportunities.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.log(`    🎉 Total: ${results.length}/${opportunities.length} details fetched successfully`);
    return results;
}

// ----------------------------------------------------------
// -------------------- ETL ORCHESTRATION -------------------
// ----------------------------------------------------------

/**
 * Orchestrates the main, full ETL process: fetch, enrich, filter, score, and prepare.
 */

export async function fetchAndProcessAllOpportunities(options: EtlOptions): Promise<EtlResult> {
    const { agencies = [], searchTerms = [], cfdaCodes = [], rows = 250 } = options;

    console.log(`🚀 Starting grant ingestion and processing pipeline...`);
    console.log(`🎯 Targeting all 'posted' grants for client-side filtering`);

    try {
        // Step 1
        console.log('🔍 Step 1: Fetching all posted grants...');
        const allOpportunities = await fetchGrantsFromGrantsGov({ rows });

        if (allOpportunities.length === 0) {
            console.log('⚠️  No grants found from broad search. Exiting.');
            return { detailResponses: [], opportunityData: [] };
        }
        console.log(`✅ Found ${allOpportunities.length} opportunities from broad search.`);

        // Step 2
        console.log('📋 Step 2: Fetching detailed information for all grants...');
        const detailResponses = await fetchDetailedInformation(allOpportunities);

        const opportunitiesWithDetails: ConsolidatedGrant[] = allOpportunities.map(opp => {
            const details = detailResponses.find(dr => dr.data.id === parseInt(opp.id, 10));
            return { ...opp, details };
        });

        // Step 3: Perform client-side keyword filtering on the detailed grants
        console.log('🎯 Step 3: Filtering grants by Agency, CFDA codes, and keywords...');
        const relevantOpportunities = opportunitiesWithDetails.filter(opp => {
            // It's still crucial to check for missing details
            if (!opp.details || !opp.details.data) return false;
            
            const hasPriorityAgency = agencies.some(agency => opp.agencyCode === agency);
            
            // Refactored to use the authoritative 'cfdas' array from the details object
            const hasPriorityCFDA = (opp.details.data.cfdas ?? []).some(cfda => {
                // Check if cfdaNumber exists before including it
                return cfda.cfdaNumber && cfdaCodes.includes(cfda.cfdaNumber);
            });

            const hasKeyword = searchTerms.some(term => {
                const titleLower = opp.title.toLowerCase();
                const synopsisLower = opp.details?.data.synopsis.synopsisDesc?.toLowerCase() || '';
                return titleLower.includes(term.toLowerCase()) || synopsisLower.includes(term.toLowerCase());
            });

            return hasPriorityAgency && hasPriorityCFDA && hasKeyword;
        });
        
        if (relevantOpportunities.length === 0) {
            console.log('⚠️ No grants matched the high-value keywords. Exiting.');
            return { detailResponses: [], opportunityData: [] };
        }
        console.log(`✅ Filtered down to ${relevantOpportunities.length} highly relevant grants.`);

        console.log('🌟 Step 4: Scoring and preparing grants for loading...');
        const scoredAndFilteredGrants = await scoreAndFilterOpportunities(relevantOpportunities, searchTerms, {
            priorityAgencies: agencies,
            highValueKeywords: searchTerms
        });
        
        console.log(`✅ Pipeline complete: ${scoredAndFilteredGrants.length} high-quality grants processed.`);
        
        const finalDetailResponses = scoredAndFilteredGrants
            .map(opp => opp.details)
            .filter((details): details is GrantsGovDetailsResponse => details !== undefined);

        const finalOpportunityData = scoredAndFilteredGrants
            .map(opp => {
                const { details, ...opportunityData } = opp;
                return opportunityData;
            });

        return {
            detailResponses: finalDetailResponses,
            opportunityData: finalOpportunityData
        };

    } catch (error) {
        console.error('❌ Grant processing pipeline failed:', error);
        throw error;
    }
}
// ----------------------------------------------------------
// -------------------- TRANSFORM ---------------------------
// ----------------------------------------------------------
/**
 * Maps a consolidated grant object from the API into app's Grant interface.
 */

export function mapGrantsGovToGrant(consolidatedGrant: ConsolidatedGrant): Omit<Grant, 'id' | 'summary'> {
    const { details, ...opportunityData } = consolidatedGrant;

    // Gracefully handle grants with missing details
    if (!details?.data || !details.data.synopsis) {
        console.warn(`⚠️ Warning: Skipping grant with missing details for ID: ${opportunityData.id}`);
        // Return a minimal object to prevent the pipeline from crashing
        return {
            title: opportunityData.title,
            description: '',
            source: 'Grants.gov',
            agency: opportunityData.agency || 'Not specified',
            eligibility_description: 'Not specified',
            focus_areas: opportunityData.cfdaList || [],
            focus_area_titles: [],
            posted_date: opportunityData.openDate ? new Date(opportunityData.openDate) : undefined,
            created_at: new Date(),
        };
    }

    const synopsis = details.data.synopsis;
    const cfdaData = details.data.cfdas || [];

    const cfdaNumbers = cfdaData.map(cfda => cfda.cfdaNumber).filter((cfda): cfda is string => cfda !== undefined);
    const cfdaTitles = cfdaData.map(cfda => cfda.programTitle).filter((title): title is string => title !== undefined);

    let fundingAmount: number | undefined;
    if (synopsis.awardCeiling && synopsis.awardCeiling !== 'none') {
        const ceilingStr = synopsis.awardCeiling.replace(/[$,]/g, '');
        const parsedAmount = parseFloat(ceilingStr);
        if (!isNaN(parsedAmount)) {
            fundingAmount = parsedAmount;
        }
    } else if (synopsis.awardFloor && synopsis.awardFloor !== 'none') {
        const floorStr = synopsis.awardFloor.replace(/[$,]/g, '');
        const parsedAmount = parseFloat(floorStr);
        if (!isNaN(parsedAmount)) {
            fundingAmount = parsedAmount;
        }
    }
    
    return {
        title: opportunityData.title,
        description: synopsis.synopsisDesc || '',
        deadline: opportunityData.closeDate ? new Date(opportunityData.closeDate) : undefined,
        funding_amount: fundingAmount,
        source: 'Grants.gov',
        agency: synopsis.agencyName || 'Not specified',
        eligibility_description: synopsis.applicantEligibilityDesc || 'Not specified',
        source_url: synopsis.fundingDescLinkUrl,
        focus_areas: cfdaNumbers,
        focus_area_titles: cfdaTitles,
        posted_date: opportunityData.openDate ? new Date(opportunityData.openDate) : undefined,
        created_at: new Date()
    };
}

// ----------------------------------------------------------
// -------------------- RELEVANCY SCORING ------------------
// ----------------------------------------------------------

/**
 * Calculate relevancy score for a grant opportunity
 */
function calculateRelevancyScore(
    opportunity: ConsolidatedGrant, 
    searchKeyword: string,
    config: { priorityAgencies: string[], highValueKeywords: string[] }
): number {
    let score = 0;
    const titleLower = opportunity.title.toLowerCase();
    const keywordLower = searchKeyword.toLowerCase();
    
    // Title relevance (highest weight)
    if (titleLower.includes(keywordLower)) {
        score += 10;
    }
    
    // High-value keyword matches in title
    config.highValueKeywords.forEach(hvKeyword => {
        if (titleLower.includes(hvKeyword.toLowerCase())) {
            score += 5;
        }
    });
    
    // Agency priority
    if (config.priorityAgencies.some(agency => 
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
    if (opportunity.details?.data?.synopsis) {
        const descriptionLower = opportunity.details.data.synopsis.synopsisDesc?.toLowerCase() || '';
        
        // Description keyword matches
        if (descriptionLower.includes(keywordLower)) {
            score += 3;
        }
        
        // High-value keyword matches in description
        config.highValueKeywords.forEach(hvKeyword => {
            if (descriptionLower.includes(hvKeyword.toLowerCase())) {
                score += 2;
            }
        });
        
        // Funding amount consideration (higher amounts often more competitive/relevant)
        const ceiling = opportunity.details.data.synopsis.awardCeiling;
        if (ceiling && !isNaN(parseFloat(ceiling.replace(/[,$]/g, '')))) {
            const amount = parseFloat(ceiling.replace(/[,$]/g, ''));
            if (amount >= 1000000) score += 2; // $1M+
            else if (amount >= 100000) score += 1; // $100K+
        }
    }
    
    return Math.max(0, score); // Ensure non-negative
}

/**
 * Score opportunities and return top candidates
 */
async function scoreAndFilterOpportunities(
    opportunities: ConsolidatedGrant[],
    searchTerms: string[],
    config: { priorityAgencies: string[], highValueKeywords: string[] }
): Promise<ConsolidatedGrant[]> {
    
    const scoredOpportunities = opportunities.map(opp => {
        const scores = searchTerms.map(term => calculateRelevancyScore(opp, term, config));
        const maxScore = Math.max(...scores);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
            opportunity: opp,
            maxScore,
            avgScore,
            combinedScore: maxScore * 0.7 + avgScore * 0.3
        };
    });
    
    const topOpportunities = scoredOpportunities
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, Math.min(100, opportunities.length))
        .map(scored => scored.opportunity);
    
    console.log(`    🎯 Filtered to top ${topOpportunities.length} most relevant opportunities`);
    
    return topOpportunities;
}