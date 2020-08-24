import { backtest, BootData, boot } from "../../../src/algotia";

describe("Backtest", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				exchangeId: "bitstamp",
				timeout: 5000
			}
		});
	});
	afterAll(async () => {
		await bootData.client.close();
	});
	test("Backtest working", async () => {
		try {
			await backtest(bootData, {
				backfillName: "backfill-1",
				initialBalance: {
					base: 0,
					quote: 100
				},
				strategy: async (exchange, data) => {
					try {
						if (data.close > 0.01951351) {
							await exchange.createOrder("ETH/BTC", "market", "buy", 1);
						}
						console.log(await exchange.fetchOrders());
					} catch (err) {
						throw err;
					}
				}
			});
		} catch (err) {
			throw err;
		}
	});
});
