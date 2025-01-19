import { join } from "path";
import { parseBunCsv } from "../parse";
import { ingestTransactions } from "../intelligence";

const sampleTransactions = async (): Promise<Record<string, string>[]> => {
    const filePath = join(__dirname, "../../sample_data/amex.csv");
    const file = Bun.file(filePath);
    const transactions = await parseBunCsv(file);

    return transactions;
}

const main = async () => {
    const transactions = await sampleTransactions();
    await ingestTransactions(transactions);
}

main();