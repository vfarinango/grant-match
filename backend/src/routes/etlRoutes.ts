import express, { Request, Response } from 'express';
import { fetchAndProcessAllOpportunities } from '../etl/grantsGovIngestion';
import { processAndLoadGrants } from '../scripts/processAndLoadGrants';
import { EtlOptions, EtlResult } from '../types/etlTypes';

const router = express.Router();

router.post('/run', async (req: Request, res: Response) => {
    // NOTE: For real apps, this endpoint should be secured
    // Could check for a secret key in the request header, for example.
    console.log('ETL pipeline triggered manually via API endpoint.');
    try {
        const etlOptions: EtlOptions = {
        // You can pass configuration via the request body, or hardcode it
            rows: 250
        };
        const grantsData: EtlResult = await fetchAndProcessAllOpportunities(etlOptions);
        await processAndLoadGrants(grantsData);
        res.status(200).json({ message: 'ETL pipeline ran successfully.', grantsProcessed: grantsData.detailResponses.length });
    } catch (error) {
        console.error('ETL pipeline failed:', error);
        res.status(500).json({ message: 'ETL pipeline failed.', error });
    }
});

export default router;