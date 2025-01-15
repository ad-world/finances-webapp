import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core"

export const transactions = sqliteTable("transactions", {
    id: integer().primaryKey({ autoIncrement: true }),
    transactionKey: text().notNull().unique(),
    currency: text().notNull(),
    accountPlatform: text().notNull(), // RBC, Wealthsimple, etc.
    accountType: text().notNull(), // Checking, Savings, etc.
    description: text().notNull(),
    transactionDate: text().notNull(),
    transactionType: text().notNull(), // Purchase, Refund, etc.
    amount: integer().notNull(),
    createdAt: integer().notNull().$defaultFn(() => Date.now()),
}, t => [index("transaction_key_index").on(t.transactionKey)]);