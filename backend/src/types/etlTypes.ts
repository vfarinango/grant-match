import { GrantsGovDetailsResponse, GrantsGovOpportunity } from '../types/grantsGovApiTypes';

export interface EtlOptions {
    searchTerms?: string[];
    rows?: number;
    oppStatuses?: string[];
    skipEmbeddings?: boolean;
    dryRun?: boolean;
    fundingCategories?: string[]; 
    agencies?: string[];  
    cfdaCodes?: string[];  
}

export interface EtlResult {
    detailResponses: GrantsGovDetailsResponse[];
    opportunityData: GrantsGovOpportunity[];
}


// interface EtlOptions {
//     searchTerms?: string[];
//     maxResults?: number;
//     skipEmbeddings?: boolean;
//     dryRun?: boolean;
// }
