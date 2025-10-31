// Premium CRM Design Tokens
export const designTokens = {
  // Enhanced color palette
  colors: {
    brand: {
      50: 'hsl(217, 91%, 97%)',
      100: 'hsl(217, 91%, 95%)', 
      500: 'hsl(217, 91%, 60%)',
      600: 'hsl(217, 91%, 55%)',
      700: 'hsl(217, 91%, 50%)',
    },
    success: {
      50: 'hsl(142, 76%, 95%)',
      500: 'hsl(142, 76%, 36%)',
      600: 'hsl(142, 76%, 30%)',
    },
    warning: {
      50: 'hsl(43, 96%, 95%)',
      500: 'hsl(43, 96%, 56%)',
    },
    error: {
      50: 'hsl(0, 84%, 95%)',
      500: 'hsl(0, 84%, 60%)',
    },
  },

  // Gradient backgrounds
  gradients: {
    primary: 'linear-gradient(135deg, hsl(217 91% 60% / 0.05), hsl(217 91% 70% / 0.1))',
    success: 'linear-gradient(135deg, hsl(142 76% 36% / 0.05), hsl(142 76% 46% / 0.1))',
    subtle: 'linear-gradient(180deg, hsl(220 14% 99%), hsl(220 14% 96%))',
    glass: 'linear-gradient(135deg, hsl(0 0% 100% / 0.1), hsl(0 0% 100% / 0.05))',
    dark: {
      primary: 'linear-gradient(135deg, hsl(217 91% 60% / 0.1), hsl(217 91% 50% / 0.15))',
      subtle: 'linear-gradient(180deg, hsl(220 13% 11%), hsl(220 13% 9%))',
      glass: 'linear-gradient(135deg, hsl(0 0% 100% / 0.05), hsl(0 0% 100% / 0.02))',
    }
  },

  // Enhanced shadows
  shadows: {
    sm: '0 1px 2px 0 hsl(220 13% 13% / 0.05)',
    md: '0 4px 6px -1px hsl(220 13% 13% / 0.08), 0 2px 4px -2px hsl(220 13% 13% / 0.06)',
    lg: '0 10px 15px -3px hsl(220 13% 13% / 0.1), 0 4px 6px -4px hsl(220 13% 13% / 0.08)',
    xl: '0 20px 25px -5px hsl(220 13% 13% / 0.1), 0 10px 10px -5px hsl(220 13% 13% / 0.04)',
    glow: '0 0 20px hsl(217 91% 60% / 0.15)',
    dark: {
      sm: '0 1px 2px 0 hsl(0 0% 0% / 0.1)',
      md: '0 4px 6px -1px hsl(0 0% 0% / 0.15), 0 2px 4px -2px hsl(0 0% 0% / 0.1)',
      lg: '0 10px 15px -3px hsl(0 0% 0% / 0.2), 0 4px 6px -4px hsl(0 0% 0% / 0.15)',
      xl: '0 20px 25px -5px hsl(0 0% 0% / 0.25), 0 10px 10px -5px hsl(0 0% 0% / 0.1)',
      glow: '0 0 20px hsl(217 91% 60% / 0.25)',
    }
  },

  // Typography scale
  typography: {
    display: {
      fontSize: '2.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    subtitle: {
      fontSize: '1.25rem',
      fontWeight: '500',
      lineHeight: '1.4',
    },
    body: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  // Border radius
  radius: {
    xs: '0.25rem',
    sm: '0.375rem', 
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // Spacing scale
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Animation presets
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;