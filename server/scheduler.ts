import cron from 'node-cron';
import { getDb, getAllAssets, createSignal } from './db';
import { fetchShortTermData, fetchLongTermData, DEFAULT_ASSETS } from './marketData';
import { analyzeAndGenerateSignal, determineLongTermTrend } from './analysis';
import { sendTelegramNotification } from './telegram';

interface ScheduledSignal {
  symbol: string;
  direction: 'CALL' | 'PUT';
  strength: number;
  timestamp: Date;
  details: {
    ema: string;
    rsi: string;
    bbands: string;
    macd: string;
  };
}

let lastSignals: Map<string, ScheduledSignal> = new Map();
let analysisInProgress = false;

/**
 * Analisa um ativo e retorna o sinal gerado
 */
async function analyzeAsset(symbol: string): Promise<ScheduledSignal | null> {
  try {
    const shortTermCandles = await fetchShortTermData(symbol);
    const longTermCandles = await fetchLongTermData(symbol);

    if (shortTermCandles.length < 50) {
      return null;
    }

    const longTermTrend = determineLongTermTrend(longTermCandles);
    const analysis = analyzeAndGenerateSignal(shortTermCandles, symbol, longTermTrend);

    if (analysis.direction === 'ESPERAR') {
      return null;
    }

    return {
      symbol,
      direction: analysis.direction,
      strength: analysis.strength,
      timestamp: new Date(),
      details: {
        ema: analysis.details.ema,
        rsi: analysis.details.rsi,
        bbands: analysis.details.bbands,
        macd: analysis.details.macd,
      },
    };
  } catch (error) {
    console.error(`[Scheduler] Erro ao analisar ${symbol}:`, error);
    return null;
  }
}

/**
 * Salva sinal no banco de dados
 */
async function saveSignal(signal: ScheduledSignal): Promise<void> {
  try {
    const existingAssets = await getAllAssets();
    let assetId = existingAssets.find((a: any) => a.symbol === signal.symbol)?.id;

    if (!assetId) {
      const defaultAsset = DEFAULT_ASSETS.find(a => a.symbol === signal.symbol);
      if (defaultAsset) {
        const newAssets = await getAllAssets();
        assetId = newAssets.find((a: any) => a.symbol === signal.symbol)?.id || 0;
      } else {
        assetId = 0;
      }
    }

    await createSignal({
      assetId: assetId || 0,
      symbol: signal.symbol,
      direction: signal.direction,
      strength: signal.strength,
      interval: '5m',
      emaSignal: signal.details.ema,
      rsiSignal: signal.details.rsi,
      bbandsSignal: signal.details.bbands,
      macdSignal: signal.details.macd,
      longTermTrend: 'CALL', // Pode ser melhorado
      closePrice: '0',
      ema9: '0',
      ema21: '0',
      rsi: '0',
      macdHist: '0',
    });
  } catch (error) {
    console.error('[Scheduler] Erro ao salvar sinal:', error);
  }
}

/**
 * Executa análise automática de todos os ativos
 */
async function runAutomaticAnalysis(): Promise<ScheduledSignal[]> {
  if (analysisInProgress) {
    console.log('[Scheduler] Análise já em progresso, pulando ciclo');
    return [];
  }

  analysisInProgress = true;
  const newSignals: ScheduledSignal[] = [];

  try {
    console.log(`[Scheduler] Iniciando análise automática em ${new Date().toLocaleTimeString('pt-BR')}`);

    for (const asset of DEFAULT_ASSETS) {
      const signal = await analyzeAsset(asset.symbol);

      if (signal) {
        // Verificar se é um novo sinal (não foi visto antes)
        const lastSignal = lastSignals.get(asset.symbol);
        const isNewSignal =
          !lastSignal ||
          lastSignal.direction !== signal.direction ||
          lastSignal.strength !== signal.strength;

        if (isNewSignal) {
          console.log(
            `[Scheduler] ✅ Novo sinal: ${signal.symbol} - ${signal.direction} (Força: ${signal.strength})`
          );
          newSignals.push(signal);
          lastSignals.set(signal.symbol, signal);

          // Salvar sinal no banco de dados
          await saveSignal(signal);

          // Enviar notificação via Telegram
          await sendTelegramNotification({
            symbol: signal.symbol,
            direction: signal.direction,
            strength: signal.strength,
            details: signal.details,
          });
        }
      }
    }

    if (newSignals.length > 0) {
      console.log(`[Scheduler] ${newSignals.length} novo(s) sinal(is) gerado(s)`);
    } else {
      console.log('[Scheduler] Nenhum novo sinal gerado');
    }
  } catch (error) {
    console.error('[Scheduler] Erro durante análise automática:', error);
  } finally {
    analysisInProgress = false;
  }

  return newSignals;
}

/**
 * Inicia o scheduler de análise automática
 * Executa a cada 5 minutos
 */
export function startScheduler(): void {
  console.log('[Scheduler] Iniciando scheduler de análise automática...');

  // Executar análise a cada 5 minutos (*/5 * * * *)
  cron.schedule('*/5 * * * *', async () => {
    await runAutomaticAnalysis();
  });

  // Executar análise inicial após 10 segundos
  setTimeout(async () => {
    console.log('[Scheduler] Executando análise inicial...');
    await runAutomaticAnalysis();
  }, 10000);

  console.log('[Scheduler] Scheduler iniciado! Próxima análise em até 5 minutos.');
}

/**
 * Para o scheduler
 */
export function stopScheduler(): void {
  const tasks = cron.getTasks();
  tasks.forEach((task: any) => task.stop());
  console.log('[Scheduler] Scheduler parado');
}

/**
 * Retorna os últimos sinais gerados
 */
export function getLastSignals(): ScheduledSignal[] {
  return Array.from(lastSignals.values());
}

/**
 * Retorna informações do scheduler
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  totalAssets: number;
  lastSignals: ScheduledSignal[];
  lastAnalysisTime?: Date;
} {
  const tasks = cron.getTasks();
  return {
    isRunning: (tasks as any).length > 0,
    totalAssets: DEFAULT_ASSETS.length,
    lastSignals: getLastSignals(),
  };
}
