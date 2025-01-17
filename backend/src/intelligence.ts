import { OpenAI } from "openai";
import type { TransactionSchema } from "./types/transaction.ts";
import { headerMappingPrompt } from "./prompts/index.ts";
import { bulkInsertTransactions, getHeaderMappingByUnmappedHeaders, insertHeaderMapping } from "./db/db.ts";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL;

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
});

export const getHeaderMapping = async (sample_transaction: Record<string, string>) => {
    const prompt = headerMappingPrompt(sample_transaction);
    const response = await client.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? "{}") as Record<keyof TransactionSchema, string>;
};


export const normalizeTransactions = (transactions: Record<string, string>[], headerMapping: Record<keyof TransactionSchema, string>): TransactionSchema[] => {
  const normalizedTransactions = transactions.map((transaction) => {
    const normalizedTransaction: TransactionSchema = {
      currency: transaction[headerMapping.currency],
      account_type: transaction[headerMapping.account_type],
      description: transaction[headerMapping.description],
      transaction_date: transaction[headerMapping.transaction_date],
      transaction_type: transaction[headerMapping.transaction_type],
      amount: Number(transaction[headerMapping.amount])
    };

    return normalizedTransaction;
  });
  return normalizedTransactions;
};

export const getOrCreateHeaderMapping = async (sampleTransaction: Record<string, string>) => {
  const sortedSampleTransaction = Object.fromEntries(
    Object.entries(sampleTransaction).sort(([a], [b]) => a.localeCompare(b))
  );

  for (const key of Object.keys(sortedSampleTransaction)) {
    sortedSampleTransaction[key] = "placeholder"; // This is so that we don't reclassify the same headers
  }

  const mapping = await getHeaderMappingByUnmappedHeaders(sortedSampleTransaction);
  if (mapping.length > 0) {
    return JSON.parse(mapping[0].mappedHeaders) as Record<keyof TransactionSchema, string>;
  }

  const newMapping = await getHeaderMapping(sortedSampleTransaction);
  await insertHeaderMapping(sortedSampleTransaction, newMapping);
  return newMapping;
};

export const ingestTransactions = async (transactions: Record<string, string>[]) => {
  const sampleTransaction = transactions[0];
  const headerMapping = await getOrCreateHeaderMapping(sampleTransaction);
  const normalizedTransactions = normalizeTransactions(transactions, headerMapping);

  await bulkInsertTransactions(normalizedTransactions);

  return normalizedTransactions;
};