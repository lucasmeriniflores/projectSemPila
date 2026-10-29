/**
 * ============================================================================
 * CONFIGURAÇÃO VISUAL & LOGOS DO APLICATIVO (SemPila)
 * ============================================================================
 * 
 * Este arquivo permite configurar 2 logos totalmente independentes:
 * 
 * 1. `headerLogoUrl`:
 *    - Logo exibida no cabeçalho do topo.
 *    - Como esta logo já inclui o texto "SemPila" desenhado na própria imagem,
 *      o texto separado foi removido automaticamente do cabeçalho.
 *    - Arquivo em /public/ (exemplo: '/logo-header.png', '/logo-header.svg')
 * 
 * 2. `splashLogoUrl`:
 *    - Logo/símbolo exibido na tela de carregamento com animação cinematográfica.
 *    - A logo sobe suavemente do rodapé para o centro, dá um zoom elegante
 *      e depois revela o app através da logo de forma suave.
 *    - Arquivo em /public/ (exemplo: '/logo-splash.svg', '/Vector.svg')
 * 
 * COMO COLOCAR SUAS LOGOS:
 * 1. Salve seus 2 arquivos de imagem na pasta `/public/` do projeto.
 * 2. Atualize os caminhos abaixo conforme o nome dos seus arquivos.
 * ============================================================================
 */

export const BRANDING_CONFIG = {
  // Nome oficial exibido para acessibilidade (leitores de tela) e metadados
  appName: 'SemPila',

  // Slogan / Descrição
  tagline: 'Controle financeiro pessoal',

  // =========================================================================
  // 1. LOGO DO HEADER (Já com escrita/nome SemPila embutido na imagem)
  // Coloque o arquivo em /public/ e indique o caminho aqui:
  // =========================================================================
  headerLogoUrl: '/logo-header.svg',

  // =========================================================================
  // 2. LOGO DA TELA DE CARREGAMENTO (SPLASH SCREEN com animação de zoom)
  // Coloque o arquivo em /public/ e indique o caminho aqui:
  // =========================================================================
  splashLogoUrl: '/logo-splash.svg',

  // Caminho legado para compatibilidade
  logoUrl: '/logo-splash.svg',

  // Iniciais para fallback caso nenhuma imagem seja informada
  initials: 'SP',

  // Ícone padrão do sistema
  iconUrl: '/icon.svg',
};

