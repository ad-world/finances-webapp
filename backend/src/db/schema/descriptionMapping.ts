import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core"

export const descriptionMapping = sqliteTable("descriptionMapping", {
    id: integer().primaryKey({ autoIncrement: true }),
    uncleanDescription: text().notNull().unique(),
    cleanDescription: text().notNull(),
    category: text().notNull(),
    createdAt: integer().notNull().$defaultFn(() => Date.now()),
}, t => [index("unclean_description_index").on(t.uncleanDescription)]);