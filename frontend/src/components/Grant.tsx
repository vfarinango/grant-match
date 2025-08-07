import { Card, Text, Badge, Button, Group, Stack, Anchor, Box, Divider} from '@mantine/core';
import { IconSearch} from '@tabler/icons-react'; //IconCalendar, IconCurrencyDollar, IconBuilding,
import type { Grant, SimilarGrant } from "../services/grantsApi";


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
}

interface GrantProps {
    grant: Grant | SimilarGrant;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => void;
    view: 'all' | 'search' | 'similar';
}

const GrantComponent = ({ grant, onSearchSimilarGrants, view }: GrantProps) => {
    const handleSimilarClick = () => {
        if (grant.id && grant.title) {
            onSearchSimilarGrants(grant.id, grant.title);
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                        <Text fw={600} size="lg" mb="xs" c="text-primary.0">
                            {grant.title}
                        </Text>
                        <Text size="sm" c="text-secondary.0" lineClamp={3}>
                            {grant.description}
                        </Text>
                    </Box>

                    <Box ta="right" style={{ minWidth: 'fit-content' }} ml="md">
                        <Text size="xs" c="text-secondary.0">Posted</Text>
                        <Text size="sm" c="text-primary.0">{formatDate(grant.posted_date)}</Text>
                    </Box>
                </Group>

                <Group gap="lg" mt="sm">
                    <Box>
                        <Text size="xs" c="text-secondary.0">Funding Amount</Text>
                        <Text size="sm" fw={500} c="text-primary.0">
                            {formatCurrency(grant.funding_amount)}
                        </Text>
                    </Box>
                    
                    <Box>
                        <Text size="xs" c="text-secondary.0">Deadline</Text>
                        <Text size="sm" fw={500} c="text-primary.0">
                            {formatDate(grant.deadline)}
                        </Text>
                    </Box>

                    {grant.source && (
                        <Box>
                            <Text size="xs" c="text-secondary.0">Source</Text>
                            <Badge variant="light" size="sm" mt="2px" color="primary-blue">
                                {grant.source}
                            </Badge>
                        </Box>
                    )}

                    {/* Conditionally display relevance score for search results */}
                    {isSimilarGrant(grant) && (
                        <Box>
                            <Text size="xs" c="text-secondary.0">Relevance</Text>
                            <Badge color="cyan" variant="light" size="sm" mt="2px">
                                {grant.similarity_score.toFixed(2)}
                            </Badge>
                        </Box>
                    )}
                </Group>

                {grant.focus_areas && grant.focus_areas.length > 0 && (
                    <Group gap="xs" mt="xs">
                        <Text size="xs" c="text-secondary.0">Focus Areas:</Text>
                        {grant.focus_areas.map((area, index) => (
                            <Badge key={index} variant="outline" size="xs" color="primary-blue">
                                {area}
                            </Badge>
                        ))}
                    </Group>
                )}

                <Box>
                    <Divider my="sm" color="gray.2" />
                    
                    <Group justify="space-between">
                        <Group gap="sm">
                            <Button variant="filled" size="sm" color="primary-blue">
                                Summarize
                            </Button>
                            
                            {/* Conditionally display "Search Similar" button */}
                            {view !== 'similar' && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    color="primary-blue"
                                    onClick={handleSimilarClick}
                                    leftSection={<IconSearch size={14} />}
                                >
                                    Find Similar
                                </Button>
                            )}
                        </Group>

                        {grant.source_url && (
                            <Anchor 
                                href={grant.source_url} 
                                target="_blank" 
                                size="sm"
                                c="primary-blue.3"
                            >
                                Apply →
                            </Anchor>
                        )}
                    </Group>
                </Box>
            </Stack>
        </Card>
    );
};

export default GrantComponent;
// Summarize grant feature Frontend: 
// Write the resultList Component
// Write the Grant Component
// Within the Grant component, include conditional logic that displays the summary if the summary button is pressed and a summary exists. 
// If the summary doesn’t exist, it calls a function from App.ts that sends a patch request to the backend to add a summary to the grant.