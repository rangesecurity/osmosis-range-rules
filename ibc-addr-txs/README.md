# Range Alert Rule: IBC Addr Txs

## Description

`IBCAddrTxs` is triggered when a large number of IBC transactions are detected for an address within short time duration.

This rule will only be processed only in a specified block interval `blockWindow`.`blockWidth` is the number of blocks that are fetched for processing.

## API for creating this rule

```typescript
interface IParameters {
  address: string;
  threshold: number;
  blockWidth: number;
  blockWindow: number;
}
```

## Sample alert events

> More than 1000 transactions detected for address osmo123... in last 700 blocks.

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=ibc-addr-txs npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
