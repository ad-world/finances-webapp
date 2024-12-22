import { getHeaderMapping } from "./intelligence.ts";
import { parseCsv } from "./parse.ts";

const sample_transaction = await parseCsv("sample_data/sample_debit.csv");
const header_mapping = await getHeaderMapping(sample_transaction[0]);

console.log(header_mapping);
