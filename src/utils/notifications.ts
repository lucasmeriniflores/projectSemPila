/**
 * ============================================================================
 * SISTEMA DE NOTIFICAÇÕES E LEMBRETES DIÁRIOS (SemPila)
 * ============================================================================
 * 
 * Gerencia permissões, agendamento de 2 notificações diárias (10h e 20h)
 * e presets de mensagens zoeiras da atualidade.
 * ============================================================================
 */

export type NotificationPreset = 'zoeira' | 'paoduro' | 'coach';

export interface NotificationConfig {
  enabled: boolean;
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string; // '10:00'
  eveningTime: string; // '20:00'
  preset: NotificationPreset;
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
  preset: 'zoeira',
};

// ============================================================================
// PRESETS DE MENSAGENS ZOEIRAS E ATUAIS
// ============================================================================

export const NOTIFICATION_PRESETS: Record<
  NotificationPreset,
  {
    name: string;
    description: string;
    morningMessages: string[];
    eveningMessages: string[];
  }
> = {
  zoeira: {
    name: 'Zoeira Sem Dó (Recomendado)',
    description: 'Sinceridade extrema, memes e choque de realidade para não gastar à toa.',
    morningMessages: [
      '🚨 Bom dia CLT! Lembra que aquele café de R$ 25 custa 2h do seu trabalho. Abre o SemPila antes do pix!',
      '👀 Tá pensando em pedir delivery às 10h? Seu Dinheiro Livre tá mais baixo que autoestima na segunda!',
      '💸 "Só se vive uma vez"... mas a fatura do cartão é vitalícia. Confere o orçamento no SemPila!',
      '🛑 Para de olhar a Shein e a Shopee. Abre o SemPila e encare sua realidade primeiro!',
      '💅 "Eu mereço esse mimo"... Seus boletos discordam veementemente. Abre o SemPila antes de passar o débito!',
      '☕ O cafezinho gourmet não vai te deixar rico, mas com certeza tá te deixando liso. Segura a emoção!',
    ],
    eveningMessages: [
      '🍺 Fechando a conta do bar? Anota no SemPila ou vai fingir amnésia quando a fatura fechar?',
      '🍔 O combo do iFood tá R$ 89,90. Faça um miojo com ovo e anote seus gastos no SemPila!',
      '📉 Hora do acerto de contas: que pix você fez hoje que te afastou de ser herdeiro?',
      '💀 Seu saldo no SemPila mandou avisar que se você passar mais um débito por aproximação, ele entra em greve.',
      '🛌 Vai dormir sem registrar os gastos de hoje? Amanhã a conta não fecha e a culpa não é do signo!',
      '💳 "Passa no crédito que mês que vem eu vejo". O mês que vem chegou, meu parceiro. Anota no SemPila!',
    ],
  },
  paoduro: {
    name: 'Pão-Duro Extremo',
    description: 'Foco total em segurar a carteira e cortar qualquer centavo desnecessário.',
    morningMessages: [
      '🪙 Cada centavo economizado é um passo a mais pro seu primeiro milhão. Marmita e SemPila hoje!',
      '🍞 Café de R$ 15 na padaria? Em casa custa R$ 0,50. Foco nas suas metas no SemPila!',
      '🚫 Taxa de entrega de R$ 8? Ande 2 quadras e economize. Seu saldo agradece!',
      '💡 Dia de zero gastos supérfluos. Abra o SemPila e acompanhe seu dinheiro livre.',
    ],
    eveningMessages: [
      '💰 Fechamento do dia: Sobrou dinheiro hoje ou você fraquejou? Registre tudo no SemPila.',
      '🔒 Cartão guardado na gaveta com sucesso? Registre o balanço do dia antes de dormir.',
      '📉 A melhor compra de hoje foi aquela que você NÃO fez. Anote seus gastos no SemPila.',
      '🛡️ Proteja seu patrimônio. Não durma sem checar o que ainda resta para o mês!',
    ],
  },
  coach: {
    name: 'Coach Irônico',
    description: 'Frases de efeito motivacionais com um toque sutil de deboche.',
    morningMessages: [
      '🧠 Mentalidade de tubarão, mas gastando que nem sardinha? Abre o SemPila e alinhe seu mindset.',
      '🚀 O foguete não tem ré... mas o cheque especial tem juros diários. Cuidado com o pix matinal!',
      '✨ Gratidão pelo boleto pago! Agora controle o restante no SemPila antes que a abundância acabe.',
      '🎯 O sucesso financeiro é construído no dia a dia. Comece abrindo seu SemPila hoje!',
    ],
    eveningMessages: [
      '🏆 Venceu mais um dia sem comprar curso de marketing digital? Registre seus gastos reais no SemPila.',
      '🔮 O universo conspira a favor de quem anota os gastos antes de dormir. Faça seu registro diário!',
      '💎 Resiliência financeira: o quanto você resistiu às tentações do consumo hoje? Confira no app.',
      '📈 Mais um dia construindo seu império financeiro. Abra o SemPila e feche o balanço!',
    ],
  },
};

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
// SOLICITAÇÃO DE PERMISSÃO & DISPARO
// ============================================================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
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

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function sendNotification(title: string, body: string): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag: 'sempila-reminder',
    data: { url: '/' },
  };

  try {
    // Tenta via Service Worker para suporte robusto no celular / PWA
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    // Fallback nativo
    new Notification(title, options);
    return true;
  } catch (err) {
    console.error('Error displaying notification:', err);
    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// MENSAGENS ALEATÓRIAS POR PERÍODO
// ============================================================================

export function getRandomMessage(preset: NotificationPreset, timeOfDay: 'morning' | 'evening'): string {
  const bundle = NOTIFICATION_PRESETS[preset] || NOTIFICATION_PRESETS.zoeira;
  const list = timeOfDay === 'morning' ? bundle.morningMessages : bundle.eveningMessages;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

// ============================================================================
// VERIFICADOR DE AGENDAMENTO (Executado periodicamente no app)
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
      const msg = getRandomMessage(config.preset, 'morning');
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
      const msg = getRandomMessage(config.preset, 'evening');
      sendNotification('SemPila • Fechamento do Dia 🌙', msg);
      config.lastEveningDate = todayDateStr;
      configUpdated = true;
    }
  }

  if (configUpdated) {
    saveNotificationConfig(config);
  }
}
