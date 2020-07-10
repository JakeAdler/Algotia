import { Exchange } from "ccxt";

import { boot } from "../../src/algotia";
import { ConfigOptions } from "../../src/types/index";

const mockBootConfig: ConfigOptions = {
	exchange: {
		exchangeId: "bitfinex",
		apiKey: "some string",
		apiSecret: "some string",
		timeout: 5000
	}
};

test("Boot function", async () => {
	try {
		const bootData = await boot(mockBootConfig);
		expect(bootData.config).toStrictEqual(mockBootConfig);
		expect(bootData.exchange).toBeInstanceOf(Exchange);
	} catch (err) {
		fail(err);
	}
}, 10000);
