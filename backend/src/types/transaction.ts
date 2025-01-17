import { z } from "zod";

export const transactionSchema = z.object({
    "currency": z.string(),
    "account_type": z.string(),
    "description": z.string(),
    "transaction_date": z.string(),
    "transaction_type": z.string(),
    "amount": z.number(),
  });

export type TransactionSchema = {
  currency: string;
  account_type: string;
  description: string;
  transaction_date: string;
  transaction_type: string;
  amount: number;
}

  