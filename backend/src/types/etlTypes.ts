import { GrantsGovDetailsResponse, GrantsGovOpportunity } from '../types/grantsGovApiTypes';

export interface EtlOptions {
    searchTerms: string[];
    maxResultsPerTerm?: number;
}

export interface EtlResult {
    detailResponses: GrantsGovDetailsResponse[];
    opportunityData: GrantsGovOpportunity[];
}
