import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  /* ── Tokens de cor (independentes do tema) ── */
  :root {
    --color-primary:        #4CDE3B;
    --color-primary-light:  #7AED6D;
    --color-primary-dark:   #2EA821;
    --color-danger:         #EF4444;
    --color-success:        #22C55E;
    --color-neutral:        #9CA3AF;
    --color-warmup:         #FBBF24;

    --radius-sm:  4px;
    --radius-md:  8px;
    --radius-lg:  12px;
    --font-sans:  -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── Tema claro (padrão) ── */
  :root,
  [data-theme="light"] {
    --bg-primary:     #FFFFFF;
    --bg-secondary:   #F3F4F6;
    --bg-card:        #FFFFFF;
    --text-primary:   #111827;
    --text-secondary: #6B7280;
    --border:         #E5E7EB;
  }

  /* ── Tema escuro ── */
  [data-theme="dark"] {
    --bg-primary:     #0F172A;
    --bg-secondary:   #1E293B;
    --bg-card:        #1E293B;
    --text-primary:   #F1F5F9;
    --text-secondary: #94A3B8;
    --border:         #334155;
  }

  /* ── Reset e base ── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: var(--font-sans);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100dvh;
    line-height: 1.5;
    transition: background-color 0.2s, color 0.2s;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: var(--font-sans);
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: var(--font-sans);
  }

  /* Garante área de toque mínima em mobile */
  button, [role="button"] {
    min-height: 44px;
  }
`
