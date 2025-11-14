/**
 * Módulo de análise técnica de ativos financeiros
 * Implementa os indicadores: EMA, RSI, BBANDS, MACD
 */

export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  ema9: number;
  ema21: number;
  rsi: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  macdHist: number;
}

export interface SignalDetails {
  ema: string;
  rsi: string;
  bbands: string;
  macd: string;
  longTermTrend: string;
}

export interface AnalysisResult {
  asset: string;
  direction: "CALL" | "PUT" | "ESPERAR";
  strength: number;
  details: SignalDetails;
  indicators: IndicatorValues;
  closePrice: number;
}

/**
 * Calcula a Média Móvel Exponencial (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Primeira EMA é a média simples
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  ema[period - 1] = sum / period;
  
  // Calcular EMA para o resto
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }
  
  return ema;
}

/**
 * Calcula o Índice de Força Relativa (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const changes: number[] = [];
  
  // Calcular mudanças de preço
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  // Separar ganhos e perdas
  const gains: number[] = changes.map(c => c > 0 ? c : 0);
  const losses: number[] = changes.map(c => c < 0 ? -c : 0);
  
  // Calcular médias iniciais
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Primeiro RSI
  let rs = avgGain / avgLoss;
  rsi[period] = 100 - (100 / (1 + rs));
  
  // Calcular RSI para o resto
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rs = avgGain / avgLoss;
    rsi[i + 1] = 100 - (100 / (1 + rs));
  }
  
  return rsi;
}

/**
 * Calcula as Bandas de Bollinger (BBANDS)
 */
export function calculateBBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    middle[i] = mean;
    upper[i] = mean + (std * stdDev);
    lower[i] = mean - (std * stdDev);
  }
  
  return { upper, middle, lower };
}

/**
 * Calcula o MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (emaFast[i] !== undefined && emaSlow[i] !== undefined) {
      macd[i] = emaFast[i] - emaSlow[i];
    }
  }
  
  const signal = calculateEMA(macd.filter(v => v !== undefined), signalPeriod);
  const histogram: number[] = [];
  
  let signalIndex = 0;
  for (let i = 0; i < macd.length; i++) {
    if (macd[i] !== undefined && signal[signalIndex] !== undefined) {
      histogram[i] = macd[i] - signal[signalIndex];
      signalIndex++;
    }
  }
  
  return { macd, signal, histogram };
}

/**
 * Analisa os dados e gera sinal de confluência
 */
export function analyzeAndGenerateSignal(
  candles: Candle[],
  symbol: string,
  longTermTrend: "CALL" | "PUT" | "NEUTRO"
): AnalysisResult {
  const closePrices = candles.map(c => c.close);
  
  // Calcular indicadores
  const ema9 = calculateEMA(closePrices, 9);
  const ema21 = calculateEMA(closePrices, 21);
  const rsi = calculateRSI(closePrices, 14);
  const bbands = calculateBBands(closePrices, 20, 2);
  const macd = calculateMACD(closePrices, 12, 26, 9);
  
  // Pegar última vela
  const lastIndex = closePrices.length - 1;
  const close = closePrices[lastIndex];
  const lastEma9 = ema9[lastIndex];
  const lastEma21 = ema21[lastIndex];
  const lastRsi = rsi[lastIndex];
  const lastBbUpper = bbands.upper[lastIndex];
  const lastBbLower = bbands.lower[lastIndex];
  const lastBbMiddle = bbands.middle[lastIndex];
  const lastMacdHist = macd.histogram[lastIndex];
  
  let pontosCall = 0;
  let pontosPut = 0;
  
  const details: SignalDetails = {
    ema: "NEUTRO",
    rsi: "NEUTRO",
    bbands: "NEUTRO",
    macd: "NEUTRO",
    longTermTrend
  };
  
  // 1. EMA
  if (lastEma9 > lastEma21) {
    pontosCall++;
    details.ema = "CALL";
  } else if (lastEma9 < lastEma21) {
    pontosPut++;
    details.ema = "PUT";
  }
  
  // 2. RSI
  if (lastRsi > 50 && lastRsi < 70) {
    pontosCall++;
    details.rsi = "CALL";
  } else if (lastRsi > 30 && lastRsi < 50) {
    pontosPut++;
    details.rsi = "PUT";
  }
  
  // 3. BBANDS (Reversão)
  if (close <= lastBbLower) {
    pontosCall++;
    details.bbands = "CALL";
  } else if (close >= lastBbUpper) {
    pontosPut++;
    details.bbands = "PUT";
  }
  
  // 4. MACD
  if (lastMacdHist > 0) {
    pontosCall++;
    details.macd = "CALL";
  } else if (lastMacdHist < 0) {
    pontosPut++;
    details.macd = "PUT";
  }
  
  // Determinar sinal final com diferentes níveis de força
  let finalDirection: "CALL" | "PUT" | "ESPERAR" = "ESPERAR";
  let finalStrength = 0;
  
  // Sinais FORTES: 3-4 pontos + tendência alinhada
  if (pontosCall >= 3 && pontosCall > pontosPut && longTermTrend === "CALL") {
    finalDirection = "CALL";
    finalStrength = pontosCall;
  } else if (pontosPut >= 3 && pontosPut > pontosCall && longTermTrend === "PUT") {
    finalDirection = "PUT";
    finalStrength = pontosPut;
  }
  // Sinais MÉDIOS: 2 pontos + tendência alinhada
  else if (pontosCall === 2 && pontosCall > pontosPut && longTermTrend === "CALL") {
    finalDirection = "CALL";
    finalStrength = pontosCall;
  } else if (pontosPut === 2 && pontosPut > pontosCall && longTermTrend === "PUT") {
    finalDirection = "PUT";
    finalStrength = pontosPut;
  }
  // Sinais FRACOS: 2 pontos sem filtro de tendência (apenas melhor que o oposto)
  else if (pontosCall === 2 && pontosCall > pontosPut) {
    finalDirection = "CALL";
    finalStrength = pontosCall;
  } else if (pontosPut === 2 && pontosPut > pontosCall) {
    finalDirection = "PUT";
    finalStrength = pontosPut;
  }
  
  return {
    asset: symbol,
    direction: finalDirection,
    strength: finalStrength,
    details,
    indicators: {
      ema9: lastEma9,
      ema21: lastEma21,
      rsi: lastRsi,
      bbUpper: lastBbUpper,
      bbMiddle: lastBbMiddle,
      bbLower: lastBbLower,
      macdHist: lastMacdHist
    },
    closePrice: close
  };
}

/**
 * Determina a tendência de longo prazo usando EMA 50
 */
export function determineLongTermTrend(candles: Candle[]): "CALL" | "PUT" | "NEUTRO" {
  if (candles.length < 50) return "NEUTRO";
  
  const closePrices = candles.map(c => c.close);
  const ema50 = calculateEMA(closePrices, 50);
  
  const lastIndex = closePrices.length - 1;
  const lastClose = closePrices[lastIndex];
  const lastEma50 = ema50[lastIndex];
  
  if (lastClose > lastEma50) return "CALL";
  if (lastClose < lastEma50) return "PUT";
  return "NEUTRO";
}
