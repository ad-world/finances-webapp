import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core"

export const transactions = sqliteTable("transactions", {
    id: integer().primaryKey({ autoIncrement: true }),
    transactionKey: text().unique().notNull(),
    currency: text().notNull(),
    accountPlatform: text(), // RBC, Wealthsimple, etc.
    accountType: text().notNull(), // Checking, Savings, etc.
    description: text().notNull(),
    transactionDate: text().notNull(),
    transactionType: text(), // Purchase, Refund, etc.
    amount: integer().notNull(),
    createdAt: integer().$defaultFn(() => Date.now()).notNull(),
}, t => [index("transaction_key_index").on(t.transactionKey)]);