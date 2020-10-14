import { AnyAlgotia, BackfillOptions, Exchange } from "../../../types";
import { parseRedisFlatObj, buildRegexPath } from "../../db";
import { Order } from "ccxt";
import flatten from "flat";
import createFetchBalance from "./fetchBalance";
import { parsePair } from "../../general";

type CancelOrder = (
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
) => Exchange["cancelOrder"];

const createCancelOrder: CancelOrder = (algotia, options, exchange) => {
	return async function cancelOrder(id, symbol?) {
		try {
			const { redis } = algotia;

			const openOrdersPath = `${exchange.id}-open-orders`;
			const closedOrdersPath = `${exchange.id}-closed-orders`;

			const rawOrder = await redis.hgetall(id);
			if (!rawOrder) {
				throw new Error("Could not find an open order with the id " + id);
			}
			const order = parseRedisFlatObj<Order>(rawOrder);

			const canceledOrder: Order = {
				...order,
				status: "canceled",
			};

			const flatCanceledOrder: Record<string, any> = flatten(canceledOrder);

			const fetchBalance = createFetchBalance(algotia, options, exchange);
			const balance = await fetchBalance();
			const [base, quote] = parsePair(options.pair);

			if (order.side === "buy") {
				const quoteBalance = balance[quote];
				const quoteBalancePath = `${exchange.id}-balance:${quote}`;
				await redis.hmset(quoteBalancePath, {
					total: quoteBalance.total,
					used: quoteBalance.used - order.cost,
					free: quoteBalance.free + order.cost,
				});
			} else if (order.side === "sell") {
				const baseBalance = balance[base];
				const baseBalancePath = `${exchange.id}-balance:${base}`;
				await redis.hmset(baseBalancePath, {
					total: baseBalance.total,
					used: baseBalance.used - order.amount,
					free: baseBalance.free + order.amount,
				});
			}

			await redis.hmset(id, flatCanceledOrder);
			await redis.lrem(openOrdersPath, 1, id);
			await redis.lpush(closedOrdersPath, id);

			return canceledOrder;
		} catch (err) {
			throw err;
		}
	};
};

export default createCancelOrder;