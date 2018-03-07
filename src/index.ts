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

const balanceGuague = new Prometheus.Gauge({ 
    name: 'balance_gague', 
    help: 'Account balance',
    labelNames: ["currency"]

});

const earnedGuague = new Prometheus.Gauge({
    name: 'earned_gague',
    help: 'Account earned',
    labelNames: ["currency"]

});

const hashrateGague = new Prometheus.Gauge({
    name: 'hashrate_gague',
    help: 'Hashrate',
    labelNames: ["currency"]
});

const networkDificulty = new Prometheus.Gauge({
    name: 'network_dificulty_gague',
    help: 'Network Dificulty',
    labelNames: ["currency"]
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

    balanceGuague.set({ currency: currency }, parseFloat(accountData.data.balance))
    earnedGuague.set({ currency: currency }, parseFloat(accountData.data.earnTotal))
    hashrateGague.set({ currency: currency }, parseFloat(hashRate.data.last10m)) //TODO: could cause an issue
    networkDificulty.set({ currency: currency }, parseFloat(poolStats.data.networkDiff))
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