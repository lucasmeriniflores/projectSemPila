/**
 * ============================================================================
 * SISTEMA DE NOTIFICAÇÕES PUSH E LEMBRETES DIÁRIOS (SemPila)
 * ============================================================================
 * 
 * Gerencia permissões, agendamento de 2 notificações diárias automáticas
 * (às 10h da manhã e às 20h da noite) com mensagens zoeiras e memes da atualidade.
 * ============================================================================
 */

export interface NotificationConfig {
  enabled: boolean;
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string; // '10:00'
  eveningTime: string; // '20:00'
  lastMorningDate?: string;
  lastEveningDate?: string;
}

export const NOTIFICATION_STORAGE_KEY = 'sempila_notifications_config';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: false,
  morningEnabled: true,
  eveningEnabled: true,
  morningTime: '10:00',
  eveningTime: '20:00',
};

// ============================================================================
// POOL DE NOTIFICAÇÕES PUSH: ZOEIRAS E MEMES FINANCEIROS DA ATUALIDADE
// ============================================================================

export const MORNING_MESSAGES = [
  '🚨 Bom dia CLT! Aquele café com pão de queijo gourmet de R$ 28 custa 2h do seu dia. Abre o SemPila antes do pix!',
  '👀 10h da manhã e você já pensando em delivery? Seu Dinheiro Livre tá mais baixo que a bateria do celular!',
  '💸 "Só se vive uma vez"... Mas a fatura do cartão é vitalícia. Confere seu orçamento no SemPila!',
  '🛑 Para de namorar o carrinho da Shopee e da Shein. Abre o SemPila e encare a sua realidade primeiro!',
  '💅 "Eu mereço esse mimo"... Seus boletos discordam veementemente. Abre o SemPila antes de passar o débito!',
  '☕ O cafezinho gourmet não vai te deixar milionário, mas tá te deixando sem pila. Segura a emoção!',
  '📉 Você não é herdeiro! Registra o pix do almoço antes que o Serasa te dê bom dia.',
  '🛡️ Meta do dia: Sobreviver sem fazer compras por impulso até o meio-dia. Abre o SemPila e foca!',
  '🧠 Mentalidade de tubarão, mas gastando como sardinha no rodízio. Abre o SemPila e ajusta as contas!',
  '📱 Já abriu o SemPila hoje ou tá com medo do fantasma da fatura? Registre os gastos matinais.',
  '💳 Passou no crédito fingindo costume? Anota logo no SemPila pra não chorar quando a fatura fechar!',
  '🍞 Marmita hoje ou falência amanhã? Faça sua escolha e acompanhe seu saldo no SemPila.',
];

export const EVENING_MESSAGES = [
  '🍺 Fechando a comanda do bar? Anota no SemPila agora ou vai fingir amnésia amanhã cedo?',
  '🍔 O combo do iFood tá R$ 94,50 com taxa. Abre a geladeira, faz um ovinho e registra no SemPila!',
  '📉 Hora do balanço: que pix você fez hoje que te afastou mais um ano da sua aposentadoria?',
  '💀 Seu saldo mandou avisar que se você passar mais um débito por aproximação hoje, ele cancela a conta.',
  '🛌 Vai dormir sem registrar os gastos de hoje? Amanhã a conta não bate e a culpa não é do seu signo!',
  '💳 "Mês que vem eu recupero"... Faz 8 meses que você repete essa frase. Abre o SemPila e encare os fatos!',
  '🚕 Pediu Uber Comfort em vez de andar duas quadras? Anota no SemPila pra compensar amanhã.',
  '🛒 "Era baratinho, tava na promoção"... No fim do mês, 10 compras de R$ 30 viram R$ 300 a menos!',
  '🌙 Fim de expediente! Abra o SemPila, anote as despesas do dia e durma com a consciência limpa.',
  '📊 O mês tá no começo e o seu dinheiro já tá no fim? Registre os gastos de hoje e reassuma o controle!',
  '🍕 Sextou com dívida não é estilo de vida! Registre seus gastos antes de pedir a sobremesa.',
  '🧾 Não deixe pra amanhã o comprovante que você pode registrar no SemPila hoje!',
];

// ============================================================================
// CARREGAR E SALVAR CONFIGURAÇÃO
// ============================================================================

export function loadNotificationConfig(): NotificationConfig {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_CONFIG;
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_NOTIFICATION_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load notification config:', err);
  }
  return DEFAULT_NOTIFICATION_CONFIG;
}

export function saveNotificationConfig(config: NotificationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save notification config:', err);
  }
}

// ============================================================================
// PERMISSÕES & DISPARO DE PUSH
// ============================================================================

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export async function sendNotification(title: string, body: string): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag: 'sempila-reminder',
    vibrate: [150, 80, 150] as any,
    data: { url: '/' },
  };

  try {
    // 1. Tenta prioritariamente via Service Worker (Push padrão de PWA para celular e desktop)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    // 2. Fallback via construtor nativo Notification
    new Notification(title, options);
    return true;
  } catch (err) {
    console.error('Error displaying notification via SW, trying fallback:', err);
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// MENSAGENS ALEATÓRIAS
// ============================================================================

export function getRandomMessage(timeOfDay: 'morning' | 'evening'): string {
  const list = timeOfDay === 'morning' ? MORNING_MESSAGES : EVENING_MESSAGES;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

// ============================================================================
// VERIFICADOR DE AGENDAMENTO (Executado a cada 30 segundos no app)
// ============================================================================

export function checkAndTriggerScheduledNotifications(): void {
  if (typeof window === 'undefined' || !isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const config = loadNotificationConfig();
  if (!config.enabled) return;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const todayDateStr = now.toISOString().split('T')[0];

  let configUpdated = false;

  // 1. Notificação da Manhã (10:00)
  if (config.morningEnabled) {
    const isTimeToMorning = currentTimeStr === config.morningTime;
    const notSentToday = config.lastMorningDate !== todayDateStr;

    if (isTimeToMorning && notSentToday) {
      const msg = getRandomMessage('morning');
      sendNotification('SemPila • Lembrete Matinal ☀️', msg);
      config.lastMorningDate = todayDateStr;
      configUpdated = true;
    }
  }

  // 2. Notificação da Noite (20:00)
  if (config.eveningEnabled) {
    const isTimeToEvening = currentTimeStr === config.eveningTime;
    const notSentToday = config.lastEveningDate !== todayDateStr;

    if (isTimeToEvening && notSentToday) {
      const msg = getRandomMessage('evening');
      sendNotification('SemPila • Fechamento do Dia 🌙', msg);
      config.lastEveningDate = todayDateStr;
      configUpdated = true;
    }
  }

  if (configUpdated) {
    saveNotificationConfig(config);
  }
}
