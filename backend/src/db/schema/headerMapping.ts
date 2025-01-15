import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core"

export const headerMapping = sqliteTable("headerMapping", {
    id: integer().primaryKey({ autoIncrement: true }),
    unmappedHeaders: text().notNull().unique(),
    mappedHeaders: text().notNull(),
    createdAt: integer().notNull().$defaultFn(() => Date.now()),
}, t => [index("unmapped_headers_index").on(t.unmappedHeaders)]);

