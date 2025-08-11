// ---------------------------------------------------------------------
// ------------------ Grants.Gov API Interfaces (Refined) ----------------
//
// These interfaces have been simplified to include only the fields
// relevant to the GrantMatch application's ETL pipeline and data model.
// ---------------------------------------------------------------------

/**
 * Reusable type for simple label/value/count options.
 */
export interface GrantsGovOption<T = string> {
    label: string;
    value: T;
    count: number;
}

/**
 * Interface for a single grant from the search2 endpoint.
 *
 * NOTE: This is a partial view, including only the fields we use
 * for initial fetching and filtering.
 */
export interface GrantsGovOpportunity {
    id: string; // The unique ID for the grant. Maps to our Grant.id.
    title: string;
    agencyCode: string;
    agency: string;
    openDate: string; // Maps to our Grant.posted_date.
    closeDate: string; // Maps to our Grant.deadline.
    oppStatus: string;
    cfdaList: string[]; // List of CFDA numbers. Maps to our Grant.focus_areas.
}

/**
 * Interface for the 'data' object of the search2 API response.
 */
export interface GrantsGovResponseData {
    hitCount: number;
    startRecord: number;
    oppHits: GrantsGovOpportunity[];
}

/**
 * The full response from the search2 endpoint.
 */
export interface GrantsGovResponse {
    errorcode: number;
    msg: string;
    token: string;
    data: GrantsGovResponseData;
}

/**
 * Interface for the detailed information within the fetchOpportunity response.
 *
 * NOTE: This has been significantly trimmed to include only the `Synopsis` and `Cfdas`
 * data we need to enrich the `GrantsGovOpportunity` object.
 */
export interface GrantsGovDetailsData {
    id: number; // The unique ID, a number type here.
    opportunityTitle: string;
    owningAgencyCode: string;
    synopsis: {
        synopsisDesc: string; // The full description. Maps to our Grant.description.
        agencyName: string; // The full agency name. Maps to our Grant.agency.
        applicantEligibilityDesc: string; // The eligibility text. Maps to our Grant.eligibility_description.
        awardCeiling: string;
        awardFloor: string;
        fundingDescLinkUrl: string; // URL for more info. Maps to our Grant.source_url.
    };
    cfdas: {
        cfdaNumber?: string;
        programTitle?: string; // The full program title. Maps to our Grant.focus_area_titles.
    }[];
}

/**
 * The full response from the fetchOpportunity endpoint.
 */
export interface GrantsGovDetailsResponse {
    errorcode: number;
    msg: string;
    token: string;
    data: GrantsGovDetailsData;
}

/**
 * An object that combines the data from both the search2 and fetchOpportunity
 * APIs. This is the core object for the ETL pipeline's mapping and transformation steps.
 */
export type ConsolidatedGrant = GrantsGovOpportunity & {
    details?: GrantsGovDetailsResponse;
};

/**
 * Enhanced search parameters for the ETL configuration.
 */
export interface GrantsGovSearchParams {
    keyword?: string;
    oppNum?: string;
    oppStatuses?: string;
    fundingCategories?: string[];
    agencies?: string[];
    eligibilities?: string;
    fundingInstruments?: string;
    rows?: number;
    sortBy?: string;
    startRecordNum?: number;
}