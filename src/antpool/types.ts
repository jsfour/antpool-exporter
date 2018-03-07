

interface BaseRes {
    version: string;
    code: number;
    message: string;
}

export interface IPoolStatsRes extends BaseRes {
    data: {
        poolHashrate: string;
        activeWorkerNumber: string;
        poolStatus: string;
        networkDiff: string;
        estimateTime: string;
        currentRound: string;
        totalShareNumber: string;
        totalBlockNumber: string;
    }
}

export interface IHashrateRes extends BaseRes {
    data: {
        last10m: string;
        last30m: string;
        last1h: string;
        last1d: string;
        prev10m: string;
        prev30m: string;
        prev1h: string;
        prev1d: string;
        accepted: string;
        stale: string;
        dupelicate: string;
        other: string;
    }
}

export interface IAccountRes extends BaseRes {
    data: {
        earn24Hours: string;
        earnTotal: string;
        paidOut: string;
        balance: string;
    };
}

export interface IMessage {
    key: string;
    coin: string;
    nonce: string;
    signature?: string;
}