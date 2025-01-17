import { expect, test, describe, beforeEach, afterEach, afterAll } from "bun:test";
import { TestDb } from "./testDb";
import { getHeaderMappings, getTransactions, insertHeaderMapping, insertTransaction } from "../src/db/db";
import type { TransactionSchema } from "../src/types/transaction";

describe("Database Operations", () => {
    const testDb = new TestDb();

    beforeEach(async () => {
        await testDb.setup();
    });

    afterEach(async () => {
        await testDb.clearTables();
    });

    afterAll(async () => {
        await testDb.cleanup();
    });

    describe("insertHeaderMapping", () => {
        test("should insert header mapping successfully", async () => {
            const unmappedHeaders = {
                "Date": "transaction_date2",
                "Description": "description2",
                "Amount": "amount2"
            };
            const mappedHeaders = {
                "transaction_date": "Date",
                "description": "Description",
                "amount": "Amount",
                "account_type": "account_type",
                "currency": "currency",
                "transaction_type": "transaction_type"
            };

            const currentMappings = await getHeaderMappings(testDb.db);
            expect(currentMappings.length).toBe(0);

            const result = await insertHeaderMapping(unmappedHeaders, mappedHeaders, testDb.db);
            expect(result).toBeDefined();

            expect((await getHeaderMappings(testDb.db)).length).toBe(1);
        });
    });

    describe("insertTransaction", () => {
        test("should insert transaction successfully", async () => {
            const transaction: TransactionSchema = {
                currency: "USD",
                account_type: "checking",
                description: "Test transaction",
                transaction_date: "2024-01-01",
                transaction_type: "debit",
                amount: 100.00
            };

            const currentTransactions = await getTransactions(testDb.db);
            expect(currentTransactions.length).toBe(0);

            const result = await insertTransaction(transaction, "test_platform", testDb.db);
            expect(result).toBeDefined();
            expect((await getTransactions(testDb.db)).length).toBe(1);
        });

        test("should handle duplicate transactions", async () => {
            const transaction: TransactionSchema = {
                currency: "USD",
                account_type: "checking",
                description: "Test transaction",
                transaction_date: "2024-01-01",
                transaction_type: "debit",
                amount: 100.00
            };

            const currentTransactions = await getTransactions(testDb.db);
            expect(currentTransactions.length).toBe(0);

            await insertTransaction(transaction, "test_platform", testDb.db);
            
            try {
                await insertTransaction(transaction, "test_platform", testDb.db);
                expect(false).toBe(true); // Should not reach here
            } catch (error) {
                expect(error).toBeDefined();
            }

            expect((await getTransactions(testDb.db)).length).toBe(1);
        });
    });
}); 