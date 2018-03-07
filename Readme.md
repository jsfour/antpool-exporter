# Antpool Prometheus Exporter

## Env vars
```
ANTPOOL_API_KEY
ANTPOOL_API_SECRET
PROMETHEUS_TOKEN << a token that prometheus will need to access the api
ANTPOOL_USER_ID
METRICS_PORT 
```

## Running

```
docker pull jsmootiv/antpool-exporter:latest
docker run -d \
        -e ANTPOOL_API_KEY={{URKEY}} \
        -e ANTPOOL_API_SECRET={{URSECRET}} \
        -e PROMETHEUS_TOKEN={{ATOKENPROMETHEUSSENDS}} \
        -e ANTPOOL_USER_ID={{THEUSERIDFROMANTPOOL}} \
        -e METRICS_PORT=3000\
        jsmootiv/antpool-exporter:latest
```