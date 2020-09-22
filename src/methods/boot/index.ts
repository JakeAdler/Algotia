import { Config, BootData, ExchangeConfig, SingleExchange } from "../../types/";
import validateConfig from "./validateConfig";
import connectExchange from "./connectExchange";
import createClient from "./createClient";
import createEventBus from "./createEventBus";
import createRedisClient from "./createRedisClient";
import { Tedis } from "tedis";
import { MongoClient } from "mongodb";
import { EventEmitter2 } from "eventemitter2";

interface Boot {
	<UserConfig extends Config>(config: UserConfig): Promise<{
		config: Config;
		exchange: {
			[ExchangeID in keyof UserConfig["exchange"]]: SingleExchange;
		};
		eventBus: EventEmitter2;
		mongoClient: MongoClient;
		redisClient: Tedis;
		quit: () => void;
	}>;
}
const boot: Boot = async <UserConfig extends Config>(
	configInput: UserConfig
) => {
	try {
		const config = validateConfig(configInput);
		const exchange = connectExchange<UserConfig["exchange"]>(config.exchange);
		const mongoClient = await createClient(config);
		const eventBus = createEventBus();
		const redisClient = createRedisClient();

		const quit = () => {
			mongoClient.close();
			redisClient.close();
		};

		const bootData = {
			config,
			exchange,
			mongoClient,
			eventBus,
			redisClient,
			quit
		};

		return bootData;
	} catch (err) {
		throw err;
	}
};

export default boot;
