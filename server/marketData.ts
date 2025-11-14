/**
 * Módulo de integração com Yahoo Finance API para buscar dados de mercado
 */

import fetch from 'node-fetch';
import { Candle } from './analysis';

export interface MarketDataOptions {
  symbol: string;
  interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
}

/**
 * Busca dados históricos de um ativo usando Yahoo Finance API
 */
export async function fetchMarketData(options: MarketDataOptions): Promise<Candle[]> {
  try {
    const { symbol, interval, period } = options;
    
    const period1 = Math.floor(getPeriodStartDate(period).getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    
    // Mapear intervalo para formato da API
    const intervalMap: Record<string, string> = {
      '1m': '1m',
      '2m': '2m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '60m': '60m',
      '90m': '90m',
      '1h': '1h',
      '1d': '1d',
      '5d': '5d',
      '1wk': '1wk',
      '1mo': '1mo',
      '3mo': '3mo'
    };
    
    const apiInterval = intervalMap[interval] || '5m';
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${apiInterval}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Erro ao buscar dados de ${symbol}: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json() as any;
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.warn(`Dados vazios para ${symbol}`);
      return [];
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    if (!timestamps || !quotes) {
      console.warn(`Formato de dados inválido para ${symbol}`);
      return [];
    }
    
    // Converter para formato Candle
    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      // Pular velas com dados inválidos
      if (!quotes.open[i] || !quotes.high[i] || !quotes.low[i] || !quotes.close[i]) {
        continue;
      }
      
      candles.push({
        timestamp: new Date(timestamps[i] * 1000),
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: quotes.close[i],
        volume: quotes.volume[i] || 0
      });
    }

    return candles;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${options.symbol}:`, error);
    return [];
  }
}

/**
 * Converte período em data de início
 */
function getPeriodStartDate(period: string): Date {
  const now = new Date();
  const date = new Date(now);
  
  switch (period) {
    case '1d':
      date.setDate(date.getDate() - 1);
      break;
    case '5d':
      date.setDate(date.getDate() - 5);
      break;
    case '1mo':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3mo':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6mo':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case '2y':
      date.setFullYear(date.getFullYear() - 2);
      break;
    case '5y':
      date.setFullYear(date.getFullYear() - 5);
      break;
    case '10y':
      date.setFullYear(date.getFullYear() - 10);
      break;
    case 'ytd':
      date.setMonth(0);
      date.setDate(1);
      break;
    case 'max':
      date.setFullYear(1970);
      break;
    default:
      date.setDate(date.getDate() - 5);
  }
  
  return date;
}

/**
 * Busca dados de curto prazo (5m)
 */
export async function fetchShortTermData(symbol: string): Promise<Candle[]> {
  return fetchMarketData({
    symbol,
    interval: '5m',
    period: '5d'
  });
}

/**
 * Busca dados de longo prazo (1h)
 */
export async function fetchLongTermData(symbol: string): Promise<Candle[]> {
  return fetchMarketData({
    symbol,
    interval: '1h',
    period: '1mo'
  });
}

/**
 * Lista de ativos padrão para monitoramento
 */
export const DEFAULT_ASSETS = [
  { symbol: "EURUSD=X", name: "EUR/USD", category: "forex" as const },
  { symbol: "GBPUSD=X", name: "GBP/USD", category: "forex" as const },
  { symbol: "USDJPY=X", name: "USD/JPY", category: "forex" as const },
  { symbol: "AUDUSD=X", name: "AUD/USD", category: "forex" as const },
  { symbol: "USDCAD=X", name: "USD/CAD", category: "forex" as const },
  { symbol: "EURJPY=X", name: "EUR/JPY", category: "forex" as const },
  { symbol: "NZDUSD=X", name: "NZD/USD", category: "forex" as const },
  { symbol: "USDCHF=X", name: "USD/CHF", category: "forex" as const },
  { symbol: "AUDJPY=X", name: "AUD/JPY", category: "forex" as const },
  { symbol: "EURGBP=X", name: "EUR/GBP", category: "forex" as const },
  { symbol: "GBPJPY=X", name: "GBP/JPY", category: "forex" as const },
  { symbol: "BTC-USD", name: "Bitcoin", category: "crypto" as const },
];
