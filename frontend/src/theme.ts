import { createTheme, rem} from '@mantine/core';
import type { MantineTheme } from '@mantine/core';

export const theme = createTheme({
    colors: {
        // Primary blue palette
        'primary-blue': [
            '#E2E6FF', // Lightest shade
            '#B5BFFD',
            '#8793FA',
            '#667eea', // Primary color
            '#5B6CD9',
            '#4D58C0',
            '#3E4A9C',
            '#2F3B77',
            '#222B59',
            '#1A203F'  // Darkest shade
        ],
        'text-primary': ['#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a'],
        'text-secondary': ['#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666'],
        'background-light': ['#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff'],
        'background-base': ['#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa', '#fafafa'],    
    },
    primaryColor: 'primary-blue',
    fontFamily: 'Geist, sans-serif', 
    headings: {
        fontFamily: 'Geist Sans, sans-serif',
        sizes: {
            h1: {
                // Main Title
                fontSize: '2.5rem',
                fontWeight: '700',
            },
            h2: {
                // Section Title
                fontSize: '1.75rem',
                fontWeight: '600',
            },
        },
    },
    spacing: {
        xs: '0.25rem', // 4px
        sm: '0.5rem',  // 8px
        md: '1rem',    // 16px
        lg: '1.5rem',  // 24px
        xl: '2rem',    // 32px
    },

    shadows: {
        sm: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        md: '0px 4px 8px rgba(0, 0, 0, 0.08)',
        lg: '0px 8px 16px rgba(0, 0, 0, 0.1)',
    },
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
            },
            styles: (theme: MantineTheme) => ({
                root: {
                    boxShadow: theme.shadows.sm,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: theme.shadows.md,
                    },
                },
            }),
        },
        Card: {
            styles: (theme: MantineTheme) => ({
                root: {
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.shadows.sm,
                },
            }),
        },
        TextInput: {
            defaultProps: {
                radius: 'md',
            },
            styles: (theme: MantineTheme) => ({
                input: {
                boxShadow: theme.shadows.sm,
                },
            }),
        },
        NavLink: {
            styles: (theme: MantineTheme) => ({
                root: {
                    // This sets the base font size for the NavLink, including the icon's container
                    fontSize: theme.fontSizes.sm, // Or whatever size you want
                },
                // This targets the icon wrapper specifically and ensures its size is correct
                leftSection: {
                    fontSize: rem(16), // Explicitly override with a size of 16px
                },
            }),
        },
    },
});