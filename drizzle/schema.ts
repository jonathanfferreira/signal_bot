import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de ativos monitorados
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 32 }).notNull().unique(),
  name: text("name").notNull(),
  category: mysqlEnum("category", ["forex", "crypto", "stock"]).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * Tabela de sinais gerados
 */
export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("assetId").notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  direction: mysqlEnum("direction", ["CALL", "PUT", "ESPERAR"]).notNull(),
  strength: int("strength").notNull(), // 0-4 pontos de confluência
  interval: varchar("interval", { length: 16 }).notNull(), // ex: 5m, 1h
  
  // Detalhes dos indicadores
  emaSignal: varchar("emaSignal", { length: 16 }),
  rsiSignal: varchar("rsiSignal", { length: 16 }),
  bbandsSignal: varchar("bbandsSignal", { length: 16 }),
  macdSignal: varchar("macdSignal", { length: 16 }),
  longTermTrend: varchar("longTermTrend", { length: 16 }),
  
  // Valores dos indicadores no momento do sinal
  closePrice: text("closePrice"),
  ema9: text("ema9"),
  ema21: text("ema21"),
  rsi: text("rsi"),
  macdHist: text("macdHist"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

/**
 * Tabela de configurações do usuário
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Configurações de análise
  analysisInterval: varchar("analysisInterval", { length: 16 }).default("5m").notNull(),
  longTermInterval: varchar("longTermInterval", { length: 16 }).default("1h").notNull(),
  minConfluencePoints: int("minConfluencePoints").default(3).notNull(),
  
  // Notificações
  telegramEnabled: int("telegramEnabled").default(0).notNull(),
  telegramBotToken: text("telegramBotToken"),
  telegramChatId: text("telegramChatId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Tabela de ativos favoritos do usuário
 */
export const userAssets = mysqlTable("userAssets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assetId: int("assetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAsset = typeof userAssets.$inferSelect;
export type InsertUserAsset = typeof userAssets.$inferInsert;