import { transactionSchema } from "../types/transaction.ts";

export const headerMappingPrompt = (sample_transaction: Record<string, string>) => {
    return `
    You are a helpful assistant that helps with mapping unknown headers to a set of bounded headers..
    The response should be an object that maps the headers in the sample transaction to the headers in the given response schema, where the keys 
    are the known headers and the values are the unknown headers.
    The unknown headers are ${JSON.stringify(sample_transaction)}.
    The known headers are ${JSON.stringify(transactionSchema)}.

    If you are unable to map a header, set the value to null. However, there should always be exaclty six keys in the response, and those are defined above and below.

    Please map the headers to the schema.
    Skip the pre-amble, and only return the JSON object.

    json {
      "currency": string | null,
      "account_type": string | null,
      "description": string | null,
      "transaction_date": string | null,
      "transaction_type": string | null,
      "amount": number | null,
    }`;
}

export const descriptionPrompt = (desc: string) => {
  return `
  <Instructions>
  You are a helpful assistant that helps with mapping unknown credit card descriptions to an object of clean merchant name and category. 
  The response should be an object with a clean description and a category.
  </Instructions>

  <Description>
  The description is ${desc}.
  </Description>
  <Taxonomy>
  The taxonomy for categorization is as follows:
  - Groceries
  - Restaurants
  - Entertainment
  - Shopping
  - Transportation
  - Utilities
  - Health
  - Gas
  - Other
  </Taxonomy>
  <Rules>
  - The merchant name should be a cleaned version of the description. The merchant name (or some version of it) will most likely be in the description.
  - The category should be one of the categories in the taxonomy. If you are unable to categorize the transaction, set the category to "Other".
  - Skip the pre-amble, and only return the JSON object.
  </Rules>

  The response should be in the following format:
  {
    "merchant": string,
    "category": string,
  }`
}