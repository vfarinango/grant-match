// ---------------------------------------------------------------------
// ------------------ Grants.Gov API Interfaces ------------------------
// ---------------------------------------------------------------------

// Search2 Endpoint: Fetch all relevant grants
// Reusable interface for simple label/value/count options
export interface GrantsGovOption {
    label: string;
    value: string;
    count: number;
}

// Interface for sub-agency options within an agency
export interface GrantsGovSubAgencyOption extends GrantsGovOption {}

// Interface for the agencies array
export interface GrantsGovAgency {
    subAgencyOptions: GrantsGovSubAgencyOption[];
    label: string;
    value: string;
    count: number;
}

// Interface for a single grant opportunity from the API response
// export interface GrantsGovOpportunity {
//     id: string;
//     number: string;
//     title: string;
//     agencyCode: string;
//     agency: string;
//     openDate: string;
//     closeDate: string;
//     oppStatus: string;
//     docType: string;
//     cfdaList: string[];
// }
export interface GrantsGovOpportunity {
    id: string;            // Grant.id (converted to number)
    title: string;         // Grant.title
    closeDate?: string;    // Grant.deadline
    agency?: string;       // Grant.source
    cfdaList?: string[];   // Grant.focus_areas
    openDate?: string;     // Grant.posted_date
}

// Interface for the 'data' object in the API response
export interface GrantsGovResponseData {
    searchParams: {
        resultType: string;
        searchOnly: boolean;
        oppNum: string;
        cfda: string;
        sortBy: string;
        oppStatuses: string;
        startRecordNum: number;
        eligibilities: string;
        fundingInstruments: string;
        fundingCategories: string;
        agencies: string;
        rows: number;
        keyword: string;
        keywordEncoded: boolean;
    };
    hitCount: number;
    startRecord: number;
    oppHits: GrantsGovOpportunity[];
    oppStatusOptions: GrantsGovOption[];
    dateRangeOptions: GrantsGovOption[];
    suggestion: string;
    eligibilities: GrantsGovOption[];
    fundingCategories: GrantsGovOption[];
    fundingInstruments: GrantsGovOption[];
    agencies: GrantsGovAgency[];
    accessKey: string;
    errorMsgs: string[];
}


// Main interface for the entire API response
export interface GrantsGovResponse {
    errorcode: number;
    msg: string;
    token: string;
    data: GrantsGovResponseData;
}

// ----------------------------------------------------------
// FetchOpportunity endpoint: Fetch details for each relevant grant
// ----------------------------------------------------------

// // Interface for opportunity category
// interface OpportunityCategory {
//     category: string;
//     description: string;
// }

// // Interface for agency details
// interface AgencyDetails {
//     code: string;
//     seed: string;
//     agencyName: string;
//     agencyCode: string;
//     topAgencyCode: string;
// }

// // Interface for applicant types
// interface ApplicantType {
//     id: string;
//     description: string;
// }

// // Interface for funding instruments
// interface FundingInstrument {
//     id: string;
//     description: string;
// }

// // Interface for funding activity categories
// interface FundingActivityCategory {
//     id: string;
//     description: string;
// }

// // Interface for CFDA information
// interface Cfda {
//     id: number;
//     opportunityId: number;
//     revision?: number;
//     cfdaNumber?: string;
//     programTitle?: string;
// }

// // Interface for synopsis
// interface Synopsis {
//     opportunityId: number;
//     version: number;
//     agencyCode: string;
//     agencyName: string;
//     agencyPhone: string;
//     agencyAddressDesc: string;
//     agencyDetails: AgencyDetails;
//     topAgencyDetails: AgencyDetails;
//     agencyContactPhone: string;
//     agencyContactName: string;
//     agencyContactDesc: string;
//     agencyContactEmail: string;
//     agencyContactEmailDesc: string;
//     synopsisDesc: string;
//     responseDateDesc: string;
//     fundingDescLinkUrl: string;
//     fundingDescLinkDesc: string;
//     postingDate: string;
//     costSharing: boolean;
//     awardCeiling: string;
//     awardFloor: string;
//     sendEmail: string;
//     createTimeStamp: string;
//     modComments: string;
//     createdDate: string;
//     lastUpdatedDate: string;
//     applicantTypes: ApplicantType[];
//     fundingInstruments: FundingInstrument[];
//     fundingActivityCategories: FundingActivityCategory[];
//     postingDateStr: string;
//     createTimeStampStr: string;
// }

// // Interface for opportunity history details
// interface OpportunityHistoryDetail {
//     oppHistId: {
//         opportunityId: number;
//         revision: number;
//     };
//     opportunityId: number;
//     revision: number;
//     opportunityNumber: string;
//     opportunityTitle: string;
//     owningAgencyCode: string;
//     publisherUid: string;
//     listed: string;
//     opportunityCategory: OpportunityCategory;
//     synopsis: {
//         id: {
//             opportunityId: number;
//             revision: number;
//         };
//         opportunityId: number;
//         revision: number;
//         version: number;
//         agencyCode: string;
//         agencyAddressDesc: string;
//         agencyDetails: AgencyDetails;
//         agencyContactPhone: string;
//         agencyContactName: string;
//         agencyContactDesc: string;
//         agencyContactEmail: string;
//         agencyContactEmailDesc: string;
//         synopsisDesc: string;
//         responseDateDesc: string;
//         fundingDescLinkUrl: string;
//         fundingDescLinkDesc: string;
//         postingDate: string;
//         costSharing: boolean;
//         awardCeiling: string;
//         awardFloor: string;
//         createTimeStamp: string;
//         actionType: string;
//         actionDate: string;
//         createdDate: string;
//         lastUpdatedDate: string;
//         applicantTypes: ApplicantType[];
//         fundingInstruments: FundingInstrument[];
//         fundingActivityCategories: FundingActivityCategory[];
//         postingDateStr: string;
//         createTimeStampStr: string;
//     };
//     cfdas: Cfda[];
//     synopsisModifiedFields: string[];
//     forecastModifiedFields: string[];
// }

// // Interface for opportunity packages
// interface OpportunityPackage {
//     id: number;
//     topportunityId: number;
//     familyId: number;
//     dialect: string;
//     opportunityNumber: string;
//     opportunityTitle: string;
//     openingDate: string;
//     closingDate: string;
//     owningAgencyCode: string;
//     agencyDetails: AgencyDetails;
//     topAgencyDetails: AgencyDetails;
//     contactInfo: string;
//     gracePeriod: number;
//     electronicRequired: string;
//     expectedApplicationCount: number;
//     openToApplicantType: number;
//     listed: string;
//     isMultiProject: string;
//     extension: string;
//     mimetype: string;
//     lastUpdate: string;
//     workspaceCompatibleFlag: string;
//     packageId: string;
//     openingDateStr: string;
//     closingDateStr: string;
// }

// Main interface for the detailed response from fetchOpportunity
// export interface GrantsGovDetailsResponse {
//     errorcode: number;
//     msg: string;
//     token: string;
//     data: {
//         id: number;
//         revision: number;
//         opportunityNumber: string;
//         opportunityTitle: string;
//         owningAgencyCode: string;
//         listed: string;
//         publisherUid: string;
//         flag2006: string;
//         opportunityCategory: OpportunityCategory;
//         synopsis: Synopsis;
//         agencyDetails: AgencyDetails;
//         topAgencyDetails: AgencyDetails;
//         synopsisAttachmentFolders: any[]; // Empty array in your data
//         synopsisDocumentURLs: any[]; // Empty array in your data
//         synAttChangeComments: any[]; // Empty array in your data
//         cfdas: Cfda[];
//         opportunityHistoryDetails: OpportunityHistoryDetail[];
//         opportunityPkgs: OpportunityPackage[];
//         closedOpportunityPkgs: any[]; // Empty array in your data
//         originalDueDateDesc: string;
//         synopsisModifiedFields: string[];
//         forecastModifiedFields: string[];
//         errorMessages: any[]; // Empty array in your data
//         synPostDateInPast: boolean;
//         docType: string;
//         forecastHistCount: number;
//         synopsisHistCount: number;
//         assistCompatible: boolean;
//         assistURL: string;
//         relatedOpps: any[]; // Empty array in your data
//         draftMode: string;
//     };
// }
export interface GrantsGovDetailsResponse {
    errorcode: number;
    msg: string;
    token: string;
    data: {
        synopsis: {
            synopsisDesc: string;       // Grant.description
            awardFloor?: string;        // Grant.funding_amount
            awardCeiling?: string;      // Grant.funding_amount
            fundingDescLinkUrl: string; // Grant.source_url (MVP requirement)
        };
    };
}
