import { createTheme, rem} from '@mantine/core';
import type { MantineTheme } from '@mantine/core';

export const theme = createTheme({
    colors: {
        // Primary blue palette
        'primary-blue': [
            '#e6f7f7', // Lightest shade, #E2E6FF (for backgrounds/hover states)
            '#b3e6e6', // #B5BFFD (for light backgrounds)
            '#80d4d4', // #8793FA
            '#4dc2c2', // Primary color, #667eea
            '#1ab0b0', // #5B6CD9
            '#17a0a0', // #4D58C0
            '#0b5555', // #3E4A9C
            '#083f3f', //#2F3B77
            '#062e2e', // #222B59
            '#041f1f'  // Darkest shade, #1A203F
        ],
        'text-primary': ['#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a', '#1a1a1a'],
        'text-secondary': ['#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666', '#666666'],
        'background-light': ['#f8f9ff', '#F9F9F9', '#F9FFFF', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff', '#f8f9ff'],
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
        Modal: {
            defaultProps: {
                centered: true,
                radius: 'md',
                transitionProps: { transition: 'fade', duration: 40 },
                overlayProps: { backgroundOpacity: 0.55, blur: 3 },
            },
            styles: (theme: MantineTheme) => ({
                root: {
                    position: 'fixed',
                    zIndex: 1000,
                },
                inner: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                content: {
                    maxHeight: '90vh',
                    maxWidth: '90vw',
                    boxShadow: theme.shadows.xl,
                    border: `1px solid ${theme.colors.gray[2]}`,
                },
                header: {
                    backgroundColor: theme.colors.gray[0],
                    borderBottom: `1px solid ${theme.colors.gray[2]}`,
                    padding: theme.spacing.lg,
                },
                body: {
                    padding: theme.spacing.lg,
                },
            }),
        },
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
                    fontSize: theme.fontSizes.sm,
                },
                // This targets the icon wrapper specifically and ensures its size is correct
                leftSection: {
                    fontSize: rem(16), // Explicitly override with a size of 16px
                },
            }),
        },
    },
});