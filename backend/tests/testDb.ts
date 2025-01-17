import { createClient, type Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { join } from "path";
import { transactions } from '../src/db/schema/transaction';
import { headerMapping } from '../src/db/schema/headerMapping';
import { migrate } from 'drizzle-orm/libsql/migrator';

export class TestDb {
    private client: Client;
    public db: LibSQLDatabase;
    private dbPath: string;

    constructor() {
        this.dbPath = join(__dirname, `../test_${Math.random().toString(36).substring(2)}.db`);
        this.client = createClient({
            url: `file:${this.dbPath}`,
        });
        this.db = drizzle(this.client);
    }

    async setup() {
        // Ensure we start with a fresh database
        const file = Bun.file(this.dbPath);
        if (await file.exists()) {
            await file.unlink();
        }

        // Create a new connection
        this.client = createClient({
            url: `file:${this.dbPath}`,
        });
        this.db = drizzle(this.client);

        // Run migrations
        const migrationsFolder = join(__dirname, '../migrations');
        await migrate(this.db, {
            migrationsFolder,
        });
    }

    async clearTables() {
        await this.db.delete(transactions);
        await this.db.delete(headerMapping);
    }

    async cleanup() {
        await this.clearTables();
        this.client.close();
        
        // Delete the test database file
        const file = Bun.file(this.dbPath);
        if (await file.exists()) {
            await file.unlink();
        }
    }
} 