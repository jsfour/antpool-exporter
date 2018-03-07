import * as Antpool from "./antpool"
import * as Prometheus from "prom-client";
import * as Express from "express";
import * as BearerToken from "express-bearer-token";
import * as expressWinston from "express-winston";
import * as Bluebird from "bluebird"
import Log from "./log";
import config from "./config"

interface BearerRequest extends Express.Request {
    token: string
}

interface TimedResponse extends Express.Response {
    responseTime: number;
}

const PARAMS = ["currency", "pool"];

const balanceGauge = new Prometheus.Gauge({ 
    name: 'balance_gauge', 
    help: 'Account balance',
    labelNames: PARAMS

});

const earnedGauge = new Prometheus.Gauge({
    name: 'earned_gauge',
    help: 'Account earned',
    labelNames: PARAMS

});

const hashrateGauge = new Prometheus.Gauge({
    name: 'hashrate_gauge',
    help: 'Hashrate',
    labelNames: PARAMS
});

const networkDificultyGauge = new Prometheus.Gauge({
    name: 'network_dificulty_gauge',
    help: 'Network dificulty',
    labelNames: PARAMS
});

const poolHashrateGauge = new Prometheus.Gauge({
    name: 'pool_hashrate_gauge',
    help: 'Pool hashrate',
    labelNames: PARAMS
});

const activeWorkersGauge = new Prometheus.Gauge({
    name: 'active_workers_gauge',
    help: 'Active workers',
    labelNames: PARAMS
});

const authCheck = function (req: BearerRequest, res: Express.Response, next: Express.NextFunction) {
    if (req.token == config.prometheusAuthToken) {
        return next()
    }
    return res.status(401).send();
}

const updateData = async function(currency: string) {
    currency = currency.toLowerCase()
    let actions = [
        Antpool.getAccount(currency),
        Antpool.getHashRate(currency),
        Antpool.getPoolStats(currency)
    ]

    let result = await Bluebird.all(actions)
    let accountData: Antpool.IAccountRes = result[0];
    let hashRate: Antpool.IHashrateRes = result[1];
    let poolStats: Antpool.IPoolStatsRes = result[2];

    balanceGauge.set({ currency: currency, pool: "antpool" }, parseFloat(accountData.data.balance))
    earnedGauge.set({ currency: currency, pool: "antpool" }, parseFloat(accountData.data.earnTotal))
    hashrateGauge.set({ currency: currency, pool: "antpool" }, parseFloat(hashRate.data.last10m)) //TODO: could cause an issue since its an average
    networkDificultyGauge.set({ currency: currency, pool: "antpool" }, parseFloat(poolStats.data.networkDiff))
    poolHashrateGauge.set({ currency: currency, pool: "antpool" }, parseFloat(poolStats.data.poolHashrate))
    activeWorkersGauge.set({ currency: currency, pool: "antpool" }, parseFloat(poolStats.data.activeWorkerNumber))
    
}

const metricsHandler = async function (req: BearerRequest, res: Express.Response, next: Express.NextFunction) {
    let currencies = config.antpool.currencies
    await Bluebird.mapSeries(currencies, updateData)
    res.set('Content-Type', Prometheus.register.contentType);
    res.status(200).send(Prometheus.register.metrics())
}

const start = function (port: number) {
    const server = Express();

    server.use(expressWinston.logger({
        winstonInstance: Log,
        colorize: true
    }));

    server.use(BearerToken())
    server.use(authCheck)
    server.get('/metrics', metricsHandler);

    server.use(expressWinston.logger({
        winstonInstance: Log,
        colorize: true
    }));

    Log.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`)
    server.listen(port);
}

start(config.meticsPort)