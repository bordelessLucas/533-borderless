import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)',
          muted: 'var(--color-ink-muted)',
        },
        paper: {
          DEFAULT: 'var(--color-paper)',
          raised: 'var(--color-paper-raised)',
          line: 'var(--color-paper-line)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          deep: 'var(--color-brand-deep)',
          soft: 'var(--color-brand-soft)',
        },
        warn: 'var(--color-warn)',
        ok: 'var(--color-ok)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          floating: 'var(--surface-floating)',
          sunken: 'var(--surface-sunken)',
        },
        primary: {
          DEFAULT: 'var(--primary-default)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          subtle: 'var(--primary-subtle)',
        },
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
        card: 'var(--radius-card)',
        nav: 'var(--radius-navigation)',
      },
      boxShadow: {
        soft: '0 12px 40px -20px rgba(18, 28, 24, 0.35)',
        button: 'var(--shadow-button)',
        card: 'var(--shadow-card)',
        sidebar: 'var(--shadow-sidebar)',
        header: 'var(--shadow-header)',
      },
      maxWidth: {
        dashboard: 'var(--container-dashboard)',
        reading: 'var(--container-reading)',
      },
      zIndex: {
        header: 'var(--z-header)',
        sidebar: 'var(--z-sidebar)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
      },
    },
  },
  plugins: [],
};

export default config;
