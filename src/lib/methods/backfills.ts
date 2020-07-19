import chalk from "chalk";
import { Collection } from "mongodb";

import {
	ListOptions,
	DeleteOptions,
	BackfillDocument,
	BootData
} from "../../types/index";
import { bail, log } from "../../utils/index";

const { success, info } = log;

// Format metadata for console.table

function BackfillRow(data: BackfillDocument) {
	function format(str: string) {
		const num = parseInt(str, 10);
		return new Date(num).toLocaleString();
	}
	const { name, period, pair, since, until } = data;
	this["name"] = name;
	this.records = data.records.length;
	this.period = period;
	this.pair = pair;
	this["since (formatted)"] = format(since);
	this["until (formatted)"] = format(until);
}

const getBackfillCollection = (bootData: BootData): Collection => {
	try {
		const { db } = bootData;
		const backfillCollection = db.collection("backfill");
		return backfillCollection;
	} catch (err) {
		log(err);
	}
};
// List One
const listOne = async (
	bootData: BootData,
	documentName: string,
	options?: ListOptions
) => {
	try {
		const backfillCollection = getBackfillCollection(bootData);

		const { pretty } = options;
		const oneBackfill = await backfillCollection
			.find({ name: name }, { projection: { _id: 0 } })
			.toArray();

		if (oneBackfill.length !== 0) {
			if (pretty) {
				console.table([new BackfillRow(oneBackfill[0])]);
			} else {
				log(oneBackfill[0]);
			}
		} else {
			log.error(
				`No backfill named ${documentName} saved. Run ${chalk.bold.underline(
					"algotia backfills list"
				)} to see saved documents.`
			);
		}
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

// List all
const listAll = async (bootData: BootData, options?: ListOptions) => {
	try {
		const { db, client } = bootData;
		const backfillCollection = db.collection("backfill");

		const { pretty } = options;

		const allBackfills = backfillCollection.find(
			{},
			{ projection: { _id: 0 } }
		);
		const backfillsArr = await allBackfills.toArray();

		if (backfillsArr.length) {
			let allDocs = [];

			backfillsArr.forEach((doc) => {
				allDocs.push(new BackfillRow(doc));
			});
			if (pretty) {
				console.table(allDocs);
			} else {
				log(allDocs);
			}
		} else {
			log(
				`No backfills saved. Run ${chalk.bold.underline(
					"algotia backfill -h"
				)} for help.`
			);
		}

		await client.close();
		process.exit(0);
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const deleteAll = async (bootData: BootData, options?: DeleteOptions) => {
	try {
		const { verbose } = options;

		const backfillCollection = getBackfillCollection(bootData);

		const allBackfills = backfillCollection.find({});
		const backfillsArr = await allBackfills.toArray();
		const { length } = backfillsArr;
		if (length) {
			if (verbose) {
				info("Deleting the following documents:");
				backfillsArr.forEach((doc) => {
					console.log("     " + doc.name);
				});
			}
			await backfillCollection.drop();
			success(
				`Deleted ${length} ${
					length > 1 ? "documents" : "document"
				} from the database.`
			);
		} else {
			log.error(`No documents to delete.`);
		}
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const deleteOne = async (
	bootData: BootData,
	documentName: string,
	options: DeleteOptions
) => {
	try {
		const { verbose } = options;
		const backfillCollection = getBackfillCollection(bootData);
		const oneBackfill = backfillCollection.find({ name: documentName });
		const backfillsArr = await oneBackfill.toArray();
		const { length } = backfillsArr;
		if (length) {
			if (verbose) info(`Deleting ${documentName}`);
			await backfillCollection.deleteOne({ name: documentName });
			success(`Deleted document ${documentName} from the database.`);
		} else {
			bail(`No documents name ${documentName}.`);
		}
		return backfillsArr;
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const backfills = {
	listOne,
	listAll,
	deleteOne,
	deleteAll
};
export default backfills;
