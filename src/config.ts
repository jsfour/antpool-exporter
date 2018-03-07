import * as DotEnv from "dotenv";
DotEnv.config()

export default {
    meticsPort: parseInt(process.env["METRICS_PORT"]) || 3000,
    prometheusAuthToken: process.env["PROMETHEUS_TOKEN"],
    antpool: {
        userId: process.env["ANTPOOL_USER_ID"],
        apiKey: process.env["ANTPOOL_API_KEY"],
        apiSecret: process.env["ANTPOOL_API_SECRET"],
        currencies: ["BTC", "BCH"]

    }
}