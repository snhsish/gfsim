import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const gfProfile = pgTable(
  "gf_profile",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dateOfBirth: date("dateOfBirth").notNull(),
    nativeLanguage: text("nativeLanguage").notNull(),
    nationality: text("nationality").notNull(),
    isBisexual: boolean("isBisexual").notNull(),
    mbti: text("mbti"),
    zodiacSign: text("zodiacSign").notNull(),
    maturityTier: text("maturityTier").notNull(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [index("gf_profile_userId_idx").on(table.userId)],
);

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  gfProfile: one(gfProfile),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const gfProfileRelations = relations(gfProfile, ({ one }) => ({
  user: one(user, {
    fields: [gfProfile.userId],
    references: [user.id],
  }),
}));

export const chatUsage = pgTable(
  "chat_usage",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    modelId: text("modelId").notNull(),
    inputTokens: integer("inputTokens").notNull().default(0),
    outputTokens: integer("outputTokens").notNull().default(0),
    totalTokens: integer("totalTokens").notNull().default(0),
    cacheReadTokens: integer("cacheReadTokens").notNull().default(0),
    cacheWriteTokens: integer("cacheWriteTokens").notNull().default(0),
    reasoningTokens: integer("reasoningTokens").notNull().default(0),
    finishReason: text("finishReason"),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    index("chat_usage_userId_idx").on(table.userId),
    index("chat_usage_userId_createdAt_idx").on(table.userId, table.createdAt),
    index("chat_usage_modelId_idx").on(table.modelId),
  ],
);

export const chatUsageRelations = relations(chatUsage, ({ one }) => ({
  user: one(user, {
    fields: [chatUsage.userId],
    references: [user.id],
  }),
}));
