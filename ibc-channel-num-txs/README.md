# Range Alert Rule: IBC Channel Num Txs

## Description

`IBCChannelNumTxs` is triggered when then number of IBC transactions for a channel is higher than the average within a time window.

This rule will only be processed only in a specified block interval `blockWindow`.`blockWidth` is the number of blocks that are fetched for processing.

## API for creating this rule

```typescript
interface IParameters {
  blockWidth: number;
  channelId: string;
  blockWindow: number;
  thresholdPerc: number;
}
```

## Sample alert events

> The amount of transactions in channel channel-0 has exceeded the average by 10% in the last 50 blocks.

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=ibc-channel-num-txs npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
