import { expect, test, describe } from "bun:test";
import { normalizeTransactions } from "../src/intelligence";

describe("Intelligence", () => {
    describe("normalizeTransactions", () => {
        test("should normalize transactions", () => {
            const txns: Record<string, string>[] = [
                {
                    "txn_date": "2024-01-01",
                    "txn_type": "debit",
                    "txn_amount": "100",
                    "txn_description": "Test Transaction",
                    "txn_currency": "USD",
                    "txn_account_type": "Test Account",
                }
            ]

            const headerMapping = {
                "transaction_date": "txn_date",
                "transaction_type": "txn_type",
                "amount": "txn_amount",
                "description": "txn_description",
                "currency": "txn_currency",
                "account_type": "txn_account_type"

            }

            const normalizedTxns = normalizeTransactions(txns, headerMapping);
            const txn = normalizedTxns[0];
            expect(txn.transaction_date).toBe("2024-01-01");
            expect(txn.transaction_type).toBe("debit");
            expect(txn.amount).toBe(100);
            expect(txn.description).toBe("Test Transaction");
            expect(txn.currency).toBe("USD");
            expect(txn.account_type).toBe("Test Account");
        });
    });
});
