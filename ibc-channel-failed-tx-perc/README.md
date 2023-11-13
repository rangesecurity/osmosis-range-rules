# Range Alert Rule: IBC Channel Failed Tx Perc

## Description

`IBCChannelFailedTxPerc` is triggered when the failed transactions across a channel is higher than a certain threshold.

This rule will only be processed only in a specified block interval `blockWindow`.`blockWidth` is the number of blocks that are fetched for processing.

## API for creating this rule

```typescript
interface IParameters {
  blockWindow: number;
  blockWidth: number;
  thresholdPerc: number;
  channelId: string;
}
```

## Sample alert events

> The amount of failed transactions in channel-0 has exceeded 50% than the average of 233 in the last 700 blocks.

## Severity

- **Low**

## Development

After setting the env variables, you can run tests using `RULE=ibc-channel-failed-tx-perc npm run test:rule`.

You can execute the runner and parse range blocks using `npm run start:dev`
