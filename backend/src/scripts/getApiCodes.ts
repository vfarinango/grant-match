import axios from 'axios';
import dotenv from 'dotenv';
import { GrantsGovResponse } from '../types/grantsGovApiTypes';

dotenv.config();

const GRANTS_GOV_API_URL = 'https://api.grants.gov/v1/api/search2';

async function getGrantsGovCodes() {
    console.log("🔍 Fetching a comprehensive list of funding categories and agencies from Grants.gov API...");

    const requestBody = {
        rows: 0 // Request 0 rows to get the metadata without any grants
    };

    try {
        const response = await axios.post<GrantsGovResponse>(
            GRANTS_GOV_API_URL,
            requestBody,
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

        const data = response.data.data;

        // Extracting Funding Category Codes
        const fundingCategoryCodes = data.fundingCategories.map(cat => ({
            label: cat.label,
            value: cat.value
        }));
        console.log("\n✅ Funding Categories Found:");
        console.table(fundingCategoryCodes);

        // Extracting Agency Codes
        const agencyCodes = data.agencies.map(agency => ({
            label: agency.label,
            value: agency.value
        }));
        console.log("\n✅ Top-level Agencies Found:");
        console.table(agencyCodes);

    } catch (error) {
        console.error(`❌ Error fetching codes:`, error);
    }
}

getGrantsGovCodes();