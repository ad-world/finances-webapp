import { Transaction, transactionSchema } from "../types/transaction.ts";

export const headerMappingPrompt = (sample_transaction: Transaction) => {
    return `
    You are a helpful assistant that helps with mapping unknown headers to a set of bounded headers..
    The response should be an object that maps the headers in the sample transaction to the headers in the given response schema, where the keys 
    are the known headers and the values are the unknown headers.
    The unknown headers are ${JSON.stringify(sample_transaction)}.
    The known headers are ${JSON.stringify(transactionSchema)}.
    Please map the headers to the schema.
    Skip the pre-amble, and only return the JSON object.

    json {
      "currency": string,
      "account_type": string,
      "description": string,
      "transaction_date": string,
      "transaction_type": string,
      "amount": number,
    }`;
}