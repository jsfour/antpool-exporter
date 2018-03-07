import * as request from "request-promise"
import * as crypto from "crypto";
import Config from "../config";
import * as t from "./types"
export * from "./types"

const BASE_URL = "https://antpool.com";

function constructBaseOpts(url: string, currency: string) {
    let params = buildMsg(Config.antpool.apiKey, currency)
    params.signature = sign(Config.antpool.userId, Config.antpool.apiKey, params.nonce)

    let opts = {
        method: "POST",
        uri: url,
        form: params
    };
    return opts;
}

function sign(user: string, key: string, nonce: string) {
    const hash = crypto.createHmac('sha256', Config.antpool.apiSecret)
        .update(user + key + nonce)
        .digest('hex');
    return hash.toUpperCase()
}

function buildMsg(key: string, coin: string): t.IMessage {
    return {
        key: key,
        nonce: Date.now().toString(),
        coin: coin
    }
}

function normalizeCurrency(currency: string) {
    return currency.toUpperCase()
}

export const getPoolStats = function (currency: string): Promise<t.IPoolStatsRes> {
    currency = normalizeCurrency(currency)
    let opts = constructBaseOpts(`${BASE_URL}/api/poolStats.htm`, currency)
    return request(opts)
        .then(JSON.parse)
}

export const getHashRate = function (currency: string): Promise<t.IHashrateRes> {
    currency = normalizeCurrency(currency)    
    let opts = constructBaseOpts(`${BASE_URL}/api/hashrate.htm`, currency)
    return request(opts)
        .then(JSON.parse)
}

export const getAccount = function (currency: string): Promise<t.IAccountRes> {
    currency = normalizeCurrency(currency)    
    let opts = constructBaseOpts(`${BASE_URL}/api/account.htm`, currency)
    return request(opts)
        .then(JSON.parse)

}