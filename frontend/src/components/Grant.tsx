import { Card, Text, Badge, Button, Group, Stack, Anchor } from '@mantine/core';
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
                <div className="flex-1">
                    <Text fw={600} size="lg" className="mb-2">
                        {grant.title}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={3}>
                        {grant.description}
                    </Text>
                </div>

                <div className="text-right min-w-fit ml-4">
                    <Text size="xs" c="dimmed">Posted</Text>
                    <Text size="sm">{formatDate(grant.posted_date)}</Text>
                </div>
            </Group>

            <Group gap="lg" className="mt-3">
                <div>
                    <Text size="xs" c="dimmed">Funding Amount</Text>
                    <Text size="sm" fw={500}>
                        {formatCurrency(grant.funding_amount)}
                    </Text>
                </div>
                
                <div>
                    <Text size="xs" c="dimmed">Deadline</Text>
                    <Text size="sm" fw={500}>
                        {formatDate(grant.deadline)}
                    </Text>
                </div>

                {grant.source && (
                    <div>
                        <Text size="xs" c="dimmed">Source</Text>
                        <Badge variant="light" size="sm" className="mt-1">
                            {grant.source}
                        </Badge>
                    </div>
                )}

                {/* New: Conditionally display relevance score for search results */}
                {isSimilarGrant(grant) && (
                    <div>
                        <Text size="xs" c="dimmed">Relevance</Text>
                        <Badge color="cyan" variant="light" size="sm" className="mt-1">
                            {grant.similarity_score.toFixed(2)}
                        </Badge>
                    </div>
                )}
            </Group>

            {grant.focus_areas && grant.focus_areas.length > 0 && (
                <Group gap="xs" className="mt-2">
                    <Text size="xs" c="dimmed">Focus Areas:</Text>
                    {grant.focus_areas.map((area, index) => (
                        <Badge key={index} variant="outline" size="xs">
                            {area}
                        </Badge>
                    ))}
                </Group>
            )}

            <Group justify="space-between" className="mt-4 pt-3 border-t border-gray-100">
                <Group gap="sm">
                    <Button variant="filled" size="sm">
                        Summarize
                    </Button>
                    
                    {/* New: Conditionally display "Search Similar" button */}
                    {view !== 'similar' && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleSimilarClick}
                            leftSection={<IconSearch size={14} />}
                        >
                            Search Similar
                        </Button>
                    )}
                </Group>

                {grant.source_url && (
                    <Anchor href={grant.source_url} target="_blank" size="sm">
                        Apply →
                    </Anchor>
                )}
            </Group>
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