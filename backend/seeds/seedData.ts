// This file contains the raw data for 7 grants.
import { Grant } from '../src/routes/grantsRoutes';

const grantsToSeed: Omit<Grant, 'id' | 'created_at'>[] = [
    {
        title: 'Community Development Grant',
        description: 'Funding for local community projects focusing on education and infrastructure.',
        deadline: new Date('2025-09-29'),
        funding_amount: 150000,
        source: 'City Council',
        source_url: 'https://citycouncil.gov',
        focus_areas: ['education', 'infrastructure', 'community'],
        posted_date: new Date('2025-06-30'),
    },
    {
        title: 'Environmental Research Fund',
        description: 'Supports scientific research into renewable energy and sustainable practices.',
        deadline: new Date('2025-10-14'),
        funding_amount: 250000,
        source: 'Green Futures Foundation',
        source_url: 'https://greenfutures.org',
        focus_areas: ['environment', 'research'],
        posted_date: new Date('2025-06-19'),
    },
    {
        title: 'Arts & Culture Initiative',
        description: 'Grants for local artists and cultural organizations to promote community engagement through arts.',
        deadline: new Date('2025-10-31'),
        funding_amount: 75000,
        source: 'Cultural Heritage Trust',
        source_url: 'https://culturalheritage.org',
        focus_areas: ['arts', 'culture'],
        posted_date: new Date('2025-07-09'),
    },
    {
        title: 'Urban Education & Outreach Program',
        description: 'Funding for non-profits providing educational and outreach services to low-income urban communities.',
        deadline: new Date('2025-11-01'),
        funding_amount: 120000,
        source: 'City Foundation',
        source_url: 'https://cityfoundation.org',
        focus_areas: ['education', 'outreach', 'community'],
        posted_date: new Date('2025-07-25'),
    },
    {
        title: 'Local Infrastructure Improvement Fund',
        description: 'Grants to support small-scale infrastructure projects that benefit local communities, such as public parks and community centers.',
        deadline: new Date('2025-10-15'),
        funding_amount: 250000,
        source: 'Regional Development Council',
        source_url: 'https://regionaldev.org',
        focus_areas: ['infrastructure', 'community', 'development'],
        posted_date: new Date('2025-07-20'),
    },
    {
        title: 'Community Arts & Culture Education Initiative',
        description: 'A grant to promote arts education and cultural programs in community schools and public spaces.',
        deadline: new Date('2025-12-05'),
        funding_amount: 80000,
        source: 'Arts for All',
        source_url: 'https://artsforall.com',
        focus_areas: ['arts', 'education', 'culture'],
        posted_date: new Date('2025-07-18'),
    },
    {
        title: 'Sustainable Environment Research Grant',
        description: 'Supports advanced research into sustainable energy solutions and environmental conservation efforts.',
        deadline: new Date('2025-10-30'),
        funding_amount: 300000,
        source: 'Green Futures Foundation',
        source_url: 'https://greenfutures.org',
        focus_areas: ['environment', 'sustainability', 'research'],
        posted_date: new Date('2025-07-28'),
    }
];

export default grantsToSeed;