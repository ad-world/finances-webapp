import { z } from "zod";

export const transactionSchema = z.object({
    "currency": z.string(),
    "account_type": z.string(),
    "description": z.string(),
    "transaction_date": z.string(),
    "transaction_type": z.string(),
    "amount": z.number(),
  });

export const descriptionSchema = z.object({
  "merchant": z.string(),
  "category": z.string(),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
export type DescriptionSchema = z.infer<typeof descriptionSchema>;

  