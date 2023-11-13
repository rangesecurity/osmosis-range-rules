# Range Alert Rule: More than X txs in last hour

## Description

`MoreThanXTxsInLastHourService` is triggered when the number of transactions by an address reaches above a threshold.

## API for creating this rule

```typescript
interface IParameters {
  address: string;
}
```

## Sample alert events

> More than 100 transactions detected by osmo123... in last hour.

## Severity

- **Low**

## Development

After setting the env variables, you can run tests using `RULE=more-than-x-txs-in-last-hour npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
