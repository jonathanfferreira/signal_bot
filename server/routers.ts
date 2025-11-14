import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { DEFAULT_ASSETS } from "./marketData";
import { schedulerRouter } from "./routers/scheduler";
import { telegramRouter } from "./routers/telegram";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  scheduler: schedulerRouter,
  telegram: telegramRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rotas de análise de sinais
  signals: router({
    // Buscar sinais recentes
    getRecent: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 50;
        return await db.getRecentSignals(limit);
      }),
    
    // Buscar sinais por ativo
    getByAsset: publicProcedure
      .input(z.object({ symbol: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const limit = input.limit || 20;
        return await db.getSignalsByAsset(input.symbol, limit);
      }),
    
    // Buscar sinais fortes
    getStrong: publicProcedure
      .input(z.object({ minStrength: z.number().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const minStrength = input?.minStrength || 3;
        const limit = input?.limit || 20;
        return await db.getStrongSignals(minStrength, limit);
      }),
    
    // Buscar sinais por forca minima
    getByStrength: publicProcedure
      .input(z.object({ minStrength: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const limit = input.limit || 50;
        return await db.getStrongSignals(input.minStrength, limit);
      }),
    
    // Analisar ativo em tempo real
    analyze: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .mutation(async ({ input }) => {
        const { fetchShortTermData, fetchLongTermData } = await import('./marketData');
        const { analyzeAndGenerateSignal, determineLongTermTrend } = await import('./analysis');
        
        // Buscar dados de curto e longo prazo
        const shortTermCandles = await fetchShortTermData(input.symbol);
        const longTermCandles = await fetchLongTermData(input.symbol);
        
        if (shortTermCandles.length < 50) {
          throw new Error('Dados insuficientes para análise');
        }
        
        // Determinar tendência de longo prazo
        const longTermTrend = determineLongTermTrend(longTermCandles);
        
        // Analisar e gerar sinal
        const analysis = analyzeAndGenerateSignal(shortTermCandles, input.symbol, longTermTrend);
        
        // Salvar sinal se for forte (não ESPERAR)
        if (analysis.direction !== 'ESPERAR') {
          // Buscar ou criar ativo
          const existingAssets = await db.getAllAssets();
          let assetId = existingAssets.find(a => a.symbol === input.symbol)?.id;
          
          if (!assetId) {
            const defaultAsset = DEFAULT_ASSETS.find(a => a.symbol === input.symbol);
            if (defaultAsset) {
              await db.createAsset({
                symbol: defaultAsset.symbol,
                name: defaultAsset.name,
                category: defaultAsset.category,
                isActive: 1
              });
              // Buscar o ID do ativo recém-criado
              const newAssets = await db.getAllAssets();
              assetId = newAssets.find(a => a.symbol === input.symbol)?.id || 0;
            } else {
              assetId = 0;
            }
          }
          
          await db.createSignal({
            assetId: assetId || 0,
            symbol: input.symbol,
            direction: analysis.direction,
            strength: analysis.strength,
            interval: '5m',
            emaSignal: analysis.details.ema,
            rsiSignal: analysis.details.rsi,
            bbandsSignal: analysis.details.bbands,
            macdSignal: analysis.details.macd,
            longTermTrend: analysis.details.longTermTrend,
            closePrice: analysis.closePrice ? analysis.closePrice.toString() : '0',
            ema9: analysis.indicators.ema9 !== undefined ? analysis.indicators.ema9.toString() : '0',
            ema21: analysis.indicators.ema21 !== undefined ? analysis.indicators.ema21.toString() : '0',
            rsi: analysis.indicators.rsi !== undefined ? analysis.indicators.rsi.toString() : '0',
            macdHist: analysis.indicators.macdHist !== undefined ? analysis.indicators.macdHist.toString() : '0'
          });
        }
        
        return analysis;
      }),
  }),
  
  // Rotas de ativos
  assets: router({
    // Listar todos os ativos
    getAll: publicProcedure.query(async () => {
      return await db.getAllAssets();
    }),
    
    // Listar ativos ativos
    getActive: publicProcedure.query(async () => {
      return await db.getActiveAssets();
    }),
    
    // Criar ativo
    create: protectedProcedure
      .input(z.object({
        symbol: z.string(),
        name: z.string(),
        category: z.enum(['forex', 'crypto', 'stock'])
      }))
      .mutation(async ({ input }) => {
        return await db.createAsset({
          symbol: input.symbol,
          name: input.name,
          category: input.category,
          isActive: 1
        });
      }),
    
    // Atualizar status do ativo
    updateStatus: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        isActive: z.number()
      }))
      .mutation(async ({ input }) => {
        await db.updateAssetStatus(input.assetId, input.isActive);
        return { success: true };
      }),
    
    // Inicializar ativos padrão
    initializeDefaults: publicProcedure
      .mutation(async () => {
        const existingAssets = await db.getAllAssets();
        const { DEFAULT_ASSETS } = await import('./marketData');
        
        for (const asset of DEFAULT_ASSETS) {
          const exists = existingAssets.find(a => a.symbol === asset.symbol);
          if (!exists) {
            await db.createAsset({
              symbol: asset.symbol,
              name: asset.name,
              category: asset.category,
              isActive: 1
            });
          }
        }
        
        return { success: true, count: DEFAULT_ASSETS.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
