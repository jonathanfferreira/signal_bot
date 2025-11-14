import fetch from 'node-fetch';

interface TelegramMessage {
  symbol: string;
  direction: 'CALL' | 'PUT';
  strength: number;
  details?: {
    ema: string;
    rsi: string;
    bbands: string;
    macd: string;
  };
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

/**
 * Formata uma mensagem de sinal para Telegram
 */
function formatSignalMessage(signal: TelegramMessage): string {
  const emoji = signal.direction === 'CALL' ? '📈' : '📉';
  const direction = signal.direction === 'CALL' ? 'COMPRA' : 'VENDA';
  const strength = '⭐'.repeat(signal.strength);

  let message = `${emoji} *NOVO SINAL GERADO*\n\n`;
  message += `*Ativo:* ${signal.symbol}\n`;
  message += `*Direção:* ${direction}\n`;
  message += `*Força:* ${signal.strength}/4 ${strength}\n`;

  if (signal.details) {
    message += `\n*Indicadores:*\n`;
    message += `• EMA: ${signal.details.ema}\n`;
    message += `• RSI: ${signal.details.rsi}\n`;
    message += `• BBANDS: ${signal.details.bbands}\n`;
    message += `• MACD: ${signal.details.macd}\n`;
  }

  message += `\n⏰ ${new Date().toLocaleString('pt-BR')}`;

  return message;
}

/**
 * Envia notificação via Telegram
 */
export async function sendTelegramNotification(signal: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Bot token ou chat ID não configurados');
    return false;
  }

  try {
    const message = formatSignalMessage(signal);
    const url = `${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Telegram] Erro ao enviar mensagem:', error);
      return false;
    }

    console.log(`[Telegram] ✅ Notificação enviada para ${signal.symbol}`);
    return true;
  } catch (error) {
    console.error('[Telegram] Erro ao enviar notificação:', error);
    return false;
  }
}

/**
 * Envia notificação de teste
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Bot token ou chat ID não configurados');
    return false;
  }

  try {
    const url = `${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const message = `✅ *Bot de Sinais Financeiros*\n\nSeu bot está conectado e pronto para enviar notificações!\n\n⏰ ${new Date().toLocaleString('pt-BR')}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Telegram] Erro ao enviar mensagem de teste:', error);
      return false;
    }

    console.log('[Telegram] ✅ Mensagem de teste enviada');
    return true;
  } catch (error) {
    console.error('[Telegram] Erro ao enviar mensagem de teste:', error);
    return false;
  }
}

/**
 * Verifica se Telegram está configurado
 */
export function isTelegramConfigured(): boolean {
  return !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID;
}

/**
 * Obtém informações de configuração (sem expor o token)
 */
export function getTelegramStatus(): {
  configured: boolean;
  chatId?: string;
} {
  return {
    configured: isTelegramConfigured(),
    chatId: TELEGRAM_CHAT_ID ? `${TELEGRAM_CHAT_ID.substring(0, 3)}...` : undefined,
  };
}
