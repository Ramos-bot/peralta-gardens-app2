import { Platform } from 'react-native';

// Importar CSS para web automaticamente
if (Platform.OS === 'web') {
  // Injetar CSS diretamente no document
  const style = document.createElement('style');
  style.textContent = `
    /* Estilos globais para temas dark e light na web */

    /* Variáveis CSS para tema light (padrão) */
    :root {
      --primary-color: #2e7d32;
      --secondary-color: #81c784;
      --background-color: #ffffff;
      --surface-color: #f5f5f5;
      --text-color: #333333;
      --text-secondary-color: #666666;
      --border-color: #e0e0e0;
      --card-color: #ffffff;
      --shadow-color: rgba(0,0,0,0.1);
    }

    /* Tema light */
    body.light-theme {
      --primary-color: #2e7d32;
      --secondary-color: #81c784;
      --background-color: #ffffff;
      --surface-color: #f5f5f5;
      --text-color: #333333;
      --text-secondary-color: #666666;
      --border-color: #e0e0e0;
      --card-color: #ffffff;
      --shadow-color: rgba(0,0,0,0.1);
      
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Tema dark */
    body.dark-theme {
      --primary-color: #4caf50;
      --secondary-color: #81c784;
      --background-color: #121212;
      --surface-color: #1e1e1e;
      --text-color: #ffffff;
      --text-secondary-color: #b3b3b3;
      --border-color: #333333;
      --card-color: #1e1e1e;
      --shadow-color: rgba(0,0,0,0.3);
      
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Estilos globais para elementos web */
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Scrollbar customizada para tema dark */
    body.dark-theme::-webkit-scrollbar {
      width: 8px;
    }

    body.dark-theme::-webkit-scrollbar-track {
      background: var(--surface-color);
    }

    body.dark-theme::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    body.dark-theme::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary-color);
    }

    /* Scrollbar customizada para tema light */
    body.light-theme::-webkit-scrollbar {
      width: 8px;
    }

    body.light-theme::-webkit-scrollbar-track {
      background: var(--surface-color);
    }

    body.light-theme::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    body.light-theme::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary-color);
    }

    /* Animações suaves para transições */
    * {
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    /* Estilos para inputs em tema dark */
    body.dark-theme input,
    body.dark-theme textarea,
    body.dark-theme select {
      background-color: var(--surface-color);
      color: var(--text-color);
      border-color: var(--border-color);
    }

    body.dark-theme input::placeholder,
    body.dark-theme textarea::placeholder {
      color: var(--text-secondary-color);
    }

    /* Melhorar contraste para links */
    body.dark-theme a {
      color: var(--secondary-color);
    }

    body.light-theme a {
      color: var(--primary-color);
    }

    /* Estilos para modais */
    body.dark-theme .modal-overlay {
      background-color: rgba(0, 0, 0, 0.7);
    }

    body.light-theme .modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
    }

    /* Media queries para diferentes tamanhos de tela */
    @media (max-width: 768px) {
      body {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      body {
        font-size: 14px;
      }
    }

    /* Suporte para prefer-color-scheme */
    @media (prefers-color-scheme: dark) {
      :root {
        --primary-color: #4caf50;
        --secondary-color: #81c784;
        --background-color: #121212;
        --surface-color: #1e1e1e;
        --text-color: #ffffff;
        --text-secondary-color: #b3b3b3;
        --border-color: #333333;
        --card-color: #1e1e1e;
        --shadow-color: rgba(0,0,0,0.3);
      }
    }

    #root, #expo-root {
      background-color: var(--background-color) !important;
      color: var(--text-color) !important;
      min-height: 100vh;
    }
  `;
  
  document.head.appendChild(style);
  
  // Aplicar tema inicial baseado na preferência do sistema
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.className = systemPrefersDark ? 'dark-theme' : 'light-theme';
}
