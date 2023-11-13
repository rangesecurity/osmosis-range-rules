# Range Alert Rule: IBC Channel Avg Pending Tx

## Description

`IBCChannelAvgPendingTx` is triggered when the pending transactions across a channel goes above the average within a specified time window by a certain percentage threshold.

This rule will only be processed only in a specified block interval `blockWindow`.`blockWidth` is the number of blocks that are fetched for processing.

## API for creating this rule

```typescript
interface IParameters {
  channelId: string;
  thresholdPerc: number;
  blockWidth: number;
  blockWindow: number;
}
```

## Sample alert events

> The number of pending transactions in channel-0 is 150 which is 50% higher from the average of 100 in the last 700 blocks.

## Severity

- **Medium**

## Development

After setting the env variables, you can run tests using `RULE=ibc-channel-avg-pending-tx npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
