import { OpenAI } from "openai";
import type { DescriptionSchema, TransactionSchema } from "./types/transaction.ts";
import { descriptionPrompt, headerMappingPrompt } from "./prompts/index.ts";
import { bulkInsertTransactions, getDescriptionMappingByUnmappedDescription, getHeaderMappingByUnmappedHeaders, insertDescriptionMapping, insertHeaderMapping } from "./db/db.ts";
import pThrottle from 'p-throttle';
import { generateJsonWithRetry } from "./util.ts";


export const getHeaderMapping = async (sample_transaction: Record<string, string>) => {
    const prompt = headerMappingPrompt(sample_transaction);
    const response = await generateJsonWithRetry<Record<keyof TransactionSchema, string>>(prompt);
    if (!response) {
        throw new Error("Failed to generate header mapping");
    }
    return response;
};

export const normalizeTransactions = (transactions: Record<string, string>[], headerMapping: Record<keyof TransactionSchema, string>): TransactionSchema[] => {
  const normalizedTransactions = transactions.map((transaction) => {
    const normalizedTransaction: TransactionSchema = {
      currency: transaction[headerMapping.currency] ?? "CAD",
      account_type: transaction[headerMapping.account_type] ?? "Credit",
      description: transaction[headerMapping.description] ?? "Unknown",
      transaction_date: transaction[headerMapping.transaction_date] ?? new Date().toISOString(),
      transaction_type: transaction[headerMapping.transaction_type] ?? "Unknown",
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

export const getDescriptionMapping = async (description: string) => {
  const prompt = descriptionPrompt(description);
  const response = await generateJsonWithRetry<DescriptionSchema>(prompt);
  if (!response) {
    throw new Error("Failed to generate description mapping");
  }

  return response;
}

export const getOrCreateDescriptionMapping = async (description: string): Promise<DescriptionSchema> => {
  const existingDescriptionMapping = await getDescriptionMappingByUnmappedDescription(description);
  if (existingDescriptionMapping.length > 0) {
    return {
      merchant: existingDescriptionMapping[0].cleanDescription,
      category: existingDescriptionMapping[0].category,
    }
  }

  const descriptionMapping = await getDescriptionMapping(description);
  console.log("created description mapping");

  await insertDescriptionMapping(description, descriptionMapping);
  
  return descriptionMapping;
}

export const classifyDescriptions = async (transactions: TransactionSchema[]) => {
  const descriptions = transactions.map((transaction) => transaction.description);
  const throttle = pThrottle({
    limit: 30,
    interval: 60 * 1000
  });
  
  await Promise.all(descriptions.map(throttle(getOrCreateDescriptionMapping)));
}


export const ingestTransactions = async (transactions: Record<string, string>[]) => {
  const sampleTransaction = transactions[0];
  const headerMapping = await getOrCreateHeaderMapping(sampleTransaction);
  const normalizedTransactions = normalizeTransactions(transactions, headerMapping);

  await bulkInsertTransactions(normalizedTransactions);
  await classifyDescriptions(normalizedTransactions);

  return normalizedTransactions;
};