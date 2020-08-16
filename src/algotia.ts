import { backfill, backfills, backtest, boot } from "./methods/index";
import ccxt from "./wrappers/ccxt";
import {
	BootOptions,
	BootData,
	ConfigOptions,
	BackfillOptions,
	BackfillDocument,
	DeleteBackfillOptions,
	ListBackfillOptions,
	BacktestOptions
} from "./types/index";

export {
	// methods
	boot,
	backfill,
	backtest,
	backfills,
	// types
	BootOptions,
	BootData,
	ConfigOptions,
	BackfillOptions,
	BackfillDocument,
	DeleteBackfillOptions,
	ListBackfillOptions,
	BacktestOptions
};
