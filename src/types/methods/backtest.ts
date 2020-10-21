import { SingleBackfillOptions, MultiBackfillOptions } from "./backfill";
import { Exchange } from "../index";
import { ExchangeRecord } from ".";
import { OHLCV, ExchangeID } from "../shared";
import { Balances, Order } from "ccxt";

export interface BaseAndQuoteCurrencies {
	[key: string]: number;
}

export type SingleInitialBalance = BaseAndQuoteCurrencies;
export type MultiInitialBalance<T extends ExchangeID[]> = Partial<
	Record<T[number], BaseAndQuoteCurrencies>
>;

type SingleSyncStrategy = (exchange: BacktestingExchange, data: OHLCV) => void;
type SingleAsyncStrategy = (
	exchange: BacktestingExchange,
	data: OHLCV
) => Promise<void>;

export type SingleStrategy = SingleSyncStrategy | SingleAsyncStrategy;

export type MultiSyncStrategy = (
	exchanges: ExchangeRecord<BacktestingExchange>,
	data: ExchangeRecord<OHLCV>
) => void;

export type MultiAsyncStrategy = (
	exchanges: ExchangeRecord<BacktestingExchange>,
	data: ExchangeRecord<OHLCV>
) => Promise<void>;

export type MultiStrategy = MultiAsyncStrategy | MultiSyncStrategy;

export interface SingleBacktestOptions extends SingleBackfillOptions {
	initialBalance: SingleInitialBalance;
	strategy: SingleStrategy;
}

export interface MultiBacktestOptions extends MultiBackfillOptions {
	initialBalances: MultiInitialBalance<MultiBackfillOptions["exchanges"]>;
	strategy: MultiStrategy;
}

export interface SingleBacktestResults {
	options: SingleBacktestOptions;
	balance: Balances;
	openOrders: Order[];
	closedOrders: Order[];
	errors: string[];
}

export type MultiBacktestResults<
	Opts extends MultiBackfillOptions = MultiBackfillOptions
> = {
	options: Opts;
	balances: Record<Opts["exchanges"][number], Balances>;
	openOrders: Record<Opts["exchanges"][number], Order[]>;
	closedOrders: Record<Opts["exchanges"][number], Order[]>;
	errors: Record<Opts["exchanges"][number], string[]>;
};

type SupportedBackfillMethods =
	| "id"
	| "name"
	| "OHLCVRecordLimit"
	| "fees"
	| "countries"
	| "urls"
	| "version"
	| "has"
	| "timeframes"
	| "timeout"
	| "rateLimit"
	| "userAgent"
	| "headers"
	| "markets"
	| "symbols"
	| "currencies"
	| "marketsById"
	| "proxy"
	| "apiKey"
	| "secret"
	| "password"
	| "uid"
	| "requiredCredentials"
	| "options"
	| "fetchMarkets"
	| "fetchCurrencies"
	| "fetchTicker"
	| "fetchOrderBook"
	| "fetchTrades"
	| "fetchOHLCV"
	| "fetchBalance"
	| "createOrder"
	| "cancelOrder"
	| "editOrder"
	| "fetchOrder"
	| "fetchOpenOrders"
	| "fetchOrders"
	| "fetchMyTrades";

export type BacktestingExchange = Pick<Exchange, SupportedBackfillMethods>;
