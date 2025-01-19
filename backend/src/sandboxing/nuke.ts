import { transactions } from "../db/schema/transaction";
import { headerMapping } from "../db/schema/headerMapping";
import db from "../db/db";
import { descriptionMapping } from "../db/schema/descriptionMapping";

const nukeData = async () => {
    await db.delete(transactions);
    const allTransactions = await db.select().from(transactions);
    if (allTransactions.length == 0) {
        console.log("Deleted transactions");
    } else {
        throw new Error("Failed to delete transactions");
    }

    await db.delete(headerMapping);

    const allHeaderMappings = await db.select().from(headerMapping);
    if (allHeaderMappings.length == 0) {
        console.log("Deleted header mappings");
    } else {
        throw new Error("Failed to delete header mappings");
    }

    await db.delete(descriptionMapping);
    const allDescriptionMappings = await db.select().from(descriptionMapping);
    if (allDescriptionMappings.length == 0) {
        console.log("Deleted description mappings");
    } else {
        throw new Error("Failed to delete description mappings");
    }
}

nukeData();
