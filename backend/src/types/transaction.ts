import * as zod from "npm:zod";

export const transactionSchema = zod.object({
    "currency": zod.string(),
    "account_type": zod.string(),
    "description": zod.string(),
    "transaction_date": zod.string(),
    "transaction_type": zod.string(),
    "amount": zod.number(),
  });
  
export type Transaction = zod.infer<typeof transactionSchema>;
  