// import { Card, Text, Badge, Button, Group, Stack, Anchor, Box, Divider, Loader } from '@mantine/core';
// import { IconArrowBack, IconFileText } from '@tabler/icons-react';
// import type { Grant, SimilarGrant } from '../services/grantsApi';

// // Helper functions (could be imported from another utility file)
// const formatCurrency = (amount: number | undefined): string => {
//     if (!amount) return 'Amount not specified';
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//     }).format(amount);
// };

// const formatDate = (dateString: Date | string | undefined): string => {
//     if (!dateString) return 'Date not specified';
//     return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// };

// const isSimilarGrant = (grant: Grant | SimilarGrant): grant is SimilarGrant => {
//     return (grant as SimilarGrant).similarity_score !== undefined;
// };

// // Define the props for the DetailedGrant component
// interface DetailedGrantProps {
//     grant: Grant | SimilarGrant;
//     onBackToResults: () => void;
//     onSummarizeForDetailedView: (grantId: number) => void;
//     isBeingSummarized?: boolean;
//     detailedGrantSummary?: string | null;   
// }

// const DetailedGrant = ({ grant, onBackToResults, onSummarizeForDetailedView, isBeingSummarized, detailedGrantSummary }: DetailedGrantProps) => {

//     const handleSummarizeClick = () => {
//         if (grant.id) {
//             onSummarizeForDetailedView(grant.id);
//         }
//     };

//     const displaySummary = detailedGrantSummary; // Use the new summary state here
//     const isAlreadySummarized = !!displaySummary;

//     return (
//         <Stack gap="md" px="md">
//             {/* Back button to return to search results */}
//             <Button
//                 variant="subtle"
//                 size="sm"
//                 color="primary-blue"
//                 leftSection={<IconArrowBack size={14} />}
//                 onClick={onBackToResults}
//                 style={{ alignSelf: 'flex-start' }}
//             >
//                 Back to Results
//             </Button>

//             <Card shadow="sm" padding="lg" radius="md" withBorder>
//                 <Stack gap="sm">
//                     {/* Grant Title and Posted Date */}
//                     <Group justify="space-between" align="flex-start">
//                         <Text fw={600} size="h2" mb="xs" c="text-primary.0">
//                             {grant.title}
//                         </Text>
//                         <Box ta="right" style={{ minWidth: 'fit-content' }} ml="md">
//                             <Text size="xs" c="text-secondary.0">Posted</Text>
//                             <Text size="sm" c="text-primary.0">{formatDate(grant.posted_date)}</Text>
//                         </Box>
//                     </Group>

//                     {/* Full Description (not line-clamped) */}
//                     <Text size="sm" c="text-secondary.0" style={{ whiteSpace: 'pre-line' }}>
//                         {grant.description}
//                     </Text>

//                     {/* Summary Section */}
//                     {displaySummary && (
//                         <Box mt="sm">
//                             <Divider mb="sm" color="gray.2" />
//                             <Text size="xs" c="text-secondary.0" fw={600} mb="xs">Summary:</Text>
//                             <Text size="sm" c="text-primary.0" style={{
//                                 backgroundColor: '#f8f9ff',
//                                 padding: '12px',
//                                 borderRadius: '8px',
//                                 border: '1px solid #e7f0ff'
//                             }}>
//                                 {displaySummary}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Grant Details (Amount, Deadline, Source, Relevance) */}
//                     <Group gap="lg" mt="sm">
//                         <Box>
//                             <Text size="xs" c="text-secondary.0">Funding Amount</Text>
//                             <Text size="sm" fw={500} c="text-primary.0">
//                                 {formatCurrency(grant.funding_amount)}
//                             </Text>
//                         </Box>
                        
//                         <Box>
//                             <Text size="xs" c="text-secondary.0">Deadline</Text>
//                             <Text size="sm" fw={500} c="text-primary.0">
//                                 {formatDate(grant.deadline)}
//                             </Text>
//                         </Box>

//                         {grant.source && (
//                             <Box>
//                                 <Text size="xs" c="text-secondary.0">Source</Text>
//                                 <Badge variant="light" size="sm" mt="2px" color="primary-blue">
//                                     {grant.source}
//                                 </Badge>
//                             </Box>
//                         )}

//                         {isSimilarGrant(grant) && (
//                             <Box>
//                                 <Text size="xs" c="text-secondary.0">Relevance</Text>
//                                 <Badge color="cyan" variant="light" size="sm" mt="2px">
//                                     {grant.similarity_score.toFixed(2)}
//                                 </Badge>
//                             </Box>
//                         )}
//                     </Group>

//                     {/* Focus Areas */}
//                     {grant.focus_areas && grant.focus_areas.length > 0 && (
//                         <Group gap="xs" mt="xs">
//                             <Text size="xs" c="text-secondary.0">Focus Areas:</Text>
//                             {grant.focus_areas.map((area, index) => (
//                                 <Badge key={index} variant="outline" size="xs" color="primary-blue">
//                                     {area}
//                                 </Badge>
//                             ))}
//                         </Group>
//                     )}

//                     {/* Action Buttons */}
//                     <Box>
//                         <Divider my="sm" color="gray.2" />
//                         <Group justify="space-between">
//                             <Group gap="sm">
//                                 <Button 
//                                     variant="filled" 
//                                     size="sm" 
//                                     color="primary-blue"
//                                     onClick={handleSummarizeClick}
//                                     leftSection={isBeingSummarized ? <Loader size={14} color="white" /> : <IconFileText size={14} />}
//                                     disabled={isBeingSummarized}
//                                 >
//                                     {isBeingSummarized ? 'Summarizing...' : (isAlreadySummarized ? 'Re-summarize' : 'Summarize')}
//                                 </Button>
//                             </Group>

//                             {grant.source_url && (
//                                 <Anchor 
//                                     href={grant.source_url} 
//                                     target="_blank" 
//                                     size="sm"
//                                     c="primary-blue.3"
//                                 >
//                                     Apply →
//                                 </Anchor>
//                             )}
//                         </Group>
//                     </Box>
//                 </Stack>
//             </Card>
//         </Stack>
//     );
// };

// export default DetailedGrant;


import { Card, Text, Badge, Button, Group, Stack, Anchor, Box, Divider, Loader, SimpleGrid, Title } from '@mantine/core';
import { IconArrowBack, IconFileText, IconSearch, IconCalendar, IconCurrencyDollar, IconBuilding, IconListDetails, IconBulb } from '@tabler/icons-react';
import type { Grant, SimilarGrant } from '../services/grantsApi';

// Helper functions (could be imported from another utility file)
const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return 'Amount not specified';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: Date | string | undefined): string => {
    if (!dateString) return 'Date not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const isSimilarGrant = (grant: Grant | SimilarGrant): grant is SimilarGrant => {
    return (grant as SimilarGrant).similarity_score !== undefined;
};

// Define the props for the DetailedGrant component
interface DetailedGrantProps {
    grant: Grant | SimilarGrant;
    onBackToResults: () => void;
    onSummarizeForDetailedView: (grantId: number) => void;
    isBeingSummarized?: boolean;
    detailedGrantSummary?: string | null;   
}

const DetailedGrant = ({ grant, onBackToResults, onSummarizeForDetailedView, isBeingSummarized, detailedGrantSummary }: DetailedGrantProps) => {

    const handleSummarizeClick = () => {
        if (grant.id) {
            onSummarizeForDetailedView(grant.id);
        }
    };

    const displaySummary = detailedGrantSummary; // Use the new summary state here
    const isAlreadySummarized = !!displaySummary;

    const TitleIcon = <IconBulb size={32} />; 


    return (
        <Stack gap="md" px="md">
            {/* Back button to return to search results */}
            <Button
                variant="subtle"
                size="sm"
                color="primary-blue"
                leftSection={<IconArrowBack size={14} />}
                onClick={onBackToResults}
                style={{ alignSelf: 'flex-start' }}
            >
                Back to Results
            </Button>

            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack gap="xl">
                    {/* Grant Header Section (Title, Subtitle, Buttons) */}
                    <Group justify="space-between" align="flex-start">
                        <Stack gap="xs">
                            <Group gap="md">
                                {TitleIcon}
                                <Title order={1} fw={700}>
                                    {grant.title}
                                </Title>
                            </Group>
                            <Text size="sm" c="text-secondary.0" pl="md" style={{ borderLeft: '2px solid #667eea', marginLeft: '1rem' }}>
                                {grant.description}
                            </Text>
                        </Stack>
                        <Group gap="md">

                            <Button variant="outline" size="md" color="primary-blue">
                                <IconSearch size={16} /> Find Similar
                            </Button>
                            <Button
                                variant="filled"
                                size="md"
                                color="primary-blue"
                                onClick={handleSummarizeClick}
                                leftSection={isBeingSummarized ? <Loader size={16} color="white" /> : <IconFileText size={16} />}
                                disabled={isBeingSummarized}
                            >
                                {isBeingSummarized ? 'Summarizing...' : (isAlreadySummarized ? 'Re-summarize' : 'Summarize')}
                            </Button>
                        </Group>
                    </Group>

                    {/* Key Metrics Section */}
                    <Card withBorder padding="lg" radius="md" style={{ backgroundColor: '#f8f9ff' }}>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
                            {/* Funding Amount */}
                            <Box>
                                <Group gap="xs" mb="xs">
                                    <IconCurrencyDollar size={20} />
                                    <Text fw={500} size="sm" c="text-secondary.0">Funding Amount</Text>
                                </Group>
                                <Text size="lg" fw={600} c="text-primary.0">
                                    {formatCurrency(grant.funding_amount)}
                                </Text>
                            </Box>
                            {/* Deadline */}
                            <Box>
                                <Group gap="xs" mb="xs">
                                    <IconCalendar size={20} />
                                    <Text fw={500} size="sm" c="text-secondary.0">Deadline</Text>
                                </Group>
                                <Text size="lg" fw={600} c="text-primary.0">
                                    {formatDate(grant.deadline)}
                                </Text>
                            </Box>
                            {/* Source */}
                            {grant.source && (
                                <Box>
                                    <Group gap="xs" mb="xs">
                                        <IconBuilding size={20} />
                                        <Text fw={500} size="sm" c="text-secondary.0">Source</Text>
                                    </Group>
                                    <Badge variant="light" size="lg" color="primary-blue">
                                        {grant.source}
                                    </Badge>
                                </Box>
                            )}
                            {/* Relevance Score (if it's a similar grant) */}
                            {isSimilarGrant(grant) && (
                                <Box>
                                    <Group gap="xs" mb="xs">
                                        <IconSearch size={20} />
                                        <Text fw={500} size="sm" c="text-secondary.0">Relevance</Text>
                                    </Group>
                                    <Badge color="cyan" variant="light" size="lg">
                                        {grant.similarity_score.toFixed(2)}
                                    </Badge>
                                </Box>
                            )}
                        </SimpleGrid>
                    </Card>

                    {/* Full Description & Summary */}
                    <Stack gap="md">
                        <Group gap="xs">
                            <IconListDetails size={20} />
                            <Title order={4} fw={600}>
                                Full Details
                            </Title>
                        </Group>
                        <Text size="sm" c="text-secondary.0">
                            {grant.description}
                        </Text>
                    </Stack>

                    {displaySummary && (
                        <Box>
                            <Divider my="md" />
                            <Title order={4} fw={600} mb="sm">Summary</Title>
                            <Text size="sm" c="text-primary.0" style={{
                                backgroundColor: '#f8f9ff',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #e7f0ff'
                            }}>
                                {displaySummary}
                            </Text>
                        </Box>
                    )}

                    <Divider my="sm" />

                    {/* Footer Action Bar */}
                    <Group justify="flex-end">
                        {grant.source_url && (
                            <Anchor
                                href={grant.source_url}
                                target="_blank"
                                size="md"
                                fw={500}
                                c="primary-blue.3"
                                onClick={(event) => event.stopPropagation()}
                            >
                                Apply →
                            </Anchor>
                        )}
                    </Group>
                </Stack>
            </Card>
        </Stack>
    );
};

export default DetailedGrant;
