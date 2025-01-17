import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { headerMapping } from './schema/headerMapping';
import { transactions } from './schema/transaction';
import type { TransactionSchema } from '../types/transaction.ts';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';

const client = createClient({
    url: "file:data.db",
});

const db = drizzle({ client });

export const insertHeaderMapping = async (
    unmappedHeaders: Record<string, string>, 
    mappedHeaders: Record<keyof TransactionSchema, unknown>,
    dbInstance: LibSQLDatabase = db
) => {
    const sortedUnmappedHeaders = Object.fromEntries(
        Object.entries(unmappedHeaders).sort(([a], [b]) => a.localeCompare(b))
    );
    const sortedMappedHeaders = Object.fromEntries(
        Object.entries(mappedHeaders).sort(([a], [b]) => a.localeCompare(b))
    );

    return await dbInstance.insert(headerMapping).values({
        unmappedHeaders: JSON.stringify(sortedUnmappedHeaders),
        mappedHeaders: JSON.stringify(sortedMappedHeaders),
    });
}

export const insertTransaction = async (
    transaction: TransactionSchema, 
    accountPlatform: string,
    dbInstance: LibSQLDatabase = db
) => {
    const { currency, account_type, description, transaction_date, transaction_type, amount } = transaction;
    const transactionKey = `${currency}-${account_type}-${transaction_date}-${transaction_type}-${description}-${amount}`;

    return await dbInstance.insert(transactions).values({
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

export const getHeaderMappings = async (dbInstance: LibSQLDatabase = db) => {
    return await dbInstance.select().from(headerMapping);
}

export const getHeaderMappingByUnmappedHeaders = async (sortedUnmappedHeaders: Record<string, string>, dbInstance: LibSQLDatabase = db) => {
    return await dbInstance.select()
        .from(headerMapping)
        .where(eq(headerMapping.unmappedHeaders, JSON.stringify(sortedUnmappedHeaders)))
        .limit(1);
}

export const getTransactions = async (dbInstance: LibSQLDatabase = db) => {
    return await dbInstance.select().from(transactions);
}

export const bulkInsertTransactions = async (txns: TransactionSchema[], dbInstance: LibSQLDatabase = db) => {
    const transformedTransactions = txns.map((transaction) => ({
        transactionKey: `${transaction.currency}-${transaction.account_type}-${transaction.transaction_date}-${transaction.transaction_type}-${transaction.description}-${transaction.amount}`,
        currency: transaction.currency,
        accountPlatform: "TOOD: fix",
        accountType: transaction.account_type,
        description: transaction.description,
        transactionDate: transaction.transaction_date,
        transactionType: transaction.transaction_type,
        amount: transaction.amount,
    }));
    return await dbInstance.insert(transactions).values(transformedTransactions);
}

export default db;