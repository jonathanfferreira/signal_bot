import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { assets, signals, userSettings, userAssets, InsertAsset, InsertSignal, InsertUserSettings, InsertUserAsset } from "../drizzle/schema";
import { desc } from "drizzle-orm";

// === ASSETS ===
export async function getAllAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assets);
}

export async function getActiveAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assets).where(eq(assets.isActive, 1));
}

export async function createAsset(asset: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assets).values(asset);
  return result;
}

export async function updateAssetStatus(assetId: number, isActive: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(assets).set({ isActive }).where(eq(assets.id, assetId));
}

// === SIGNALS ===
export async function createSignal(signal: InsertSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signals).values(signal);
  return result;
}

export async function getRecentSignals(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(signals).orderBy(desc(signals.createdAt)).limit(limit);
}

export async function getSignalsByAsset(assetSymbol: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(signals)
    .where(eq(signals.symbol, assetSymbol))
    .orderBy(desc(signals.createdAt))
    .limit(limit);
}

export async function getStrongSignals(minStrength: number = 3, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(signals)
    .where(eq(signals.strength, minStrength))
    .orderBy(desc(signals.createdAt))
    .limit(limit);
}

// === USER SETTINGS ===
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createUserSettings(settings: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userSettings).values(settings);
  return result;
}

export async function updateUserSettings(userId: number, settings: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userSettings).set(settings).where(eq(userSettings.userId, userId));
}

// === USER ASSETS ===
export async function getUserAssets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(userAssets)
    .leftJoin(assets, eq(userAssets.assetId, assets.id))
    .where(eq(userAssets.userId, userId));
}

export async function addUserAsset(userId: number, assetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userAssets).values({ userId, assetId });
  return result;
}

export async function removeUserAsset(userId: number, assetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userAssets)
    .where(eq(userAssets.userId, userId));
}
