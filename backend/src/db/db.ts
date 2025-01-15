import { drizzle } from 'npm:drizzle-orm/libsql';
import { Database } from 'npm:better-sqlite3';
import { headerMapping } from './schema/headerMapping.ts';
import { transactions } from './schema/transaction.ts';
import { Transaction } from '../types/transaction.ts';


const sqlite = new Database('sqlite.db');
const db = drizzle({ client: sqlite });

export const insertHeaderMapping = async (unmappedHeaders: Record<string, string>, mappedHeaders: Record<string, string>) => {
    return await db.insert(headerMapping).values({
        unmappedHeaders: JSON.stringify(unmappedHeaders),
        mappedHeaders: JSON.stringify(mappedHeaders),
    });
}

export const insertTransaction = async (transaction: Transaction, accountPlatform: string) => {
    const { currency, account_type, description, transaction_date, transaction_type, amount } = transaction;
    const transactionKey = `${currency}-${account_type}-${transaction_date}-${transaction_type}-${description}-${amount}`;

    return await db.insert(transactions).values({
        transactionKey,
        currency,
        accountPlatform,
        accountType: account_type,
        description,
        transactionDate: transaction_date,
        transactionType: transaction_type,
        amount,
    });
}

export default db;